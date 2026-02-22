namespace Orbit.Application.Common.DTOs;

public record GoalSimulationRequest(
    Guid GoalId,
    decimal MonthlyContribution
);

public record GoalSimulationDto(
    Guid GoalId,
    string GoalName,
    decimal TargetAmount,
    decimal CurrentAmount,
    decimal MonthlyContribution,
    int MonthsToGoal,
    DateTime EstimatedCompletionDate
);

public record DebtPayoffRequest(
    decimal ExtraMonthlyPayment
);

public record DebtPayoffDto(
    decimal TotalDebt,
    decimal TotalMonthlyMinimum,
    decimal ExtraPayment,
    List<DebtPayoffScheduleDto> SnowballSchedule,
    List<DebtPayoffScheduleDto> AvalancheSchedule,
    int SnowballMonths,
    int AvalancheMonths,
    decimal SnowballTotalInterest,
    decimal AvalancheTotalInterest
);

public record DebtPayoffScheduleDto(
    Guid DebtId,
    string DebtName,
    int PaymentOrder,
    int MonthsToPayoff,
    decimal TotalPaid,
    decimal TotalInterest
);

public record CashFlowProjectionDto(
    List<CashFlowProjectionPointDto> Points,
    decimal AverageMonthlyIncome,
    decimal AverageMonthlyExpenses,
    decimal AverageMonthlySavings,
    decimal ProjectedYearEndBalance
);

public record CashFlowProjectionPointDto(
    int Month,
    int Year,
    string Label,
    decimal ProjectedIncome,
    decimal ProjectedExpenses,
    decimal ProjectedBalance,
    bool IsHistorical
);

public record NetWorthDto(
    decimal TotalAssets,
    decimal TotalLiabilities,
    decimal NetWorth,
    List<NetWorthItemDto> Assets,
    List<NetWorthItemDto> Liabilities
);

public record NetWorthItemDto(
    string Name,
    string Type,
    decimal Amount
);

public record SpendingTrendDto(
    string CategoryName,
    Guid CategoryId,
    List<MonthlyAmountDto> MonthlyAmounts,
    decimal Average,
    decimal Trend
);

public record MonthlyAmountDto(
    int Month,
    int Year,
    string Label,
    decimal Amount
);

public record FinancialHealthDto(
    int OverallScore,
    string Rating,
    List<HealthMetricDto> Metrics
);

public record HealthMetricDto(
    string Name,
    string Description,
    decimal Value,
    int Score,
    string Rating
);
