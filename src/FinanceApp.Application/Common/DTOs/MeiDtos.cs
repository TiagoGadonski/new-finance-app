namespace FinanceApp.Application.Common.DTOs;

public record MeiSettingsDto(
    Guid Id,
    decimal AnnualRevenueLimit,
    int Year,
    int StartMonth,
    Guid? MainCategoryId,
    decimal AlertThreshold1,
    decimal AlertThreshold2,
    decimal AlertThreshold3,
    decimal ProportionalLimit,
    decimal MonthlyAverageLimit
);

public record CreateMeiSettingsRequest(
    int Year,
    decimal AnnualRevenueLimit = 81000m,
    int StartMonth = 1,
    Guid? MainCategoryId = null,
    decimal AlertThreshold1 = 70m,
    decimal AlertThreshold2 = 80m,
    decimal AlertThreshold3 = 90m
);

public record UpdateMeiSettingsRequest(
    decimal? AnnualRevenueLimit,
    int? StartMonth,
    Guid? MainCategoryId,
    decimal? AlertThreshold1,
    decimal? AlertThreshold2,
    decimal? AlertThreshold3
);

public record MeiDashboardDto(
    int Year,
    decimal AnnualRevenueLimit,
    decimal ProportionalLimit,
    decimal CurrentRevenue,
    decimal RemainingRevenue,
    decimal PercentageUsed,
    decimal MonthlyAverageLimit,
    decimal CurrentMonthRevenue,
    decimal ProjectedAnnualRevenue,
    bool IsAtRisk,
    string? AlertMessage,
    List<MonthlyMeiRevenueDto> MonthlyBreakdown
);

public record MonthlyMeiRevenueDto(
    int Month,
    string MonthName,
    decimal Revenue,
    decimal Limit,
    decimal PercentageUsed,
    bool IsOverLimit
);

public record MeiAlertDto(
    string Level, // "warning", "danger", "critical"
    string Message,
    decimal PercentageUsed,
    decimal RemainingRevenue,
    string Recommendation
);
