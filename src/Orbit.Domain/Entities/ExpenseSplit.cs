namespace Orbit.Domain.Entities;

public class ExpenseSplit : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public Guid? TransactionId { get; set; }
    public decimal TotalAmount { get; set; }
    public string Description { get; set; } = string.Empty;

    // Navigation properties
    public Family Family { get; set; } = null!;
    public Transaction? Transaction { get; set; }
    public ICollection<ExpenseSplitItem> Items { get; set; } = new List<ExpenseSplitItem>();
}
