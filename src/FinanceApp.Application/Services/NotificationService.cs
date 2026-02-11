using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Enums;
using FinanceApp.Domain.Interfaces;

namespace FinanceApp.Application.Services;

public class NotificationService : INotificationService
{
    private readonly IRepository<Notification> _notificationRepository;

    public NotificationService(IRepository<Notification> notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task CreateAsync(Guid familyId, string title, string message, NotificationType type, string? link = null, Guid? userId = null)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            FamilyId = familyId,
            UserId = userId,
            Title = title,
            Message = message,
            Type = type,
            IsRead = false,
            Link = link,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepository.AddAsync(notification);
        await _notificationRepository.SaveChangesAsync();
    }
}
