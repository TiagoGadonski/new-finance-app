namespace FinanceApp.Domain.Entities;

public class RoundupRule : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid SourceAccountId { get; set; }
    public Guid DestinationAccountId { get; set; }
    public bool IsActive { get; set; }
    public decimal Multiplier { get; set; } = 1.0m; // 1.0 = arredonda para próximo real, 2.0 = dobro, etc

    // Navigation properties
    public User User { get; set; } = null!;
    public Account SourceAccount { get; set; } = null!;
    public Account DestinationAccount { get; set; } = null!;
}
