using FinanceApp.Domain.Enums;

namespace FinanceApp.Domain.Entities;

public class InvestmentTransaction : BaseEntity
{
    public Guid InvestmentId { get; set; }
    public InvestmentTransactionType Type { get; set; }
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public DateTime Date { get; set; }
    public decimal Fees { get; set; }

    // Navigation properties
    public Investment Investment { get; set; } = null!;
}
