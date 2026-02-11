using FinanceApp.Domain.Enums;

namespace FinanceApp.Application.Common.DTOs;

public record InvestmentDto(
    Guid Id,
    string Name,
    InvestmentType Type,
    string? Symbol,
    decimal Quantity,
    decimal AveragePrice,
    decimal CurrentPrice,
    string Currency,
    Guid? AccountId,
    string? AccountName,
    decimal TotalValue,
    decimal TotalGainLoss,
    decimal GainLossPercentage
);

public record CreateInvestmentRequest(
    string Name,
    InvestmentType Type,
    string? Symbol = null,
    decimal Quantity = 0,
    decimal AveragePrice = 0,
    decimal CurrentPrice = 0,
    string Currency = "BRL",
    Guid? AccountId = null
);

public record UpdateInvestmentRequest(
    string Name,
    InvestmentType Type,
    string? Symbol = null,
    decimal CurrentPrice = 0,
    string Currency = "BRL",
    Guid? AccountId = null
);

public record InvestmentTransactionDto(
    Guid Id,
    Guid InvestmentId,
    InvestmentTransactionType Type,
    decimal Quantity,
    decimal Price,
    DateTime Date,
    decimal Fees
);

public record CreateInvestmentTransactionRequest(
    InvestmentTransactionType Type,
    decimal Quantity,
    decimal Price,
    DateTime Date,
    decimal Fees = 0
);

public record InvestmentSummaryDto(
    decimal TotalInvested,
    decimal TotalCurrentValue,
    decimal TotalGainLoss,
    decimal TotalGainLossPercentage,
    decimal TotalDividends,
    int TotalInvestments,
    List<InvestmentAllocationDto> Allocation
);

public record InvestmentAllocationDto(
    InvestmentType Type,
    decimal Value,
    decimal Percentage
);
