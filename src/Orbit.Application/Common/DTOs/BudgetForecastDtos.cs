namespace Orbit.Application.Common.DTOs;

public record BudgetForecastRequestDto(int Months, decimal? InitialBalance);

public record MonthForecastDto(
    string Month,
    decimal Income,
    decimal FixedExpenses,
    decimal DebtInstallments,
    decimal Total,
    decimal Surplus,
    decimal AccumulatedBalance,
    IReadOnlyList<string> EndingThisMonth
);

public record BudgetForecastResultDto(
    decimal MonthlyIncome,
    decimal RecurringFixedTotal,
    IReadOnlyList<MonthForecastDto> Months
);

public record RecurringIncomeDto(
    Guid Id,
    string Description,
    decimal Amount,
    bool IsActive,
    string? CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record CreateRecurringIncomeRequest(string Description, decimal Amount);
public record UpdateRecurringIncomeRequest(string Description, decimal Amount, bool IsActive);
