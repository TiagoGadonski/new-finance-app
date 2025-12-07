using FinanceApp.Domain.Enums;

namespace FinanceApp.Application.Common.DTOs;

public record AccountDto(
    Guid Id,
    string Name,
    AccountType Type,
    decimal Balance,
    string? Color,
    bool IsActive
);

public record CreateAccountRequest(
    string Name,
    AccountType Type,
    decimal InitialBalance,
    string? Color
);

public record UpdateAccountRequest(
    string Name,
    string? Color,
    bool IsActive
);
