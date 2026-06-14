using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Entities;
using Orbit.Domain.Interfaces;

namespace Orbit.Api.Controllers;

[Route("api/recurring-income")]
public class RecurringIncomeController : BaseAuthenticatedController
{
    private readonly IRepository<RecurringIncome> _repo;

    public RecurringIncomeController(IRepository<RecurringIncome> repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecurringIncomeDto>>> GetAll()
    {
        var items = await _repo.FindAsync(r => r.FamilyId == FamilyId);
        return Ok(items.Select(Map));
    }

    [HttpPost]
    public async Task<ActionResult<RecurringIncomeDto>> Create([FromBody] CreateRecurringIncomeRequest request)
    {
        var entity = new RecurringIncome
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Description = request.Description,
            Amount = request.Amount,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };
        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();
        return Ok(Map(entity));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RecurringIncomeDto>> Update(Guid id, [FromBody] UpdateRecurringIncomeRequest request)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null || entity.FamilyId != FamilyId) return NotFound();

        entity.Description = request.Description;
        entity.Amount = request.Amount;
        entity.IsActive = request.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedByUsername = Username;
        await _repo.SaveChangesAsync();
        return Ok(Map(entity));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null || entity.FamilyId != FamilyId) return NotFound();
        await _repo.DeleteAsync(entity);
        await _repo.SaveChangesAsync();
        return NoContent();
    }

    private static RecurringIncomeDto Map(RecurringIncome r) => new(
        r.Id, r.Description, r.Amount, r.IsActive,
        r.CreatedByUsername, r.CreatedAt, r.UpdatedByUsername, r.UpdatedAt);
}
