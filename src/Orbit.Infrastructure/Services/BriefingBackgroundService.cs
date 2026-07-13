using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Orbit.Application.Common.Interfaces;

namespace Orbit.Infrastructure.Services;

public class BriefingBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BriefingBackgroundService> _logger;
    private readonly int _briefingHour;

    public BriefingBackgroundService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<BriefingBackgroundService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _briefingHour = configuration.GetValue("Briefing:Hour", 8);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("BriefingBackgroundService started. Scheduled for {Hour}:00 BRT", _briefingHour);

        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            var nowBrt = TimeZoneInfo.ConvertTimeFromUtc(
                DateTime.UtcNow,
                TimeZoneInfo.FindSystemTimeZoneById("America/Sao_Paulo"));

            var targetToday = nowBrt.Date.AddHours(_briefingHour);
            var delay = targetToday > nowBrt
                ? targetToday - nowBrt
                : targetToday.AddDays(1) - nowBrt;

            _logger.LogInformation("Next briefing in {Minutes:F0} minutes", delay.TotalMinutes);

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            if (stoppingToken.IsCancellationRequested) break;

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IBriefingService>();
                await service.SendBriefingToAllFamiliesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending daily briefing");
            }
        }
    }
}
