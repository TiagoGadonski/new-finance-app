using Microsoft.AspNetCore.Mvc;
using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Application.Features.Subscriptions.Queries;
using FinanceApp.Application.Features.Subscriptions.Commands;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;

namespace FinanceApp.Api.Controllers;

[Route("api/[controller]")]
public class SubscriptionsController : BaseAuthenticatedController
{
    private readonly IMediator _mediator;
    private readonly IRepository<Subscription> _subscriptionRepository;

    public SubscriptionsController(IMediator mediator, IRepository<Subscription> subscriptionRepository)
    {
        _mediator = mediator;
        _subscriptionRepository = subscriptionRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Subscription>>> GetAll()
    {
        var subscriptions = await _subscriptionRepository.FindAsync(s => s.UserId == UserId);
        return Ok(subscriptions);
    }

    [HttpPost]
    public async Task<ActionResult<Subscription>> Create([FromBody] CreateSubscriptionRequest request)
    {
        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            UserId = UserId,
            Name = request.Name,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            BillingDay = request.BillingDay,
            Status = Domain.Enums.SubscriptionStatus.Active,
            NextBillingDate = CalculateNextBillingDate(request.BillingDay),
            UsageCount = 0
        };

        await _subscriptionRepository.AddAsync(subscription);
        await _subscriptionRepository.SaveChangesAsync();

        return Ok(subscription);
    }

    [HttpPost("forecast")]
    public async Task<ActionResult<SubscriptionForecastDto>> Forecast([FromQuery] int days = 30)
    {
        var query = new GetSubscriptionForecastQuery(UserId, days);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("process-billings")]
    public async Task<ActionResult<object>> ProcessBillings()
    {
        var command = new ProcessSubscriptionBillingsCommand(UserId);
        var processedCount = await _mediator.Send(command);
        return Ok(new { processedCount, message = $"{processedCount} assinatura(s) processada(s) com sucesso" });
    }

    private DateTime CalculateNextBillingDate(int billingDay)
    {
        var now = DateTime.UtcNow;
        var nextDate = new DateTime(now.Year, now.Month, Math.Min(billingDay, DateTime.DaysInMonth(now.Year, now.Month)));

        if (nextDate <= now)
            nextDate = nextDate.AddMonths(1);

        return nextDate;
    }
}
