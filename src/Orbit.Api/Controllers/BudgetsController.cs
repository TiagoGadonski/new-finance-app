using Microsoft.AspNetCore.Mvc;
using MediatR;
using Orbit.Application.Common.DTOs;
using Orbit.Application.Features.Budgets.Queries;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;

namespace Orbit.Api.Controllers;

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
            AlertSent = false,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        await _budgetRepository.AddAsync(budget);
        await _budgetRepository.SaveChangesAsync();

        // Reload with category
        var created = await _budgetRepository.GetByIdAsync(budget.Id, b => b.Category);
        return Ok(MapToDto(created!));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BudgetDto>>> GetAll()
    {
        var budgets = await _budgetRepository.FindAsync(
            b => b.FamilyId == FamilyId,
            b => b.Category);

        return Ok(budgets.Select(MapToDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BudgetDto>> GetById(Guid id)
    {
        var budget = await _budgetRepository.GetByIdAsync(id, b => b.Category);
        if (budget == null || budget.FamilyId != FamilyId)
            return NotFound();

        return Ok(MapToDto(budget));
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
        budget.UpdatedByUsername = Username;

        await _budgetRepository.UpdateAsync(budget);
        await _budgetRepository.SaveChangesAsync();

        return Ok(MapToDto(budget));
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

    private static BudgetDto MapToDto(Budget b) => new(
        b.Id, b.CategoryId, b.Category?.Name ?? "N/A", b.Limit, b.Spent,
        b.Limit - b.Spent, b.PercentageUsed, b.Month, b.Year, b.ShouldAlert,
        b.CreatedByUsername, b.CreatedAt, b.UpdatedByUsername, b.UpdatedAt
    );
}
