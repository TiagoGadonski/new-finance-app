namespace Orbit.Application.Common.DTOs;

public record TodoItemDto(
    Guid Id,
    string Title,
    string? Description,
    DateTime? DueDate,
    bool IsCompleted,
    DateTime? CompletedAt,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record CreateTodoRequest(
    string Title,
    string? Description = null,
    DateTime? DueDate = null
);

public record UpdateTodoRequest(
    string Title,
    string? Description,
    DateTime? DueDate,
    bool IsCompleted
);
