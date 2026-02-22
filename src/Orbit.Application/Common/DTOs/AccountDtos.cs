using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

public record AccountDto(
    Guid Id,
    string Name,
    AccountType Type,
    decimal Balance,
    string? Color,
    string Currency,
    bool IsActive,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record CreateAccountRequest(
    string Name,
    AccountType Type,
    decimal InitialBalance,
    string? Color,
    string Currency = "BRL"
);

public record UpdateAccountRequest(
    string Name,
    string? Color,
    bool IsActive,
    string? Currency = null
);
