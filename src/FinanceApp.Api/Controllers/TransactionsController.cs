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

    public TransactionsController(IMediator mediator, IRepository<Transaction> transactionRepository)
    {
        _mediator = mediator;
        _transactionRepository = transactionRepository;
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
        var transaction = await _transactionRepository.GetByIdAsync(id);
        if (transaction == null || transaction.UserId != UserId)
            return NotFound();

        return Ok(transaction);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetAll()
    {
        var transactions = await _transactionRepository.FindAsync(t => t.UserId == UserId);
        return Ok(transactions);
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
}
