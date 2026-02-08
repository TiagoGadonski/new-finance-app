using Microsoft.AspNetCore.Mvc;
using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Application.Features.Budgets.Queries;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;

namespace FinanceApp.Api.Controllers;

[Route("api/[controller]")]
public class BudgetsController : BaseAuthenticatedController
{
    private readonly IMediator _mediator;
    private readonly IRepository<Budget> _budgetRepository;

    public BudgetsController(IMediator mediator, IRepository<Budget> budgetRepository)
    {
        _mediator = mediator;
        _budgetRepository = budgetRepository;
    }

    [HttpPost]
    public async Task<ActionResult<BudgetDto>> Create([FromBody] CreateBudgetRequest request)
    {
        var budget = new Budget
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            CategoryId = request.CategoryId,
            Limit = request.Limit,
            Month = request.Month,
            Year = request.Year,
            Spent = 0,
            AlertSent = false
        };

        await _budgetRepository.AddAsync(budget);
        await _budgetRepository.SaveChangesAsync();

        return Ok(budget);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BudgetDto>>> GetAll()
    {
        var budgets = await _budgetRepository.FindAsync(
            b => b.FamilyId == FamilyId,
            b => b.Category);

        var dtos = budgets.Select(b => new BudgetDto(
            b.Id,
            b.CategoryId,
            b.Category?.Name ?? "N/A",
            b.Limit,
            b.Spent,
            b.Limit - b.Spent,
            b.PercentageUsed,
            b.Month,
            b.Year,
            b.ShouldAlert
        )).ToList();

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetDto>> GetById(Guid id)
    {
        var budget = await _budgetRepository.GetByIdAsync(id, b => b.Category);
        if (budget == null || budget.FamilyId != FamilyId)
            return NotFound();

        return Ok(new BudgetDto(
            budget.Id,
            budget.CategoryId,
            budget.Category?.Name ?? "N/A",
            budget.Limit,
            budget.Spent,
            budget.Limit - budget.Spent,
            budget.PercentageUsed,
            budget.Month,
            budget.Year,
            budget.ShouldAlert
        ));
    }

    [HttpGet("consolidated/{year}/{month}")]
    public async Task<ActionResult<BudgetConsolidatedDto>> GetConsolidated(int year, int month)
    {
        var query = new GetBudgetConsolidatedQuery(FamilyId, month, year);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BudgetDto>> Update(Guid id, [FromBody] UpdateBudgetRequest request)
    {
        var budget = await _budgetRepository.GetByIdAsync(id, b => b.Category);
        if (budget == null || budget.FamilyId != FamilyId)
            return NotFound();

        budget.Limit = request.Limit;
        budget.UpdatedAt = DateTime.UtcNow;

        await _budgetRepository.UpdateAsync(budget);
        await _budgetRepository.SaveChangesAsync();

        return Ok(new BudgetDto(
            budget.Id,
            budget.CategoryId,
            budget.Category?.Name ?? "N/A",
            budget.Limit,
            budget.Spent,
            budget.Limit - budget.Spent,
            budget.PercentageUsed,
            budget.Month,
            budget.Year,
            budget.ShouldAlert
        ));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var budget = await _budgetRepository.GetByIdAsync(id);
        if (budget == null || budget.FamilyId != FamilyId)
            return NotFound();

        await _budgetRepository.DeleteAsync(budget);
        await _budgetRepository.SaveChangesAsync();

        return NoContent();
    }
}
