using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class Account : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public AccountType Type { get; set; }
    public decimal Balance { get; set; }
    public string? Color { get; set; }
    public string Currency { get; set; } = "BRL";
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public Family Family { get; set; } = null!;
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
