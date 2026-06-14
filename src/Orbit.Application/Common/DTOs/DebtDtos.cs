using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

public record DebtDto(
    Guid Id,
    string Name,
    decimal? TotalAmount,
    decimal RemainingAmount,
    decimal InterestRate,
    decimal MinimumPayment,
    DateTime? DueDate,
    int? InstallmentsRemaining,
    bool IsPaidThisMonth,
    bool IsSettled,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record CreateDebtRequest(
    string Name,
    decimal? TotalAmount,
    decimal RemainingAmount,
    decimal InterestRate,
    decimal MinimumPayment,
    DateTime? DueDate,
    int? InstallmentsRemaining = null
);

public record UpdateDebtRequest(
    string Name,
    decimal? TotalAmount,
    decimal RemainingAmount,
    decimal InterestRate,
    decimal MinimumPayment,
    DateTime? DueDate,
    int? InstallmentsRemaining = null
);

public record DebtSimulationRequest(
    decimal MonthlyPayment,
    DebtPaymentStrategy Strategy
);

public record DebtSimulationDto(
    DebtPaymentStrategy Strategy,
    List<DebtPaymentPlanDto> PaymentPlan,
    decimal TotalInterestPaid,
    int MonthsToPayoff,
    decimal MonthlySavings
);

public record DebtPaymentPlanDto(
    Guid DebtId,
    string DebtName,
    int PaymentOrder,
    decimal MonthlyPayment,
    int MonthsToPayoff,
    decimal TotalInterest
);
