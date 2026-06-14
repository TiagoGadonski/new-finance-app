namespace Orbit.Domain.Entities;

public class ExpenseSplitItem : BaseEntity
{
    public Guid ExpenseSplitId { get; set; }
    public Guid? UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsPaid { get; set; }
    public DateTime? PaidAt { get; set; }

    public ExpenseSplit ExpenseSplit { get; set; } = null!;
    public User? User { get; set; }
}
