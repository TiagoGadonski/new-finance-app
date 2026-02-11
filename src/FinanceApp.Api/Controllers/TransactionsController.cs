using Microsoft.AspNetCore.Mvc;
using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Application.Features.Transactions.Commands;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;

namespace FinanceApp.Api.Controllers;

[Route("api/[controller]")]
public class TransactionsController : BaseAuthenticatedController
{
    private readonly IMediator _mediator;
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Account> _accountRepository;
    private readonly IRepository<Subscription> _subscriptionRepository;

    public TransactionsController(
        IMediator mediator,
        IRepository<Transaction> transactionRepository,
        IRepository<Account> accountRepository,
        IRepository<Subscription> subscriptionRepository)
    {
        _mediator = mediator;
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
        _subscriptionRepository = subscriptionRepository;
    }

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create([FromBody] CreateTransactionRequest request)
    {
        var command = new CreateTransactionCommand(FamilyId, Username, request);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("import/csv")]
    public async Task<ActionResult<List<TransactionDto>>> ImportCsv([FromBody] ImportCsvRequest request)
    {
        var command = new ImportCsvCommand(FamilyId, Username, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetById(Guid id)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id, t => t.Account, t => t.Category);
        if (transaction == null || transaction.FamilyId != FamilyId)
            return NotFound();

        return Ok(MapToDto(transaction));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetAll()
    {
        var transactions = await _transactionRepository.FindAsync(
            t => t.FamilyId == FamilyId,
            t => t.Account,
            t => t.Category);

        return Ok(transactions.Select(MapToDto).ToList());
    }

    [HttpGet("summary")]
    public async Task<ActionResult<TransactionSummaryDto>> GetSummary([FromQuery] int month, [FromQuery] int year)
    {
        var transactions = await _transactionRepository.FindAsync(t =>
            t.FamilyId == FamilyId &&
            t.Date.Month == month &&
            t.Date.Year == year);

        var totalIncome = transactions.Where(t => t.Type == Domain.Enums.TransactionType.Income).Sum(t => t.Amount);
        var totalExpense = transactions.Where(t => t.Type == Domain.Enums.TransactionType.Expense).Sum(t => t.Amount);

        var categoryBreakdown = transactions
            .GroupBy(t => new { t.CategoryId, t.Category.Name })
            .Select(g => new CategorySummaryDto(
                g.Key.CategoryId,
                g.Key.Name,
                g.Sum(t => t.Amount),
                g.Count()
            ))
            .ToList();

        return Ok(new TransactionSummaryDto(
            totalIncome,
            totalExpense,
            totalIncome - totalExpense,
            month,
            year,
            categoryBreakdown
        ));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionDto>> Update(Guid id, [FromBody] UpdateTransactionRequest request)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id, t => t.Account, t => t.Category);
        if (transaction == null || transaction.FamilyId != FamilyId)
            return NotFound();

        // Adjust account balance based on amount difference
        var account = await _accountRepository.GetByIdAsync(transaction.AccountId);
        if (account != null)
        {
            // Reverse old amount
            if (transaction.Type == Domain.Enums.TransactionType.Income)
                account.Balance -= transaction.Amount;
            else
                account.Balance += transaction.Amount;

            // Apply new amount
            if (transaction.Type == Domain.Enums.TransactionType.Income)
                account.Balance += request.Amount;
            else
                account.Balance -= request.Amount;

            await _accountRepository.UpdateAsync(account);
        }

        transaction.CategoryId = request.CategoryId;
        transaction.Amount = request.Amount;
        transaction.Description = request.Description;
        transaction.Date = request.Date;
        transaction.IsRecurring = request.IsRecurring;
        transaction.Tags = request.Tags;
        transaction.UpdatedAt = DateTime.UtcNow;
        transaction.UpdatedByUsername = Username;

        await _transactionRepository.UpdateAsync(transaction);
        await _transactionRepository.SaveChangesAsync();

        // Reload with navigation properties
        transaction = await _transactionRepository.GetByIdAsync(id, t => t.Account, t => t.Category);

        return Ok(MapToDto(transaction!));
    }

