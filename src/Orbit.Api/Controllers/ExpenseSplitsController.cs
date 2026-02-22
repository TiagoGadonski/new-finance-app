using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;

namespace Orbit.Api.Controllers;

[Route("api/expense-splits")]
public class ExpenseSplitsController : BaseAuthenticatedController
{
    private readonly IRepository<ExpenseSplit> _splitRepository;
    private readonly IRepository<ExpenseSplitItem> _splitItemRepository;

    public ExpenseSplitsController(
        IRepository<ExpenseSplit> splitRepository,
        IRepository<ExpenseSplitItem> splitItemRepository)
    {
        _splitRepository = splitRepository;
        _splitItemRepository = splitItemRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseSplitDto>>> GetAll()
    {
        var splits = await _splitRepository.FindAsync(
            s => s.FamilyId == FamilyId,
            s => s.Items);

        return Ok(splits.Select(MapToDto).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseSplitDto>> Create([FromBody] CreateExpenseSplitRequest request)
    {
        var split = new ExpenseSplit
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            TransactionId = request.TransactionId,
            TotalAmount = request.TotalAmount,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        foreach (var item in request.Items)
        {
            split.Items.Add(new ExpenseSplitItem
            {
                Id = Guid.NewGuid(),
                ExpenseSplitId = split.Id,
                UserId = item.UserId,
                Username = item.Username,
                Amount = item.Amount,
                IsPaid = false,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _splitRepository.AddAsync(split);
        await _splitRepository.SaveChangesAsync();

        return Ok(MapToDto(split));
    }

    [HttpPost("{id}/items/{itemId}/mark-paid")]
    public async Task<ActionResult<ExpenseSplitDto>> MarkPaid(Guid id, Guid itemId)
    {
        var split = (await _splitRepository.FindAsync(
            s => s.Id == id && s.FamilyId == FamilyId,
            s => s.Items)).FirstOrDefault();

        if (split == null)
            return NotFound();

        var item = split.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return NotFound();

        item.IsPaid = true;
        item.PaidAt = DateTime.UtcNow;

        await _splitItemRepository.UpdateAsync(item);
        await _splitItemRepository.SaveChangesAsync();

        return Ok(MapToDto(split));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var split = await _splitRepository.GetByIdAsync(id);
        if (split == null || split.FamilyId != FamilyId)
            return NotFound();

        await _splitRepository.DeleteAsync(split);
        await _splitRepository.SaveChangesAsync();

        return NoContent();
    }

    private static ExpenseSplitDto MapToDto(ExpenseSplit s) => new(
        s.Id, s.TransactionId, s.TotalAmount, s.Description,
        s.Items.Select(i => new ExpenseSplitItemDto(
            i.Id, i.UserId, i.Username, i.Amount, i.IsPaid, i.PaidAt
        )).ToList(),
        s.CreatedByUsername, s.CreatedAt, s.UpdatedByUsername, s.UpdatedAt
    );
}
