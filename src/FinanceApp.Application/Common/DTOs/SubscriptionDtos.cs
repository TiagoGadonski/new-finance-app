using FinanceApp.Domain.Enums;

namespace FinanceApp.Application.Common.DTOs;

public record SubscriptionDto(
    Guid Id,
    string Name,
    Guid CategoryId,
    string CategoryName,
    decimal Amount,
    int BillingDay,
    SubscriptionStatus Status,
    DateTime? NextBillingDate,
    int UsageCount,
    bool IsLowUsage,
    bool IsActive
);

public record CreateSubscriptionRequest(
    string Name,
    Guid CategoryId,
    Guid AccountId,
    decimal Amount,
    int BillingDay
);

public record UpdateSubscriptionRequest(
    string Name,
    decimal Amount,
    int BillingDay,
    SubscriptionStatus Status
);

public record SubscriptionForecastDto(
    List<UpcomingSubscriptionDto> UpcomingRenewals,
    decimal TotalAmount,
    List<SubscriptionDto> LowUsageSubscriptions
);

public record UpcomingSubscriptionDto(
    Guid Id,
    string Name,
    decimal Amount,
    DateTime BillingDate,
    int DaysUntilBilling
);
