namespace FinanceApp.Domain.Entities;

public class ShoppingList : BaseEntity
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? TargetDate { get; set; }
    public Enums.ShoppingListStatus Status { get; set; }

    public User User { get; set; } = null!;
    public ICollection<ShoppingItem> Items { get; set; } = new List<ShoppingItem>();

    // Propriedades calculadas
    public decimal TotalEstimatedCost => Items.Sum(i => i.EstimatedPrice * i.Quantity);
    public decimal TotalSpent => Items.Where(i => i.IsPurchased).Sum(i => (i.ActualPrice ?? i.EstimatedPrice) * i.Quantity);
    public int TotalItems => Items.Count;
    public int PurchasedItems => Items.Count(i => i.IsPurchased);
    public decimal CompletionPercentage => TotalItems > 0 ? ((decimal)PurchasedItems / TotalItems) * 100 : 0;
    public decimal RemainingBudget => TotalEstimatedCost - TotalSpent;
}
