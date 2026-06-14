using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class Subscription : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public Guid CategoryId { get; set; }
    public Guid AccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int BillingDay { get; set; }
    public SubscriptionStatus Status { get; set; }
    public DateTime? NextBillingDate { get; set; }
    public int UsageCount { get; set; } // Quantas vezes foi usado no perÃ­odo
    public DateTime? LastUsedAt { get; set; }
    public DateTime? LastPaidAt { get; set; }

    public Family Family { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public Account Account { get; set; } = null!;

    public bool IsLowUsage => UsageCount < 2; // Menos de 2 usos no mÃªs
    public bool ShouldNotifyRenewal(DateTime currentDate)
    {
        if (NextBillingDate == null) return false;
        var daysUntilRenewal = (NextBillingDate.Value - currentDate).Days;
        return daysUntilRenewal <= 3 && daysUntilRenewal >= 0;
    }
}
