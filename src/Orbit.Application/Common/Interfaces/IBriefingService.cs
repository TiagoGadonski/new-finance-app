namespace Orbit.Application.Common.Interfaces;

public interface IBriefingService
{
    Task SendBriefingAsync(Guid familyId, string chatId, CancellationToken ct = default);
    Task SendBriefingToAllFamiliesAsync(CancellationToken ct = default);
}
