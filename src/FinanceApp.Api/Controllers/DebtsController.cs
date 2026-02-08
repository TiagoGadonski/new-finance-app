using Microsoft.AspNetCore.Mvc;
using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Application.Features.Debts.Commands;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;

namespace FinanceApp.Api.Controllers;

[Route("api/[controller]")]
public class DebtsController : BaseAuthenticatedController
{
    private readonly IMediator _mediator;
    private readonly IRepository<Debt> _debtRepository;

    public DebtsController(IMediator mediator, IRepository<Debt> debtRepository)
    {
        _mediator = mediator;
        _debtRepository = debtRepository;
    }

    [HttpPost]
    public async Task<ActionResult<Debt>> Create([FromBody] CreateDebtRequest request)
    {
        var debt = new Debt
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Name = request.Name,
            TotalAmount = request.TotalAmount,
            RemainingAmount = request.RemainingAmount,
            InterestRate = request.InterestRate,
            MinimumPayment = request.MinimumPayment,
            DueDate = request.DueDate
        };

        await _debtRepository.AddAsync(debt);
        await _debtRepository.SaveChangesAsync();

        return Ok(debt);
    }

    [HttpPost("simulate")]
    public async Task<ActionResult<DebtSimulationDto>> Simulate([FromBody] DebtSimulationRequest request)
    {
        var command = new SimulateDebtPaymentCommand(FamilyId, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Debt>>> GetAll()
    {
        var debts = await _debtRepository.FindAsync(d => d.FamilyId == FamilyId);
        return Ok(debts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Debt>> GetById(Guid id)
    {
        var debt = await _debtRepository.GetByIdAsync(id);
        if (debt == null || debt.FamilyId != FamilyId)
            return NotFound();

        return Ok(debt);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Debt>> Update(Guid id, [FromBody] UpdateDebtRequest request)
    {
        var debt = await _debtRepository.GetByIdAsync(id);
        if (debt == null || debt.FamilyId != FamilyId)
            return NotFound();

        debt.Name = request.Name;
        debt.TotalAmount = request.TotalAmount;
        debt.RemainingAmount = request.RemainingAmount;
        debt.InterestRate = request.InterestRate;
        debt.MinimumPayment = request.MinimumPayment;
        debt.DueDate = request.DueDate;
        debt.UpdatedAt = DateTime.UtcNow;

        await _debtRepository.UpdateAsync(debt);
        await _debtRepository.SaveChangesAsync();

        return Ok(debt);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var debt = await _debtRepository.GetByIdAsync(id);
        if (debt == null || debt.FamilyId != FamilyId)
            return NotFound();

        await _debtRepository.DeleteAsync(debt);
        await _debtRepository.SaveChangesAsync();

        return NoContent();
    }
}
