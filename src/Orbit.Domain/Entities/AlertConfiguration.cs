using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class AlertConfiguration : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public Guid? UserId { get; set; }
    public AlertType Type { get; set; }
    public decimal? Threshold { get; set; }
    public bool IsActive { get; set; } = true;
    public AlertChannel Channel { get; set; } = AlertChannel.InApp;
    public string? CronSchedule { get; set; }

    // Navigation properties
    public Family Family { get; set; } = null!;
    public User? User { get; set; }
}
