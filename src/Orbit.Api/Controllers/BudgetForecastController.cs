using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Application.Common.Interfaces;

namespace Orbit.Api.Controllers;

/// <summary>
/// Budget forecast projection for the next N months.
/// </summary>
[Route("api/budget-forecast")]
public class BudgetForecastController : BaseAuthenticatedController
{
    private readonly IBudgetForecastService _forecastService;

    public BudgetForecastController(IBudgetForecastService forecastService)
    {
        _forecastService = forecastService;
    }

    /// <summary>
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<BudgetForecastResultDto>> Get(
        [FromQuery] int months = 6,
        [FromQuery] decimal? initialBalance = null,
        CancellationToken cancellationToken = default)
    {
        if (months < 1 || months > 12)
            return BadRequest("months must be between 1 and 12.");

        var result = await _forecastService.GenerateAsync(months, initialBalance, FamilyId, cancellationToken);
        return Ok(result);
    }
}
