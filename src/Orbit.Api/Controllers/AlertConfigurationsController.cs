using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;

namespace Orbit.Api.Controllers;

[Route("api/alert-configurations")]
public class AlertConfigurationsController : BaseAuthenticatedController
{
    private readonly IRepository<AlertConfiguration> _alertRepository;

    public AlertConfigurationsController(IRepository<AlertConfiguration> alertRepository)
    {
        _alertRepository = alertRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AlertConfigurationDto>>> GetAll()
    {
        var alerts = await _alertRepository.FindAsync(a => a.FamilyId == FamilyId);
        return Ok(alerts.Select(MapToDto).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<AlertConfigurationDto>> Create([FromBody] CreateAlertConfigurationRequest request)
    {
        var alert = new AlertConfiguration
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            UserId = UserId,
            Type = request.Type,
            Threshold = request.Threshold,
            IsActive = true,
            Channel = request.Channel,
            CronSchedule = request.CronSchedule,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        await _alertRepository.AddAsync(alert);
        await _alertRepository.SaveChangesAsync();

        return Ok(MapToDto(alert));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AlertConfigurationDto>> Update(Guid id, [FromBody] UpdateAlertConfigurationRequest request)
    {
        var alert = await _alertRepository.GetByIdAsync(id);
        if (alert == null || alert.FamilyId != FamilyId)
            return NotFound();

        alert.Type = request.Type;
        alert.Threshold = request.Threshold;
        alert.IsActive = request.IsActive;
        alert.Channel = request.Channel;
        alert.CronSchedule = request.CronSchedule;
        alert.UpdatedAt = DateTime.UtcNow;
        alert.UpdatedByUsername = Username;

        await _alertRepository.UpdateAsync(alert);
        await _alertRepository.SaveChangesAsync();

        return Ok(MapToDto(alert));
    }

    [HttpPost("{id}/toggle")]
    public async Task<ActionResult<AlertConfigurationDto>> Toggle(Guid id)
    {
        var alert = await _alertRepository.GetByIdAsync(id);
        if (alert == null || alert.FamilyId != FamilyId)
            return NotFound();

        alert.IsActive = !alert.IsActive;
        alert.UpdatedAt = DateTime.UtcNow;
        alert.UpdatedByUsername = Username;

        await _alertRepository.UpdateAsync(alert);
        await _alertRepository.SaveChangesAsync();

        return Ok(MapToDto(alert));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var alert = await _alertRepository.GetByIdAsync(id);
        if (alert == null || alert.FamilyId != FamilyId)
            return NotFound();

        await _alertRepository.DeleteAsync(alert);
        await _alertRepository.SaveChangesAsync();

        return NoContent();
    }

    private static AlertConfigurationDto MapToDto(AlertConfiguration a) => new(
        a.Id, a.UserId, a.Type, a.Threshold, a.IsActive, a.Channel, a.CronSchedule,
        a.CreatedByUsername, a.CreatedAt, a.UpdatedByUsername, a.UpdatedAt
    );
}
