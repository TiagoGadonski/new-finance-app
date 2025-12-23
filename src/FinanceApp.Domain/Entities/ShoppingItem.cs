namespace FinanceApp.Domain.Entities;

public class ShoppingItem : BaseEntity
{
    public Guid ShoppingListId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal EstimatedPrice { get; set; }
    public decimal? ActualPrice { get; set; }
    public string? Category { get; set; }
    public Enums.ItemPriority Priority { get; set; }
    public bool IsPurchased { get; set; }
    public Guid? TransactionId { get; set; }
    public DateTime? PurchasedDate { get; set; }

    public ShoppingList ShoppingList { get; set; } = null!;
    public Transaction? Transaction { get; set; }

    public decimal TotalEstimated => EstimatedPrice * Quantity;
    public decimal TotalActual => (ActualPrice ?? EstimatedPrice) * Quantity;
}
