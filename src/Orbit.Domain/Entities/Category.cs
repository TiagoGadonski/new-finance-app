using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class Category : AuditableEntity
{
    public Guid? FamilyId { get; set; }  // Nullable: null = default category, otherwise family-specific
    public string Name { get; set; } = string.Empty;
    public TransactionType Type { get; set; }
    public string? Icon { get; set; }
    public string? Color { get; set; }
    public bool IsDefault { get; set; }

    public Family? Family { get; set; }
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
}
