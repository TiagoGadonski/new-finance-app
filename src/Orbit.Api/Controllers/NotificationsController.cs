using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;

namespace Orbit.Api.Controllers;

[Route("api/[controller]")]
public class NotificationsController : BaseAuthenticatedController
{
    private readonly IRepository<Notification> _notificationRepository;

    public NotificationsController(IRepository<Notification> notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var notifications = await _notificationRepository.FindAsync(
            n => n.FamilyId == FamilyId && (n.UserId == null || n.UserId == UserId));

        var paged = notifications
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationDto(
                n.Id, n.Title, n.Message, n.Type, n.IsRead, n.Link, n.CreatedAt
            ));

        return Ok(paged);
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        var notifications = await _notificationRepository.FindAsync(
            n => n.FamilyId == FamilyId && !n.IsRead && (n.UserId == null || n.UserId == UserId));

        return Ok(notifications.Count());
    }

    [HttpPatch("{id}/read")]
    public async Task<ActionResult> MarkAsRead(Guid id)
    {
        var notification = await _notificationRepository.GetByIdAsync(id);
        if (notification == null || notification.FamilyId != FamilyId)
            return NotFound();

        notification.IsRead = true;
        notification.UpdatedAt = DateTime.UtcNow;
        await _notificationRepository.UpdateAsync(notification);
        await _notificationRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<ActionResult> MarkAllAsRead()
    {
        var notifications = await _notificationRepository.FindAsync(
            n => n.FamilyId == FamilyId && !n.IsRead && (n.UserId == null || n.UserId == UserId));

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.UpdatedAt = DateTime.UtcNow;
            await _notificationRepository.UpdateAsync(notification);
        }

        await _notificationRepository.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var notification = await _notificationRepository.GetByIdAsync(id);
        if (notification == null || notification.FamilyId != FamilyId)
            return NotFound();

        await _notificationRepository.DeleteAsync(notification);
        await _notificationRepository.SaveChangesAsync();

        return NoContent();
    }
}
