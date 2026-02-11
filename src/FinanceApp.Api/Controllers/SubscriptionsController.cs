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

        var dtos = subscriptions.Select(MapToDto).ToList();

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
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
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

        return Ok(MapToDto(createdSubscription!));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<SubscriptionDto>> GetById(Guid id)
    {
        var subscription = await _subscriptionRepository.GetByIdAsync(id, s => s.Category);
        if (subscription == null || subscription.FamilyId != FamilyId)
            return NotFound();

        return Ok(MapToDto(subscription));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<SubscriptionDto>> Update(Guid id, [FromBody] UpdateSubscriptionRequest request)
    {
        var subscription = await _subscriptionRepository.GetByIdAsync(id, s => s.Category);
        if (subscription == null || subscription.FamilyId != FamilyId)
            return NotFound();

        subscription.Name = request.Name;
        subscription.Amount = request.Amount;
        subscription.BillingDay = request.BillingDay;
        subscription.Status = request.Status;
        subscription.NextBillingDate = CalculateNextBillingDate(request.BillingDay);
        subscription.UpdatedAt = DateTime.UtcNow;
        subscription.UpdatedByUsername = Username;

        await _subscriptionRepository.UpdateAsync(subscription);
        await _subscriptionRepository.SaveChangesAsync();

        return Ok(MapToDto(subscription));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var subscription = await _subscriptionRepository.GetByIdAsync(id);
        if (subscription == null || subscription.FamilyId != FamilyId)
            return NotFound();

        await _subscriptionRepository.DeleteAsync(subscription);
        await _subscriptionRepository.SaveChangesAsync();

        return NoContent();
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

        return Ok(MapToDto(subscription));
    }

    [HttpPost("process-billings")]
    public async Task<ActionResult<object>> ProcessBillings()
    {
        var command = new ProcessSubscriptionBillingsCommand(FamilyId, Username);
        var processedCount = await _mediator.Send(command);
        return Ok(new { processedCount, message = $"{processedCount} assinatura(s) processada(s) com sucesso" });
    }

    private static SubscriptionDto MapToDto(Subscription s) => new(
        s.Id, s.Name, s.CategoryId, s.Category?.Name ?? "N/A", s.Amount, s.BillingDay,
        s.Status, s.NextBillingDate, s.UsageCount, s.IsLowUsage,
        s.Status == Domain.Enums.SubscriptionStatus.Active,
        s.CreatedByUsername, s.CreatedAt, s.UpdatedByUsername, s.UpdatedAt
    );

    private DateTime CalculateNextBillingDate(int billingDay)
    {
        var now = DateTime.UtcNow;
        var nextDate = new DateTime(now.Year, now.Month, Math.Min(billingDay, DateTime.DaysInMonth(now.Year, now.Month)));

        if (nextDate <= now)
            nextDate = nextDate.AddMonths(1);

        return nextDate;
    }
}
