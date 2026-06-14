namespace Orbit.Domain.Entities;

public class RecurringIncome : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsActive { get; set; } = true;

    public Family Family { get; set; } = null!;
}
