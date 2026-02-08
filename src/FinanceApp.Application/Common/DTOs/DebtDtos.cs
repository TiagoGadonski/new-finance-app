using FinanceApp.Domain.Enums;

namespace FinanceApp.Application.Common.DTOs;

public record DebtDto(
    Guid Id,
    string Name,
    decimal? TotalAmount,
    decimal RemainingAmount,
    decimal InterestRate,
    decimal MinimumPayment,
    DateTime? DueDate
);

public record CreateDebtRequest(
    string Name,
    decimal? TotalAmount,
    decimal RemainingAmount,
    decimal InterestRate,
    decimal MinimumPayment,
    DateTime? DueDate
);

public record UpdateDebtRequest(
    string Name,
    decimal? TotalAmount,
    decimal RemainingAmount,
    decimal InterestRate,
    decimal MinimumPayment,
    DateTime? DueDate
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
