namespace FinanceApp.Application.Common.DTOs;

public record CurrencyRateDto(
    string FromCurrency,
    string ToCurrency,
    decimal Rate,
    DateTime Date
);

public record CurrencyConversionResult(
    string FromCurrency,
    string ToCurrency,
    decimal OriginalAmount,
    decimal ConvertedAmount,
    decimal Rate
);
