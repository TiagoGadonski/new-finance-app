namespace FinanceApp.Domain.Entities;

public class Budget : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid CategoryId { get; set; }
    public decimal Limit { get; set; }
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal Spent { get; set; }
    public bool AlertSent { get; set; }

    // Navigation properties
    public User User { get; set; } = null!;
    public Category Category { get; set; } = null!;

    public decimal PercentageUsed => Limit > 0 ? (Spent / Limit) * 100 : 0;
    public bool ShouldAlert => PercentageUsed >= 80 && !AlertSent;
}
