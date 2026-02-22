using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

public record TransactionTemplateDto(
    Guid Id,
    string Name,
    Guid AccountId,
    Guid CategoryId,
    decimal Amount,
    TransactionType Type,
    string? Description,
    string? Tags,
    string AccountName,
    string CategoryName
);

public record CreateTransactionTemplateRequest(
    string Name,
    Guid AccountId,
    Guid CategoryId,
    decimal Amount,
    TransactionType Type,
    string? Description = null,
    string? Tags = null
);

public record UpdateTransactionTemplateRequest(
    string Name,
    Guid AccountId,
    Guid CategoryId,
    decimal Amount,
    TransactionType Type,
    string? Description = null,
    string? Tags = null
);
