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
        var command = new CreateTransactionCommand(UserId, request);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("import/csv")]
    public async Task<ActionResult<List<TransactionDto>>> ImportCsv([FromBody] ImportCsvRequest request)
    {
        var command = new ImportCsvCommand(UserId, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TransactionDto>> GetById(Guid id)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id, t => t.Account, t => t.Category);
        if (transaction == null || transaction.UserId != UserId)
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
            transaction.Category?.Name ?? "N/A"
        );

        return Ok(dto);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> GetAll()
    {
        var transactions = await _transactionRepository.FindAsync(
            t => t.UserId == UserId,
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
            t.Category?.Name ?? "N/A"
        )).ToList();

        return Ok(dtos);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<TransactionSummaryDto>> GetSummary([FromQuery] int month, [FromQuery] int year)
    {
        var transactions = await _transactionRepository.FindAsync(t =>
            t.UserId == UserId &&
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

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id);

        if (transaction == null)
            return NotFound();

        if (transaction.UserId != UserId)
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
