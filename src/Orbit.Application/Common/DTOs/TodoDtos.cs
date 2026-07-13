using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

public record TodoCommentDto(
    Guid Id,
    string Text,
    DateTime CreatedAt,
    string CreatedByUsername
);

public record TodoItemDto(
    Guid Id,
    string Title,
    string? Description,
    DateOnly? DueDate,
    TodoPriority? Priority,
    TodoCategory? Category,
    bool IsCompleted,
    DateTime? CompletedAt,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt,
    IReadOnlyList<TodoCommentDto> Comments
);

public record CreateTodoRequest(
    string Title,
    string? Description = null,
    DateOnly? DueDate = null,
    TodoPriority? Priority = null,
    TodoCategory? Category = null
);

public record UpdateTodoRequest(
    string Title,
    string? Description,
    DateOnly? DueDate,
    TodoPriority? Priority,
    TodoCategory? Category,
    bool IsCompleted
);

public record AddTodoCommentRequest(string Text);

public record TodoStatsDto(
    int Pending,
    int Overdue,
    int DueToday,
    int DueSoon,
    int CompletedThisWeek
);
