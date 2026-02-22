using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Orbit.Domain.Entities;
using Orbit.Domain.Interfaces;

namespace Orbit.Application.Services;

public class CurrencyService : ICurrencyService
{
    private readonly IRepository<CurrencyRate> _currencyRateRepository;
    private readonly IDistributedCache _cache;
    private readonly HttpClient _httpClient;
    private const string CacheKeyPrefix = "currency_rates_";
    private const int CacheTtlMinutes = 60;

    public CurrencyService(
        IRepository<CurrencyRate> currencyRateRepository,
        IDistributedCache cache,
        IHttpClientFactory httpClientFactory)
    {
        _currencyRateRepository = currencyRateRepository;
        _cache = cache;
        _httpClient = httpClientFactory.CreateClient("CurrencyApi");
    }

    public async Task<decimal> GetRateAsync(string fromCurrency, string toCurrency)
    {
        if (fromCurrency == toCurrency) return 1m;

        var rates = await GetRatesAsync(fromCurrency);
        return rates.TryGetValue(toCurrency, out var rate) ? rate : 0m;
    }

    public async Task<decimal> ConvertAsync(string fromCurrency, string toCurrency, decimal amount)
    {
        var rate = await GetRateAsync(fromCurrency, toCurrency);
        return amount * rate;
    }

    public async Task<Dictionary<string, decimal>> GetRatesAsync(string baseCurrency)
    {
        var cacheKey = $"{CacheKeyPrefix}{baseCurrency}";
        var cached = await _cache.GetStringAsync(cacheKey);

        if (cached != null)
        {
            return JsonSerializer.Deserialize<Dictionary<string, decimal>>(cached) ?? new();
        }

        // Try to fetch from API
        try
        {
            var rates = await FetchRatesFromApiAsync(baseCurrency);
            if (rates.Count > 0)
            {
                // Cache the result
                await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(rates), new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(CacheTtlMinutes)
                });

                // Save to DB as fallback
                await SaveRatesToDbAsync(baseCurrency, rates);
                return rates;
            }
        }
        catch
        {
            // Fallback to DB
        }

        return await GetRatesFromDbAsync(baseCurrency);
    }

    public async Task RefreshRatesAsync(string baseCurrency)
    {
        var cacheKey = $"{CacheKeyPrefix}{baseCurrency}";
        await _cache.RemoveAsync(cacheKey);
        await GetRatesAsync(baseCurrency);
    }

    private async Task<Dictionary<string, decimal>> FetchRatesFromApiAsync(string baseCurrency)
    {
        var rates = new Dictionary<string, decimal>();
        try
        {
            var response = await _httpClient.GetAsync($"https://open.er-api.com/v6/latest/{baseCurrency}");
            if (!response.IsSuccessStatusCode) return rates;

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("rates", out var ratesElement))
            {
                foreach (var prop in ratesElement.EnumerateObject())
                {
                    if (prop.Value.TryGetDecimal(out var rate))
                    {
                        rates[prop.Name] = rate;
                    }
                }
            }
        }
        catch
        {
            // Silently fail, caller handles fallback
        }

        return rates;
    }

    private async Task SaveRatesToDbAsync(string baseCurrency, Dictionary<string, decimal> rates)
    {
        var now = DateTime.UtcNow;
        foreach (var (currency, rate) in rates)
        {
            var existing = (await _currencyRateRepository.FindAsync(r =>
                r.FromCurrency == baseCurrency && r.ToCurrency == currency))
                .FirstOrDefault();

            if (existing != null)
            {
                existing.Rate = rate;
                existing.Date = now;
                existing.Source = "open.er-api.com";
                existing.UpdatedAt = now;
                await _currencyRateRepository.UpdateAsync(existing);
            }
            else
            {
                await _currencyRateRepository.AddAsync(new CurrencyRate
                {
                    Id = Guid.NewGuid(),
                    FromCurrency = baseCurrency,
                    ToCurrency = currency,
                    Rate = rate,
                    Date = now,
                    Source = "open.er-api.com",
                    CreatedAt = now
                });
            }
        }

        await _currencyRateRepository.SaveChangesAsync();
    }

    private async Task<Dictionary<string, decimal>> GetRatesFromDbAsync(string baseCurrency)
    {
        var rates = await _currencyRateRepository.FindAsync(r => r.FromCurrency == baseCurrency);
        return rates.ToDictionary(r => r.ToCurrency, r => r.Rate);
    }
}
