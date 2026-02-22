namespace Orbit.Application.Common.DTOs;

public record ExpenseSplitDto(
    Guid Id,
    Guid? TransactionId,
    decimal TotalAmount,
    string Description,
    List<ExpenseSplitItemDto> Items,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record ExpenseSplitItemDto(
    Guid Id,
    Guid? UserId,
    string Username,
    decimal Amount,
    bool IsPaid,
    DateTime? PaidAt
);

public record CreateExpenseSplitRequest(
    Guid? TransactionId,
    decimal TotalAmount,
    string Description,
    List<CreateExpenseSplitItemRequest> Items
);

public record CreateExpenseSplitItemRequest(
    Guid? UserId,
    string Username,
    decimal Amount
);
