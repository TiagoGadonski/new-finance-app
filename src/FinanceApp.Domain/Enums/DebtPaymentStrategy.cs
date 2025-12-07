namespace FinanceApp.Domain.Enums;

public enum DebtPaymentStrategy
{
    Snowball,    // Menor saldo primeiro
    Avalanche    // Maior taxa de juros primeiro
}
