namespace Orbit.Application.Common.DTOs;

public record DashboardSummaryDto(
    decimal NetWorth,
    decimal TotalAssets,
    decimal TotalDebts,
    decimal MonthlyIncome,
    decimal MonthlyExpenses,
    decimal SavingsRate,
    FinancialHealthScoreDto HealthScore,
    List<MonthlyEvolutionDto> MonthlyEvolution,
    int ActiveAlerts,
    List<AccountBalanceDto> AccountBalances
);

public record MonthlyEvolutionDto(
    int Month,
    int Year,
    string Label,
    decimal Income,
    decimal Expenses,
    decimal Balance
);

public record FinancialHealthScoreDto(
    int Score,
    string Rating,
    decimal SavingsRate,
    decimal DebtToIncomeRatio,
    decimal EmergencyFundMonths,
    decimal BudgetAdherence
);

public record AccountBalanceDto(
    Guid Id,
    string Name,
    string Type,
    decimal Balance,
    string Currency
);
