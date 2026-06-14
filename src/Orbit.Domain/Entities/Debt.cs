namespace Orbit.Domain.Entities;

public class Debt : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal? TotalAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public decimal InterestRate { get; set; }
    public decimal MinimumPayment { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime? LastPaidAt { get; set; }
    public int? InstallmentsRemaining { get; set; }

    public Family Family { get; set; } = null!;

    public decimal? TotalInterest => TotalAmount.HasValue ? TotalAmount.Value - RemainingAmount : null;
    public bool IsSettled => TotalAmount.HasValue && RemainingAmount <= 0;
}
