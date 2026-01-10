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

    [HttpGet("consolidated/{year}/{month}")]
    public async Task<ActionResult<BudgetConsolidatedDto>> GetConsolidated(int year, int month)
    {
        var query = new GetBudgetConsolidatedQuery(FamilyId, month, year);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
