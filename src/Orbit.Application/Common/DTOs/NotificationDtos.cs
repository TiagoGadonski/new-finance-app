using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

public record NotificationDto(
    Guid Id,
    string Title,
    string Message,
    NotificationType Type,
    bool IsRead,
    string? Link,
    DateTime CreatedAt
);

public record CreateNotificationRequest(
    string Title,
    string Message,
    NotificationType Type,
    string? Link = null,
    Guid? UserId = null
);