    [HttpGet("duplicates")]
    public async Task<ActionResult<IEnumerable<DuplicateTransactionGroupDto>>> GetDuplicates()
    {
        var transactions = await _transactionRepository.FindAsync(
            t => t.FamilyId == FamilyId,
            t => t.Account,
            t => t.Category);

        var groups = transactions
            .GroupBy(t => new { Desc = t.Description.ToLower().Trim(), t.Amount })
            .Where(g => g.Count() > 1)
            .Where(g =>
            {
                var dates = g.Select(t => t.Date).OrderBy(d => d).ToList();
                for (int i = 1; i < dates.Count; i++)
                {
                    if ((dates[i] - dates[i - 1]).TotalDays <= 3)
                        return true;
                }
                return false;
            })
            .Select(g => new DuplicateTransactionGroupDto(
                g.First().Description,
                g.Key.Amount,
                g.Select(t => MapToDto(t)).ToList()
            ))
            .ToList();

        return Ok(groups);
    }

    [HttpPost("recurring/generate")]
    public async Task<ActionResult<List<TransactionDto>>> GenerateRecurring()
    {
        var now = DateTime.UtcNow;
        var subscriptions = await _subscriptionRepository.FindAsync(
            s => s.FamilyId == FamilyId && s.Status == Domain.Enums.SubscriptionStatus.Active,
            s => s.Account,
            s => s.Category);

        var created = new List<TransactionDto>();

        foreach (var sub in subscriptions)
        {
            // Check if transaction already exists for this month
            var existing = await _transactionRepository.FindAsync(
                t => t.FamilyId == FamilyId &&
                     t.Description.Contains(sub.Name) &&
                     t.Date.Month == now.Month &&
                     t.Date.Year == now.Year &&
                     t.Amount == sub.Amount);

            if (existing.Any()) continue;

            var billingDate = new DateTime(now.Year, now.Month,
                Math.Min(sub.BillingDay, DateTime.DaysInMonth(now.Year, now.Month)));

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                FamilyId = FamilyId,
                AccountId = sub.AccountId,
                CategoryId = sub.CategoryId,
                Amount = sub.Amount,
                Type = Domain.Enums.TransactionType.Expense,
                Description = $"{sub.Name} (recorrente)",
                Date = billingDate,
                IsRecurring = true,
                CreatedAt = DateTime.UtcNow,
                CreatedByUsername = Username
            };

            var account = await _accountRepository.GetByIdAsync(sub.AccountId);
            if (account != null)
            {
                account.Balance -= transaction.Amount;
                await _accountRepository.UpdateAsync(account);
            }

            await _transactionRepository.AddAsync(transaction);

            created.Add(MapToDto(transaction));
        }

        if (created.Any())
            await _transactionRepository.SaveChangesAsync();

        return Ok(created);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id);

        if (transaction == null)
            return NotFound();

        if (transaction.FamilyId != FamilyId)
            return Forbid();

        // Reverse the account balance change
        var account = await _accountRepository.GetByIdAsync(transaction.AccountId);
        if (account != null)
        {
            if (transaction.Type == Domain.Enums.TransactionType.Income)
                account.Balance -= transaction.Amount;
            else
                account.Balance += transaction.Amount;

            await _accountRepository.UpdateAsync(account);
        }

        await _transactionRepository.DeleteAsync(transaction);
        await _transactionRepository.SaveChangesAsync();

        return NoContent();
    }

    private static TransactionDto MapToDto(Transaction t) => new(
        t.Id, t.AccountId, t.CategoryId, t.Amount, t.Type,
        t.Description, t.Date, t.IsRecurring, t.Tags,
        t.Account?.Name ?? "N/A", t.Category?.Name ?? "N/A",
        t.InstallmentCount, t.CurrentInstallment, t.ParentTransactionId,
        t.CreatedByUsername, t.CreatedAt, t.UpdatedByUsername, t.UpdatedAt
    );
}
