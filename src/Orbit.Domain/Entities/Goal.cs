using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class Goal : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public DateTime TargetDate { get; set; }
    public GoalStatus Status { get; set; }

    // Navigation properties
    public Family Family { get; set; } = null!;

    public decimal PercentageAchieved => TargetAmount > 0 ? (CurrentAmount / TargetAmount) * 100 : 0;
    public decimal RemainingAmount => TargetAmount - CurrentAmount;
}
