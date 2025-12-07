using Microsoft.AspNetCore.Mvc;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;

namespace FinanceApp.Api.Controllers;

[Route("api/[controller]")]
public class RoundupsController : BaseAuthenticatedController
{
    private readonly IRepository<RoundupRule> _roundupRepository;
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Account> _accountRepository;

    public RoundupsController(
        IRepository<RoundupRule> roundupRepository,
        IRepository<Transaction> transactionRepository,
        IRepository<Account> accountRepository)
    {
        _roundupRepository = roundupRepository;
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
    }

    [HttpPost]
    public async Task<ActionResult<RoundupRuleDto>> Create([FromBody] CreateRoundupRuleRequest request)
    {
        var sourceAccount = await _accountRepository.GetByIdAsync(request.SourceAccountId);
        var destinationAccount = await _accountRepository.GetByIdAsync(request.DestinationAccountId);

        if (sourceAccount == null || sourceAccount.UserId != UserId)
            return NotFound("Source account not found");

        if (destinationAccount == null || destinationAccount.UserId != UserId)
            return NotFound("Destination account not found");

        if (request.SourceAccountId == request.DestinationAccountId)
            return BadRequest("Source and destination accounts must be different");

        var rule = new RoundupRule
        {
            Id = Guid.NewGuid(),
            UserId = UserId,
            SourceAccountId = request.SourceAccountId,
            DestinationAccountId = request.DestinationAccountId,
            IsActive = true,
            Multiplier = request.Multiplier,
            CreatedAt = DateTime.UtcNow
        };

        await _roundupRepository.AddAsync(rule);
        await _roundupRepository.SaveChangesAsync();

        return Ok(new RoundupRuleDto(
            rule.Id,
            rule.SourceAccountId,
            sourceAccount.Name,
            rule.DestinationAccountId,
            destinationAccount.Name,
            rule.IsActive,
            rule.Multiplier
        ));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoundupRuleDto>>> GetAll()
    {
        var rules = await _roundupRepository.FindAsync(r => r.UserId == UserId);
        var dtos = new List<RoundupRuleDto>();

        foreach (var rule in rules)
        {
            var source = await _accountRepository.GetByIdAsync(rule.SourceAccountId);
            var destination = await _accountRepository.GetByIdAsync(rule.DestinationAccountId);

            dtos.Add(new RoundupRuleDto(
                rule.Id,
                rule.SourceAccountId,
                source?.Name ?? "Unknown",
                rule.DestinationAccountId,
                destination?.Name ?? "Unknown",
                rule.IsActive,
                rule.Multiplier
            ));
        }

        return Ok(dtos);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RoundupRuleDto>> Update(Guid id, [FromBody] UpdateRoundupRuleRequest request)
    {
        var rule = await _roundupRepository.GetByIdAsync(id);
        if (rule == null || rule.UserId != UserId)
            return NotFound();

        rule.IsActive = request.IsActive;
        rule.Multiplier = request.Multiplier;
        rule.UpdatedAt = DateTime.UtcNow;

        await _roundupRepository.UpdateAsync(rule);
        await _roundupRepository.SaveChangesAsync();

        var source = await _accountRepository.GetByIdAsync(rule.SourceAccountId);
        var destination = await _accountRepository.GetByIdAsync(rule.DestinationAccountId);

        return Ok(new RoundupRuleDto(
            rule.Id,
            rule.SourceAccountId,
            source?.Name ?? "Unknown",
            rule.DestinationAccountId,
            destination?.Name ?? "Unknown",
            rule.IsActive,
            rule.Multiplier
        ));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var rule = await _roundupRepository.GetByIdAsync(id);
        if (rule == null || rule.UserId != UserId)
            return NotFound();

        await _roundupRepository.DeleteAsync(rule);
        await _roundupRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("simulate")]
    public async Task<ActionResult<RoundupSimulationDto>> Simulate([FromBody] RoundupSimulationRequest request)
    {
        var rules = await _roundupRepository.FindAsync(r => r.UserId == UserId && r.IsActive);
        if (!rules.Any())
            return Ok(new RoundupSimulationDto(0, 0, new List<RoundupDetailDto>()));

        var transactions = await _transactionRepository.FindAsync(t =>
            t.UserId == UserId &&
            t.Date.Month == request.Month &&
            t.Date.Year == request.Year &&
            t.Type == Domain.Enums.TransactionType.Expense);

        var details = new List<RoundupDetailDto>();
        decimal totalRoundedUp = 0;

        foreach (var transaction in transactions)
        {
            var rule = rules.FirstOrDefault(r => r.SourceAccountId == transaction.AccountId);
            if (rule == null) continue;

            var roundedAmount = Math.Ceiling(transaction.Amount) * rule.Multiplier;
            var roundupAmount = roundedAmount - transaction.Amount;

            details.Add(new RoundupDetailDto(
                transaction.Date,
                transaction.Description,
                transaction.Amount,
                roundedAmount,
                roundupAmount
            ));

            totalRoundedUp += roundupAmount;
        }

        return Ok(new RoundupSimulationDto(
            totalRoundedUp,
            details.Count,
            details.OrderBy(d => d.Date).ToList()
        ));
    }
}
