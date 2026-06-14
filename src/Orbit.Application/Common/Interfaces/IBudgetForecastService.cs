using Orbit.Application.Common.DTOs;

namespace Orbit.Application.Common.Interfaces;

public interface IBudgetForecastService
{
    Task<BudgetForecastResultDto> GenerateAsync(int months, decimal? initialBalance, Guid familyId, CancellationToken cancellationToken = default);
}
