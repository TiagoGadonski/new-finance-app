namespace FinanceApp.Domain.Interfaces;

public interface ICurrencyService
{
    Task<decimal> GetRateAsync(string fromCurrency, string toCurrency);
    Task<decimal> ConvertAsync(string fromCurrency, string toCurrency, decimal amount);
    Task<Dictionary<string, decimal>> GetRatesAsync(string baseCurrency);
    Task RefreshRatesAsync(string baseCurrency);
}
