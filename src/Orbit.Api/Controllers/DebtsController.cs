using Microsoft.AspNetCore.Mvc;
using MediatR;
using Orbit.Application.Common.DTOs;
using Orbit.Application.Features.Debts.Commands;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;

namespace Orbit.Api.Controllers;

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
            DueDate = request.DueDate,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        await _debtRepository.AddAsync(debt);
        await _debtRepository.SaveChangesAsync();

        return Ok(MapToDto(debt));
    }

    [HttpPost("simulate")]
    public async Task<ActionResult<DebtSimulationDto>> Simulate([FromBody] DebtSimulationRequest request)
    {
        var command = new SimulateDebtPaymentCommand(FamilyId, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DebtDto>>> GetAll()
    {
        var debts = await _debtRepository.FindAsync(d => d.FamilyId == FamilyId);
        return Ok(debts.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DebtDto>> GetById(Guid id)
    {
        var debt = await _debtRepository.GetByIdAsync(id);
        if (debt == null || debt.FamilyId != FamilyId)
            return NotFound();

        return Ok(MapToDto(debt));
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
        debt.UpdatedByUsername = Username;

        await _debtRepository.UpdateAsync(debt);
        await _debtRepository.SaveChangesAsync();

        return Ok(MapToDto(debt));
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

    [HttpPatch("{id}/mark-paid")]
    public async Task<ActionResult<DebtDto>> MarkPaid(Guid id)
    {
        var debt = await _debtRepository.GetByIdAsync(id);
        if (debt == null || debt.FamilyId != FamilyId)
            return NotFound();

        debt.LastPaidAt = DateTime.UtcNow;
        debt.RemainingAmount = Math.Max(0, debt.RemainingAmount - debt.MinimumPayment);
        debt.UpdatedAt = DateTime.UtcNow;
        debt.UpdatedByUsername = Username;

        await _debtRepository.UpdateAsync(debt);
        await _debtRepository.SaveChangesAsync();

        return Ok(MapToDto(debt));
    }

    private static DebtDto MapToDto(Debt d)
    {
        var now = DateTime.UtcNow;
        var isPaid = d.LastPaidAt.HasValue && d.LastPaidAt.Value.Month == now.Month && d.LastPaidAt.Value.Year == now.Year;
        return new DebtDto(
            d.Id, d.Name, d.TotalAmount, d.RemainingAmount, d.InterestRate,
            d.MinimumPayment, d.DueDate,
            isPaid, d.IsSettled,
            d.CreatedByUsername, d.CreatedAt, d.UpdatedByUsername, d.UpdatedAt
        );
    }
}
