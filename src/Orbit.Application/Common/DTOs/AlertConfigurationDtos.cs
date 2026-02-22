using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

public record AlertConfigurationDto(
    Guid Id,
    Guid? UserId,
    AlertType Type,
    decimal? Threshold,
    bool IsActive,
    AlertChannel Channel,
    string? CronSchedule,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record CreateAlertConfigurationRequest(
    AlertType Type,
    decimal? Threshold,
    AlertChannel Channel = AlertChannel.InApp,
    string? CronSchedule = null
);

public record UpdateAlertConfigurationRequest(
    AlertType Type,
    decimal? Threshold,
    bool IsActive,
    AlertChannel Channel,
    string? CronSchedule
);
