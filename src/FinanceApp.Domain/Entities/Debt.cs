namespace FinanceApp.Domain.Entities;

public class Debt : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal InterestRate { get; set; }
    public decimal MinimumPayment { get; set; }
    public DateTime? DueDate { get; set; }

    // Navigation properties
    public Family Family { get; set; } = null!;

    public decimal TotalInterest => TotalAmount - RemainingAmount;
}
