namespace FinanceApp.Domain.Entities;

public class CurrencyRate : BaseEntity
{
    public string FromCurrency { get; set; } = string.Empty;
    public string ToCurrency { get; set; } = string.Empty;
    public decimal Rate { get; set; }
    public DateTime Date { get; set; }
    public string? Source { get; set; }
}
