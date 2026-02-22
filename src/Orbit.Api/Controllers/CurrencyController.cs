using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;

namespace Orbit.Api.Controllers;

[Route("api/[controller]")]
public class CurrencyController : BaseAuthenticatedController
{
    private readonly ICurrencyService _currencyService;

    public CurrencyController(ICurrencyService currencyService)
    {
        _currencyService = currencyService;
    }

    [HttpGet("rates")]
    public async Task<ActionResult<Dictionary<string, decimal>>> GetRates([FromQuery] string @base = "BRL")
    {
        var rates = await _currencyService.GetRatesAsync(@base);
        return Ok(rates);
    }

    [HttpGet("convert")]
    public async Task<ActionResult<CurrencyConversionResult>> Convert(
        [FromQuery] string from, [FromQuery] string to, [FromQuery] decimal amount)
    {
        var rate = await _currencyService.GetRateAsync(from, to);
        var converted = amount * rate;

        return Ok(new CurrencyConversionResult(from, to, amount, converted, rate));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult> Refresh([FromQuery] string @base = "BRL")
    {
        await _currencyService.RefreshRatesAsync(@base);
        return Ok(new { message = "Rates refreshed successfully" });
    }
}
