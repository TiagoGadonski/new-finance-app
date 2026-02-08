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

    public TransactionsController(
        IMediator mediator,
        IRepository<Transaction> transactionRepository,
        IRepository<Account> accountRepository)
    {
        _mediator = mediator;
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
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

        var dto = new TransactionDto(
            transaction.Id,
            transaction.AccountId,
            transaction.CategoryId,
            transaction.Amount,
            transaction.Type,
            transaction.Description,
            transaction.Date,
            transaction.IsRecurring,
            transaction.Tags,
            transaction.Account?.Name ?? "N/A",
            transaction.Category?.Name ?? "N/A",
            transaction.InstallmentCount,
            transaction.CurrentInstallment,
            transaction.ParentTransactionId
        );

        return Ok(dto);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetAll()
    {
        var transactions = await _transactionRepository.FindAsync(
            t => t.FamilyId == FamilyId,
            t => t.Account,
            t => t.Category);

        var dtos = transactions.Select(t => new TransactionDto(
            t.Id,
            t.AccountId,
            t.CategoryId,
            t.Amount,
            t.Type,
            t.Description,
            t.Date,
            t.IsRecurring,
            t.Tags,
            t.Account?.Name ?? "N/A",
            t.Category?.Name ?? "N/A",
            t.InstallmentCount,
            t.CurrentInstallment,
            t.ParentTransactionId
        )).ToList();

        return Ok(dtos);
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

        await _transactionRepository.UpdateAsync(transaction);
        await _transactionRepository.SaveChangesAsync();

        // Reload with navigation properties
        transaction = await _transactionRepository.GetByIdAsync(id, t => t.Account, t => t.Category);

        var dto = new TransactionDto(
            transaction!.Id,
            transaction.AccountId,
            transaction.CategoryId,
            transaction.Amount,
            transaction.Type,
            transaction.Description,
            transaction.Date,
            transaction.IsRecurring,
            transaction.Tags,
            transaction.Account?.Name ?? "N/A",
            transaction.Category?.Name ?? "N/A",
            transaction.InstallmentCount,
            transaction.CurrentInstallment,
            transaction.ParentTransactionId
        );

        return Ok(dto);
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
}
