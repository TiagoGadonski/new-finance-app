using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

public record CategoryDto(
    Guid Id,
    string Name,
    TransactionType Type,
    string? Icon,
    string? Color,
    bool IsDefault
);

public record CreateCategoryRequest(
    string Name,
    TransactionType Type,
    string? Icon,
    string? Color
);

public record UpdateCategoryRequest(
    string Name,
    string? Icon,
    string? Color
);
