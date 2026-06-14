using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

public record ShoppingListDto(
    Guid Id,
    string Name,
    string? Description,
    DateTime? TargetDate,
    ShoppingListStatus Status,
    int TotalItems,
    int PurchasedItems,
    decimal CompletionPercentage,
    decimal TotalEstimatedCost,
    decimal TotalSpent,
    decimal RemainingBudget,
    List<ShoppingItemDto> Items,
    DateTime CreatedAt
);

public record ShoppingItemDto(
    Guid Id,
    string Name,
    int Quantity,
    decimal EstimatedPrice,
    decimal? ActualPrice,
    decimal TotalEstimated,
    decimal TotalActual,
    string? Category,
    ItemPriority Priority,
    bool IsPurchased,
    Guid? TransactionId,
    DateTime? PurchasedDate
);

public record CreateShoppingListRequest(
    string Name,
    string? Description,
    DateTime? TargetDate
);

public record UpdateShoppingListRequest(
    string Name,
    string? Description,
    DateTime? TargetDate,
    ShoppingListStatus Status
);

public record CreateShoppingItemRequest(
    string Name,
    int Quantity,
    decimal EstimatedPrice,
    string? Category,
    ItemPriority Priority
);

public record UpdateShoppingItemRequest(
    string Name,
    int Quantity,
    decimal EstimatedPrice,
    decimal? ActualPrice,
    string? Category,
    ItemPriority Priority,
    bool IsPurchased
);

public record MarkItemPurchasedRequest(
    bool CreateTransaction,
    decimal? ActualPrice,
    Guid? AccountId,
    Guid? CategoryId
);
