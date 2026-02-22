using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class TransactionTemplate : BaseEntity
{
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid AccountId { get; set; }
    public Guid CategoryId { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public string? Description { get; set; }
    public string? Tags { get; set; }

    // Navigation properties
    public Family Family { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
