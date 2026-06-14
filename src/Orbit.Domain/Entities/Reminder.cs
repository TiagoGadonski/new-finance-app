namespace Orbit.Domain.Entities;

public class Reminder : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Month { get; set; }
    public int Day { get; set; }
    public bool IsRecurring { get; set; } = true;
    public int DaysInAdvance { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public Family Family { get; set; } = null!;
}
