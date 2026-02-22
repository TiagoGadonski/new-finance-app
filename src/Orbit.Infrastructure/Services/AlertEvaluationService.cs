using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;
using Orbit.Domain.Interfaces;
using Orbit.Infrastructure.Data;

namespace Orbit.Infrastructure.Services;

public class AlertEvaluationService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AlertEvaluationService> _logger;
    private readonly TimeSpan _interval;

    public AlertEvaluationService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<AlertEvaluationService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        var hours = configuration.GetValue("AlertEvaluation:IntervalHours", 6);
        _interval = TimeSpan.FromHours(hours);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AlertEvaluationService started. Interval: {Interval}h", _interval.TotalHours);

        // Wait a bit on startup to let the app fully initialize
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await EvaluateAllAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during alert evaluation cycle");
            }

            await Task.Delay(_interval, stoppingToken);
        }
    }

    private async Task EvaluateAllAsync(CancellationToken ct)
    {
        _logger.LogInformation("Starting alert evaluation cycle...");

        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var telegram = scope.ServiceProvider.GetRequiredService<ITelegramService>();

        var today = DateTime.UtcNow.Date;

        var families = await db.Families
            .Where(f => f.IsActive)
            .Select(f => f.Id)
            .ToListAsync(ct);

        foreach (var familyId in families)
        {
            try
            {
                await EvaluateFamilyAsync(db, telegram, familyId, today, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating alerts for family {FamilyId}", familyId);
            }
        }

        _logger.LogInformation("Alert evaluation cycle completed. Evaluated {Count} families.", families.Count);
    }

    private async Task EvaluateFamilyAsync(
        ApplicationDbContext db,
        ITelegramService telegram,
        Guid familyId,
        DateTime today,
        CancellationToken ct)
    {
        var alertConfigs = await db.AlertConfigurations
            .Where(a => a.FamilyId == familyId && a.IsActive)
            .ToListAsync(ct);

        foreach (var config in alertConfigs)
        {
            switch (config.Type)
            {
                case AlertType.BudgetWarning:
                    await EvaluateBudgetWarnings(db, telegram, familyId, config, today, ct);
                    break;
                case AlertType.BillDue:
                    await EvaluateBillsDue(db, telegram, familyId, config, today, ct);
                    break;
                case AlertType.DebtDue:
                    await EvaluateDebtsDue(db, telegram, familyId, config, today, ct);
                    break;
                case AlertType.NegativeBalance:
                    await EvaluateNegativeBalances(db, telegram, familyId, config, today, ct);
                    break;
                case AlertType.GoalNearTarget:
                    await EvaluateGoalsNearTarget(db, telegram, familyId, config, today, ct);
                    break;
                case AlertType.LastBusinessDay:
                    await EvaluateLastBusinessDay(db, telegram, familyId, config, today, ct);
                    break;
            }
        }

        // Evaluate reminders (independent of AlertConfiguration)
        await EvaluateReminders(db, telegram, familyId, today, ct);
    }

    private async Task EvaluateBudgetWarnings(
        ApplicationDbContext db, ITelegramService telegram,
        Guid familyId, AlertConfiguration config, DateTime today, CancellationToken ct)
    {
        var threshold = config.Threshold ?? 80m;
        var budgets = await db.Budgets
            .Include(b => b.Category)
            .Where(b => b.FamilyId == familyId && b.Month == today.Month && b.Year == today.Year && !b.AlertSent)
            .ToListAsync(ct);

        foreach (var budget in budgets)
        {
            if (budget.PercentageUsed >= threshold)
            {
                var title = $"Orcamento de {budget.Category.Name} em {budget.PercentageUsed:F0}%";
                var message = $"Voce ja gastou R$ {budget.Spent:N2} de R$ {budget.Limit:N2} no orcamento de {budget.Category.Name}.";

                await DeliverAlert(db, telegram, familyId, config.Channel, title, message, "/budgets", today, ct);

                budget.AlertSent = true;
                db.Budgets.Update(budget);
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task EvaluateBillsDue(
        ApplicationDbContext db, ITelegramService telegram,
        Guid familyId, AlertConfiguration config, DateTime today, CancellationToken ct)
    {
        var subscriptions = await db.Subscriptions
            .Where(s => s.FamilyId == familyId && s.Status == SubscriptionStatus.Active)
            .ToListAsync(ct);

        foreach (var sub in subscriptions)
        {
            if (sub.ShouldNotifyRenewal(today))
            {
                var daysLeft = sub.NextBillingDate.HasValue ? (sub.NextBillingDate.Value - today).Days : 0;
                var title = $"{sub.Name} vence em {daysLeft} dia(s)";
                var message = $"A assinatura {sub.Name} (R$ {sub.Amount:N2}) vence em {sub.NextBillingDate:dd/MM/yyyy}.";

                await DeliverAlert(db, telegram, familyId, config.Channel, title, message, "/monthly-bills", today, ct);
            }
        }
    }

    private async Task EvaluateDebtsDue(
        ApplicationDbContext db, ITelegramService telegram,
        Guid familyId, AlertConfiguration config, DateTime today, CancellationToken ct)
    {
        var debts = await db.Debts
            .Where(d => d.FamilyId == familyId && d.DueDate != null && d.RemainingAmount > 0)
            .ToListAsync(ct);

        foreach (var debt in debts)
        {
            var daysUntilDue = (debt.DueDate!.Value - today).Days;
            if (daysUntilDue is >= 0 and <= 3)
            {
                var title = $"Divida {debt.Name} vence em {daysUntilDue} dia(s)";
                var message = $"A divida {debt.Name} (R$ {debt.RemainingAmount:N2}) vence em {debt.DueDate:dd/MM/yyyy}.";

                await DeliverAlert(db, telegram, familyId, config.Channel, title, message, "/monthly-bills", today, ct);
            }
        }
    }

    private async Task EvaluateNegativeBalances(
        ApplicationDbContext db, ITelegramService telegram,
        Guid familyId, AlertConfiguration config, DateTime today, CancellationToken ct)
    {
        var accounts = await db.Accounts
            .Where(a => a.FamilyId == familyId && a.IsActive && a.Balance < 0)
            .ToListAsync(ct);

        foreach (var account in accounts)
        {
            var title = $"Saldo negativo em {account.Name}";
            var message = $"A conta {account.Name} esta com saldo negativo: R$ {account.Balance:N2}.";

            await DeliverAlert(db, telegram, familyId, config.Channel, title, message, "/dashboard", today, ct);
        }
    }

    private async Task EvaluateGoalsNearTarget(
        ApplicationDbContext db, ITelegramService telegram,
        Guid familyId, AlertConfiguration config, DateTime today, CancellationToken ct)
    {
        var threshold = config.Threshold ?? 90m;
        var goals = await db.Goals
            .Where(g => g.FamilyId == familyId && g.Status == GoalStatus.Active)
            .ToListAsync(ct);

        foreach (var goal in goals)
        {
            if (goal.PercentageAchieved >= threshold)
            {
                var title = $"Meta {goal.Name} em {goal.PercentageAchieved:F0}%!";
                var message = $"A meta {goal.Name} esta em {goal.PercentageAchieved:F0}%! Faltam R$ {goal.RemainingAmount:N2}.";

                await DeliverAlert(db, telegram, familyId, config.Channel, title, message, "/goals", today, ct);
            }
        }
    }

    private async Task EvaluateLastBusinessDay(
        ApplicationDbContext db, ITelegramService telegram,
        Guid familyId, AlertConfiguration config, DateTime today, CancellationToken ct)
    {
        var lastBusinessDay = await CalculateLastBusinessDay(db, familyId, today, ct);

        if (today == lastBusinessDay)
        {
            var title = "Ultimo dia util do mes!";
            var message = "Hoje e o ultimo dia util do mes. Nao esqueca de lancar suas horas!";

            await DeliverAlert(db, telegram, familyId, config.Channel, title, message, "/trabalho", today, ct);
        }
    }

    private async Task EvaluateReminders(
        ApplicationDbContext db, ITelegramService telegram,
        Guid familyId, DateTime today, CancellationToken ct)
    {
        var reminders = await db.Reminders
            .Where(r => r.FamilyId == familyId && r.IsActive)
            .ToListAsync(ct);

        foreach (var reminder in reminders)
        {
            var targetDate = new DateTime(today.Year, reminder.Month, reminder.Day);
            var alertDate = targetDate.AddDays(-reminder.DaysInAdvance);

            if (alertDate.Month == today.Month && alertDate.Day == today.Day)
            {
                var daysUntil = (targetDate - today).Days;
                string title;
                string message;

                if (daysUntil == 0)
                {
                    title = $"Hoje: {reminder.Name}";
                    message = reminder.Description ?? $"Lembrete: {reminder.Name} e hoje!";
                }
                else
                {
                    title = $"{reminder.Name} em {daysUntil} dia(s)";
                    message = reminder.Description ?? $"Lembrete: {reminder.Name} e em {daysUntil} dia(s) ({targetDate:dd/MM}).";
                }

                // Reminders always deliver both InApp + Telegram (if configured)
                await DeliverAlert(db, telegram, familyId, AlertChannel.Both, title, message, "/alerts", today, ct);
            }
        }
    }

    private async Task DeliverAlert(
        ApplicationDbContext db, ITelegramService telegram,
        Guid familyId, AlertChannel channel,
        string title, string message, string link,
        DateTime today, CancellationToken ct)
    {
        // Dedup: skip if same title already exists today for this family
        var exists = await db.Notifications.AnyAsync(
            n => n.FamilyId == familyId && n.Title == title && n.CreatedAt.Date == today,
            ct);

        if (exists)
            return;

        // InApp or Both -> create Notification entity
        if (channel == AlertChannel.InApp || channel == AlertChannel.Both)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                FamilyId = familyId,
                Title = title,
                Message = message,
                Type = NotificationType.Alert,
                IsRead = false,
                Link = link,
                CreatedAt = DateTime.UtcNow
            };

            await db.Notifications.AddAsync(notification, ct);
            await db.SaveChangesAsync(ct);
        }

        // Telegram or Both -> send via Telegram
        if (channel == AlertChannel.Telegram || channel == AlertChannel.Both)
        {
            if (telegram.IsConfigured)
            {
                var telegramMessage = $"<b>{title}</b>\n{message}";
                await telegram.SendMessageAsync(telegramMessage);
            }
        }
    }

    private async Task<DateTime> CalculateLastBusinessDay(
        ApplicationDbContext db, Guid familyId, DateTime today, CancellationToken ct)
    {
        // Get holidays for this family and month
        var holidays = await db.Holidays
            .Where(h => h.FamilyId == familyId)
            .ToListAsync(ct);

        var holidayDates = new HashSet<DateTime>();
        foreach (var h in holidays)
        {
            if (h.IsFixed && h.Month.HasValue && h.Day.HasValue)
            {
                holidayDates.Add(new DateTime(today.Year, h.Month.Value, h.Day.Value));
            }
            else if (!h.IsFixed && h.EasterOffset.HasValue)
            {
                var easter = CalculateEaster(today.Year);
                holidayDates.Add(easter.AddDays(h.EasterOffset.Value));
            }
        }

        // Find last day of current month, then walk backwards to find last business day
        var lastDay = new DateTime(today.Year, today.Month, DateTime.DaysInMonth(today.Year, today.Month));

        while (lastDay.DayOfWeek == DayOfWeek.Saturday ||
               lastDay.DayOfWeek == DayOfWeek.Sunday ||
               holidayDates.Contains(lastDay))
        {
            lastDay = lastDay.AddDays(-1);
        }

        return lastDay;
    }

    private static DateTime CalculateEaster(int year)
    {
        // Anonymous Gregorian algorithm
        int a = year % 19;
        int b = year / 100;
        int c = year % 100;
        int d = b / 4;
        int e = b % 4;
        int f = (b + 8) / 25;
        int g = (b - f + 1) / 3;
        int h = (19 * a + b - d - g + 15) % 30;
        int i = c / 4;
        int k = c % 4;
        int l = (32 + 2 * e + 2 * i - h - k) % 7;
        int m = (a + 11 * h + 22 * l) / 451;
        int month = (h + l - 7 * m + 114) / 31;
        int day = ((h + l - 7 * m + 114) % 31) + 1;

        return new DateTime(year, month, day);
    }
}
