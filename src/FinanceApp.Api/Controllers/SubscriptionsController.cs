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
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Account> _accountRepository;

    public SubscriptionsController(
        IMediator mediator,
        IRepository<Subscription> subscriptionRepository,
        IRepository<Transaction> transactionRepository,
        IRepository<Account> accountRepository)
    {
        _mediator = mediator;
        _subscriptionRepository = subscriptionRepository;
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SubscriptionDto>>> GetAll()
    {
        var subscriptions = await _subscriptionRepository.FindAsync(
            s => s.FamilyId == FamilyId,
            s => s.Category);

        var dtos = subscriptions.Select(s => new SubscriptionDto(
            s.Id,
            s.Name,
            s.CategoryId,
            s.Category?.Name ?? "N/A",
            s.Amount,
            s.BillingDay,
            s.Status,
            s.NextBillingDate,
            s.UsageCount,
            s.IsLowUsage,
            s.Status == Domain.Enums.SubscriptionStatus.Active
        )).ToList();

        return Ok(dtos);
    }

    [HttpPost]
    public async Task<ActionResult<SubscriptionDto>> Create([FromBody] CreateSubscriptionRequest request)
    {
        // Verificar se a conta existe e pertence à família
        var account = await _accountRepository.GetByIdAsync(request.AccountId);
        if (account == null || account.FamilyId != FamilyId)
            return BadRequest("Conta inválida");

        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Name = request.Name,
            CategoryId = request.CategoryId,
            AccountId = request.AccountId,
            Amount = request.Amount,
            BillingDay = request.BillingDay,
            Status = Domain.Enums.SubscriptionStatus.Active,
            NextBillingDate = CalculateNextBillingDate(request.BillingDay),
            UsageCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        await _subscriptionRepository.AddAsync(subscription);

        // CRIAR TRANSAÇÃO IMEDIATA (primeira cobrança)
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            AccountId = request.AccountId,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Type = Domain.Enums.TransactionType.Expense,
            Description = $"{request.Name} (Assinatura - 1ª cobrança)",
            Date = DateTime.UtcNow,
            IsRecurring = true,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        // Atualizar saldo da conta
        account.Balance -= request.Amount;

        await _transactionRepository.AddAsync(transaction);
        await _accountRepository.UpdateAsync(account);
        await _subscriptionRepository.SaveChangesAsync();

        // Buscar a subscription criada com a categoria incluída
        var createdSubscription = await _subscriptionRepository.GetByIdAsync(subscription.Id, s => s.Category);

        var dto = new SubscriptionDto(
            createdSubscription!.Id,
            createdSubscription.Name,
            createdSubscription.CategoryId,
            createdSubscription.Category?.Name ?? "N/A",
            createdSubscription.Amount,
            createdSubscription.BillingDay,
            createdSubscription.Status,
            createdSubscription.NextBillingDate,
            createdSubscription.UsageCount,
            createdSubscription.IsLowUsage,
            createdSubscription.Status == Domain.Enums.SubscriptionStatus.Active
        );

        return Ok(dto);
    }

    [HttpPost("forecast")]
    public async Task<ActionResult<SubscriptionForecastDto>> Forecast([FromQuery] int days = 30)
    {
        var query = new GetSubscriptionForecastQuery(FamilyId, days);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPatch("{id}/toggle")]
    public async Task<ActionResult<SubscriptionDto>> ToggleActive(Guid id)
    {
        var subscription = await _subscriptionRepository.GetByIdAsync(id, s => s.Category);

        if (subscription == null || subscription.FamilyId != FamilyId)
            return NotFound();

        // Toggle status
        subscription.Status = subscription.Status == Domain.Enums.SubscriptionStatus.Active
            ? Domain.Enums.SubscriptionStatus.Paused
            : Domain.Enums.SubscriptionStatus.Active;

        await _subscriptionRepository.UpdateAsync(subscription);
        await _subscriptionRepository.SaveChangesAsync();

        var dto = new SubscriptionDto(
            subscription.Id,
            subscription.Name,
            subscription.CategoryId,
            subscription.Category?.Name ?? "N/A",
            subscription.Amount,
            subscription.BillingDay,
            subscription.Status,
            subscription.NextBillingDate,
            subscription.UsageCount,
            subscription.IsLowUsage,
            subscription.Status == Domain.Enums.SubscriptionStatus.Active
        );

        return Ok(dto);
    }

    [HttpPost("process-billings")]
    public async Task<ActionResult<object>> ProcessBillings()
    {
        var command = new ProcessSubscriptionBillingsCommand(FamilyId, Username);
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
