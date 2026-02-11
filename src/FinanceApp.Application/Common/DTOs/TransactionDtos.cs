using FinanceApp.Domain.Enums;

namespace FinanceApp.Application.Common.DTOs;

public record TransactionDto(
    Guid Id,
    Guid AccountId,
    Guid CategoryId,
    decimal Amount,
    TransactionType Type,
    string Description,
    DateTime Date,
    bool IsRecurring,
    string? Tags,
    string AccountName,
    string CategoryName,
    int? InstallmentCount,
    int? CurrentInstallment,
    Guid? ParentTransactionId,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record CreateTransactionRequest(
    Guid AccountId,
    Guid CategoryId,
    decimal Amount,
    TransactionType Type,
    string Description,
    DateTime Date,
    bool IsRecurring = false,
    string? Tags = null,
    int? InstallmentCount = null
);

public record UpdateTransactionRequest(
    Guid CategoryId,
    decimal Amount,
    string Description,
    DateTime Date,
    bool IsRecurring,
    string? Tags
);

public record TransactionSummaryDto(
    decimal TotalIncome,
    decimal TotalExpense,
    decimal Balance,
    int Month,
    int Year,
    List<CategorySummaryDto> CategoryBreakdown
);

public record CategorySummaryDto(
    Guid CategoryId,
    string CategoryName,
    decimal Amount,
    int TransactionCount
);

public record ImportCsvRequest(
    Guid AccountId,
    string CsvContent
);
