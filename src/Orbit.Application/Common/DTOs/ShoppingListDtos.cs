using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

// DTO de visualização completa
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

// DTO de item
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

// Request para criar lista
public record CreateShoppingListRequest(
    string Name,
    string? Description,
    DateTime? TargetDate
);

// Request para atualizar lista
public record UpdateShoppingListRequest(
    string Name,
    string? Description,
    DateTime? TargetDate,
    ShoppingListStatus Status
);

// Request para criar item
public record CreateShoppingItemRequest(
    string Name,
    int Quantity,
    decimal EstimatedPrice,
    string? Category,
    ItemPriority Priority
);

// Request para atualizar item
public record UpdateShoppingItemRequest(
    string Name,
    int Quantity,
    decimal EstimatedPrice,
    decimal? ActualPrice,
    string? Category,
    ItemPriority Priority,
    bool IsPurchased
);

// Request para marcar item como comprado
public record MarkItemPurchasedRequest(
    bool CreateTransaction,
    decimal? ActualPrice,
    Guid? AccountId,
    Guid? CategoryId
);
