using Orbit.Application.Common.Interfaces;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;
using Orbit.Domain.Interfaces;

namespace Orbit.Application.Features.BudgetForecast;

public class BudgetForecastService : IBudgetForecastService
{
    private readonly IRepository<RecurringIncome> _incomeRepo;
    private readonly IRepository<TransactionTemplate> _templateRepo;
    private readonly IRepository<Subscription> _subscriptionRepo;
    private readonly IRepository<Debt> _debtRepo;

    public BudgetForecastService(
        IRepository<RecurringIncome> incomeRepo,
        IRepository<TransactionTemplate> templateRepo,
        IRepository<Subscription> subscriptionRepo,
        IRepository<Debt> debtRepo)
    {
        _incomeRepo = incomeRepo;
        _templateRepo = templateRepo;
        _subscriptionRepo = subscriptionRepo;
        _debtRepo = debtRepo;
    }

    public async Task<BudgetForecastResultDto> GenerateAsync(
        int months, decimal? initialBalance, Guid familyId,
        CancellationToken cancellationToken = default)
    {
        var incomes = await _incomeRepo.FindAsync(r => r.FamilyId == familyId && r.IsActive);
        var templates = await _templateRepo.FindAsync(t =>
            t.FamilyId == familyId && t.Type == TransactionType.Expense);
        var subscriptions = await _subscriptionRepo.FindAsync(s =>
            s.FamilyId == familyId && s.Status == SubscriptionStatus.Active);
        var debts = await _debtRepo.FindAsync(d =>
            d.FamilyId == familyId && !(d.TotalAmount.HasValue && d.RemainingAmount <= 0));

        var monthlyIncome = incomes.Sum(r => r.Amount);
        var recurringFixedTotal = templates.Sum(t => t.Amount);

        var now = DateTime.UtcNow;
        var forecastMonths = new List<MonthForecastDto>();
        decimal accumulatedBalance = initialBalance ?? 0m;

        for (int i = 0; i < months; i++)
        {
            var targetDate = new DateTime(now.Year, now.Month, 1).AddMonths(i);
            var monthLabel = targetDate.ToString("MMM/yy",
                new System.Globalization.CultureInfo("pt-BR"));

            var fixedExpenses = recurringFixedTotal + subscriptions.Sum(s => s.Amount);

            decimal debtInstallments = 0m;
            var endingThisMonth = new List<string>();

            foreach (var debt in debts)
            {
                int remaining = debt.InstallmentsRemaining
                    ?? (debt.MinimumPayment > 0
                        ? (int)Math.Ceiling(debt.RemainingAmount / debt.MinimumPayment)
                        : 0);

                int remainingAtMonth = remaining - i;

                if (remainingAtMonth > 0)
                {
                    debtInstallments += debt.MinimumPayment;
                    if (remainingAtMonth == 1)
                        endingThisMonth.Add(debt.Name);
                }
            }

            var total = fixedExpenses + debtInstallments;
            var surplus = monthlyIncome - total;
            accumulatedBalance += surplus;

            forecastMonths.Add(new MonthForecastDto(
                Month: monthLabel,
                Income: monthlyIncome,
                FixedExpenses: fixedExpenses,
                DebtInstallments: debtInstallments,
                Total: total,
                Surplus: surplus,
                AccumulatedBalance: accumulatedBalance,
                EndingThisMonth: endingThisMonth.AsReadOnly()
            ));
        }

        return new BudgetForecastResultDto(
            MonthlyIncome: monthlyIncome,
            RecurringFixedTotal: recurringFixedTotal,
            Months: forecastMonths.AsReadOnly()
        );
    }
}
