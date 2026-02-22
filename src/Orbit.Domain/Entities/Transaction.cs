using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class Transaction : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public Guid AccountId { get; set; }
    public Guid CategoryId { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public bool IsRecurring { get; set; }
    public string? Tags { get; set; }

    // Installment properties
    public int? InstallmentCount { get; set; } // Total de parcelas (ex: 12)
    public int? CurrentInstallment { get; set; } // Parcela atual (ex: 1 de 12)
    public Guid? ParentTransactionId { get; set; } // ID da transação original (para parcelas relacionadas)

    // Navigation properties
    public Family Family { get; set; } = null!;
    public Account Account { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
