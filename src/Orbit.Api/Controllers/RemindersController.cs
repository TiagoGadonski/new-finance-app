using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;

namespace Orbit.Api.Controllers;

[Route("api/reminders")]
public class RemindersController : BaseAuthenticatedController
{
    private readonly IRepository<Reminder> _reminderRepository;

    public RemindersController(IRepository<Reminder> reminderRepository)
    {
        _reminderRepository = reminderRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReminderDto>>> GetAll()
    {
        var reminders = await _reminderRepository.FindAsync(r => r.FamilyId == FamilyId);
        return Ok(reminders.OrderBy(r => r.Month).ThenBy(r => r.Day).Select(MapToDto).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<ReminderDto>> Create([FromBody] CreateReminderRequest request)
    {
        var reminder = new Reminder
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Name = request.Name,
            Description = request.Description,
            Month = request.Month,
            Day = request.Day,
            IsRecurring = request.IsRecurring,
            DaysInAdvance = request.DaysInAdvance,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        await _reminderRepository.AddAsync(reminder);
        await _reminderRepository.SaveChangesAsync();

        return Ok(MapToDto(reminder));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ReminderDto>> Update(Guid id, [FromBody] UpdateReminderRequest request)
    {
        var reminder = await _reminderRepository.GetByIdAsync(id);
        if (reminder == null || reminder.FamilyId != FamilyId)
            return NotFound();

        reminder.Name = request.Name;
        reminder.Description = request.Description;
        reminder.Month = request.Month;
        reminder.Day = request.Day;
        reminder.IsRecurring = request.IsRecurring;
        reminder.DaysInAdvance = request.DaysInAdvance;
        reminder.IsActive = request.IsActive;
        reminder.UpdatedAt = DateTime.UtcNow;
        reminder.UpdatedByUsername = Username;

        await _reminderRepository.UpdateAsync(reminder);
        await _reminderRepository.SaveChangesAsync();

        return Ok(MapToDto(reminder));
    }

    [HttpPost("{id}/toggle")]
    public async Task<ActionResult<ReminderDto>> Toggle(Guid id)
    {
        var reminder = await _reminderRepository.GetByIdAsync(id);
        if (reminder == null || reminder.FamilyId != FamilyId)
            return NotFound();

        reminder.IsActive = !reminder.IsActive;
        reminder.UpdatedAt = DateTime.UtcNow;
        reminder.UpdatedByUsername = Username;

        await _reminderRepository.UpdateAsync(reminder);
        await _reminderRepository.SaveChangesAsync();

        return Ok(MapToDto(reminder));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var reminder = await _reminderRepository.GetByIdAsync(id);
        if (reminder == null || reminder.FamilyId != FamilyId)
            return NotFound();

        await _reminderRepository.DeleteAsync(reminder);
        await _reminderRepository.SaveChangesAsync();

        return NoContent();
    }

    private static ReminderDto MapToDto(Reminder r) => new(
        r.Id, r.Name, r.Description, r.Month, r.Day,
        r.IsRecurring, r.DaysInAdvance, r.IsActive,
        r.CreatedByUsername, r.CreatedAt, r.UpdatedByUsername, r.UpdatedAt
    );
}
