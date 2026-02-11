using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Enums;

namespace FinanceApp.Application.Features.Subscriptions.Queries;

public record GetSubscriptionForecastQuery(Guid FamilyId, int Days = 30) : IRequest<SubscriptionForecastDto>;

public class GetSubscriptionForecastQueryHandler : IRequestHandler<GetSubscriptionForecastQuery, SubscriptionForecastDto>
{
    private readonly IRepository<Subscription> _subscriptionRepository;

    public GetSubscriptionForecastQueryHandler(IRepository<Subscription> subscriptionRepository)
    {
        _subscriptionRepository = subscriptionRepository;
    }

    public async Task<SubscriptionForecastDto> Handle(GetSubscriptionForecastQuery request, CancellationToken cancellationToken)
    {
        var subscriptions = await _subscriptionRepository.FindAsync(s =>
            s.FamilyId == request.FamilyId &&
            s.Status == SubscriptionStatus.Active);

        var currentDate = DateTime.UtcNow;
        var endDate = currentDate.AddDays(request.Days);
        var upcomingRenewals = new List<UpcomingSubscriptionDto>();
        var lowUsageSubscriptions = new List<SubscriptionDto>();
        decimal totalAmount = 0;

        foreach (var subscription in subscriptions)
        {
            if (subscription.NextBillingDate.HasValue &&
                subscription.NextBillingDate.Value >= currentDate &&
                subscription.NextBillingDate.Value <= endDate)
            {
                var daysUntil = (subscription.NextBillingDate.Value - currentDate).Days;
                upcomingRenewals.Add(new UpcomingSubscriptionDto(
                    subscription.Id,
                    subscription.Name,
                    subscription.Amount,
                    subscription.NextBillingDate.Value,
                    daysUntil
                ));
                totalAmount += subscription.Amount;
            }

            if (subscription.IsLowUsage)
            {
                lowUsageSubscriptions.Add(new SubscriptionDto(
                    subscription.Id,
                    subscription.Name,
                    subscription.CategoryId,
                    subscription.Category?.Name ?? "Unknown",
                    subscription.Amount,
                    subscription.BillingDay,
                    subscription.Status,
                    subscription.NextBillingDate,
                    subscription.UsageCount,
                    subscription.IsLowUsage,
                    subscription.Status == SubscriptionStatus.Active,
                    subscription.CreatedByUsername,
                    subscription.CreatedAt,
                    subscription.UpdatedByUsername,
                    subscription.UpdatedAt
                ));
            }
        }

        return new SubscriptionForecastDto(
            upcomingRenewals.OrderBy(u => u.DaysUntilBilling).ToList(),
            totalAmount,
            lowUsageSubscriptions
        );
    }
}
