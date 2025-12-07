namespace FinanceApp.Application.Common.DTOs;

public record RoundupRuleDto(
    Guid Id,
    Guid SourceAccountId,
    string SourceAccountName,
    Guid DestinationAccountId,
    string DestinationAccountName,
    bool IsActive,
    decimal Multiplier
);

public record CreateRoundupRuleRequest(
    Guid SourceAccountId,
    Guid DestinationAccountId,
    decimal Multiplier = 1.0m
);

public record UpdateRoundupRuleRequest(
    bool IsActive,
    decimal Multiplier
);

public record RoundupSimulationRequest(
    int Month,
    int Year
);

public record RoundupSimulationDto(
    decimal TotalRoundedUp,
    int TransactionCount,
    List<RoundupDetailDto> Details
);

public record RoundupDetailDto(
    DateTime Date,
    string Description,
    decimal OriginalAmount,
    decimal RoundedAmount,
    decimal RoundupAmount
);
