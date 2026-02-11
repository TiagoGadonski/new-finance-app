using FinanceApp.Domain.Enums;

namespace FinanceApp.Domain.Entities;

public class Investment : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public InvestmentType Type { get; set; }
    public string? Symbol { get; set; }
    public decimal Quantity { get; set; }
    public decimal AveragePrice { get; set; }
    public decimal CurrentPrice { get; set; }
    public string Currency { get; set; } = "BRL";
    public Guid? AccountId { get; set; }

    // Navigation properties
    public Family Family { get; set; } = null!;
    public Account? Account { get; set; }
    public ICollection<InvestmentTransaction> InvestmentTransactions { get; set; } = new List<InvestmentTransaction>();
}
