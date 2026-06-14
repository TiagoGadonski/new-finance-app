using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class InvestmentTransaction : BaseEntity
{
    public Guid InvestmentId { get; set; }
    public InvestmentTransactionType Type { get; set; }
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public DateTime Date { get; set; }
    public decimal Fees { get; set; }

    public Investment Investment { get; set; } = null!;
}
