using FinanceApp.Domain.Enums;

namespace FinanceApp.Domain.Entities;

public class Transaction : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid AccountId { get; set; }
    public Guid CategoryId { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public bool IsRecurring { get; set; }
    public string? Tags { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
