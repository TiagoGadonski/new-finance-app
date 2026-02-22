namespace Orbit.Application.Common.DTOs;

public record ReminderDto(
    Guid Id,
    string Name,
    string? Description,
    int Month,
    int Day,
    bool IsRecurring,
    int DaysInAdvance,
    bool IsActive,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record CreateReminderRequest(
    string Name,
    string? Description = null,
    int Month = 1,
    int Day = 1,
    bool IsRecurring = true,
    int DaysInAdvance = 0
);

public record UpdateReminderRequest(
    string Name,
    string? Description,
    int Month,
    int Day,
    bool IsRecurring,
    int DaysInAdvance,
    bool IsActive
);
