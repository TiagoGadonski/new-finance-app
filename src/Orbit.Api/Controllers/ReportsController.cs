using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;

namespace Orbit.Api.Controllers;

[Route("api/[controller]")]
public class ReportsController : BaseAuthenticatedController
{
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Subscription> _subscriptionRepository;
    private readonly IRepository<Debt> _debtRepository;
    private readonly IRepository<Account> _accountRepository;

    public ReportsController(
        IRepository<Transaction> transactionRepository,
        IRepository<Subscription> subscriptionRepository,
        IRepository<Debt> debtRepository,
        IRepository<Account> accountRepository)
    {
        _transactionRepository = transactionRepository;
        _subscriptionRepository = subscriptionRepository;
        _debtRepository = debtRepository;
        _accountRepository = accountRepository;
    }

    [HttpGet("monthly")]
    public async Task<ActionResult<MonthlyReportDto>> GetMonthlyReport([FromQuery] int month, [FromQuery] int year)
    {
        var transactions = await _transactionRepository.FindAsync(
            t => t.FamilyId == FamilyId && t.Date.Month == month && t.Date.Year == year,
            t => t.Category);

        var totalIncome = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);
        var balance = totalIncome - totalExpenses;
        var savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        var expensesByCategory = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new CategorySummaryDto(g.Key.CategoryId, g.Key.Name, g.Sum(t => t.Amount), g.Count()))
            .OrderByDescending(c => c.Amount)
            .ToList();

        var incomeByCategory = transactions
            .Where(t => t.Type == TransactionType.Income)
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new CategorySummaryDto(g.Key.CategoryId, g.Key.Name, g.Sum(t => t.Amount), g.Count()))
            .OrderByDescending(c => c.Amount)
            .ToList();

        var topExpenses = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .OrderByDescending(t => t.Amount)
            .Take(10)
            .Select(t => new TopExpenseDto(t.Description, t.Amount, t.Category?.Name ?? "N/A", t.Date))
            .ToList();

        return Ok(new MonthlyReportDto(
            month, year, totalIncome, totalExpenses, balance, savingsRate,
            expensesByCategory, incomeByCategory, topExpenses
        ));
    }

    [HttpGet("cashflow")]
    public async Task<ActionResult<CashFlowForecastDto>> GetCashFlow([FromQuery] int months = 3)
    {
        var now = DateTime.UtcNow;
        var sixMonthsAgo = now.AddMonths(-6);

        // Get historical transactions for average calculation
        var historicalTransactions = await _transactionRepository.FindAsync(
            t => t.FamilyId == FamilyId && t.Date >= sixMonthsAgo && t.Date <= now);

        var monthCount = Math.Max(1, (int)((now - sixMonthsAgo).TotalDays / 30));
        var avgMonthlyIncome = historicalTransactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount) / monthCount;
        var avgMonthlyExpenses = historicalTransactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount) / monthCount;

        // Get fixed expenses (active subscriptions)
        var subscriptions = await _subscriptionRepository.FindAsync(
            s => s.FamilyId == FamilyId && s.Status == SubscriptionStatus.Active);
        var monthlyFixedExpenses = subscriptions.Sum(s => s.Amount);

        // Get debt payments
        var debts = await _debtRepository.FindAsync(d => d.FamilyId == FamilyId);
        var monthlyDebtPayments = debts.Sum(d => d.MinimumPayment);

        // Current balance
        var accounts = await _accountRepository.FindAsync(a => a.FamilyId == FamilyId && a.IsActive);
        var currentBalance = accounts.Sum(a => a.Balance);

        // Project cash flow
        var points = new List<CashFlowPointDto>();
        var projectedBalance = currentBalance;

        points.Add(new CashFlowPointDto(now, projectedBalance, "Hoje"));

        for (int i = 1; i <= months; i++)
        {
            var date = now.AddMonths(i);
            projectedBalance += avgMonthlyIncome - avgMonthlyExpenses;
            var label = date.ToString("MMM/yyyy");
            points.Add(new CashFlowPointDto(date, projectedBalance, label));
        }

        return Ok(new CashFlowForecastDto(
            points, projectedBalance, monthlyFixedExpenses + monthlyDebtPayments,
            avgMonthlyIncome, avgMonthlyExpenses
        ));
    }

    [HttpGet("comparison")]
    public async Task<ActionResult<PeriodComparisonDto>> GetComparison(
        [FromQuery] int month1, [FromQuery] int year1,
        [FromQuery] int month2, [FromQuery] int year2)
    {
        var report1 = await BuildMonthlyReport(month1, year1);
        var report2 = await BuildMonthlyReport(month2, year2);

        var incomeChange = report2.TotalIncome - report1.TotalIncome;
        var expenseChange = report2.TotalExpenses - report1.TotalExpenses;
        var balanceChange = report2.Balance - report1.Balance;

        var incomeChangePercentage = report1.TotalIncome > 0 ? (incomeChange / report1.TotalIncome) * 100 : 0;
        var expenseChangePercentage = report1.TotalExpenses > 0 ? (expenseChange / report1.TotalExpenses) * 100 : 0;

        return Ok(new PeriodComparisonDto(
            report1, report2, incomeChange, expenseChange, balanceChange,
            incomeChangePercentage, expenseChangePercentage
        ));
    }

    private async Task<MonthlyReportDto> BuildMonthlyReport(int month, int year)
    {
        var transactions = await _transactionRepository.FindAsync(
            t => t.FamilyId == FamilyId && t.Date.Month == month && t.Date.Year == year,
            t => t.Category);

        var totalIncome = transactions.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
        var totalExpenses = transactions.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);
        var balance = totalIncome - totalExpenses;
        var savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

        var expensesByCategory = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new CategorySummaryDto(g.Key.CategoryId, g.Key.Name, g.Sum(t => t.Amount), g.Count()))
            .OrderByDescending(c => c.Amount)
            .ToList();

        var incomeByCategory = transactions
            .Where(t => t.Type == TransactionType.Income)
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new CategorySummaryDto(g.Key.CategoryId, g.Key.Name, g.Sum(t => t.Amount), g.Count()))
            .OrderByDescending(c => c.Amount)
            .ToList();

        var topExpenses = transactions
            .Where(t => t.Type == TransactionType.Expense)
            .OrderByDescending(t => t.Amount)
            .Take(10)
            .Select(t => new TopExpenseDto(t.Description, t.Amount, t.Category?.Name ?? "N/A", t.Date))
            .ToList();

        return new MonthlyReportDto(
            month, year, totalIncome, totalExpenses, balance, savingsRate,
            expensesByCategory, incomeByCategory, topExpenses
        );
    }
}
