namespace FinanceApp.Application.Common.DTOs;

public record BudgetDto(
    Guid Id,
    Guid CategoryId,
    string CategoryName,
    decimal Limit,
    decimal Spent,
    decimal Remaining,
    decimal PercentageUsed,
    int Month,
    int Year,
    bool ShouldAlert,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record CreateBudgetRequest(
    Guid CategoryId,
    decimal Limit,
    int Month,
    int Year
);

public record UpdateBudgetRequest(
    decimal Limit
);

public record BudgetConsolidatedDto(
    int Month,
    int Year,
    decimal TotalLimit,
    decimal TotalSpent,
    List<BudgetDto> Budgets
);
