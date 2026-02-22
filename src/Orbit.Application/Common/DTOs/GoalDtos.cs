using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

public record GoalDto(
    Guid Id,
    string Name,
    decimal TargetAmount,
    decimal CurrentAmount,
    decimal RemainingAmount,
    decimal PercentageAchieved,
    DateTime TargetDate,
    GoalStatus Status,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record CreateGoalRequest(
    string Name,
    decimal TargetAmount,
    DateTime TargetDate
);

public record UpdateGoalRequest(
    string Name,
    decimal TargetAmount,
    decimal CurrentAmount,
    DateTime TargetDate,
    GoalStatus Status
);
