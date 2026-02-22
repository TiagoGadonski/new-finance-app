using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;

namespace Orbit.Api.Controllers;

[Route("api/[controller]")]
public class GoalsController : BaseAuthenticatedController
{
    private readonly IRepository<Goal> _goalRepository;

    public GoalsController(IRepository<Goal> goalRepository)
    {
        _goalRepository = goalRepository;
    }

    [HttpPost]
    public async Task<ActionResult<GoalDto>> Create([FromBody] CreateGoalRequest request)
    {
        var goal = new Goal
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Name = request.Name,
            TargetAmount = request.TargetAmount,
            CurrentAmount = 0,
            TargetDate = request.TargetDate,
            Status = GoalStatus.Active,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        await _goalRepository.AddAsync(goal);
        await _goalRepository.SaveChangesAsync();

        return Ok(MapToDto(goal));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GoalDto>>> GetAll()
    {
        var goals = await _goalRepository.FindAsync(g => g.FamilyId == FamilyId);
        return Ok(goals.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GoalDto>> GetById(Guid id)
    {
        var goal = await _goalRepository.GetByIdAsync(id);
        if (goal == null || goal.FamilyId != FamilyId)
            return NotFound();

        return Ok(MapToDto(goal));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<GoalDto>> Update(Guid id, [FromBody] UpdateGoalRequest request)
    {
        var goal = await _goalRepository.GetByIdAsync(id);
        if (goal == null || goal.FamilyId != FamilyId)
            return NotFound();

        goal.Name = request.Name;
        goal.TargetAmount = request.TargetAmount;
        goal.CurrentAmount = request.CurrentAmount;
        goal.TargetDate = request.TargetDate;
        goal.Status = request.Status;
        goal.UpdatedAt = DateTime.UtcNow;
        goal.UpdatedByUsername = Username;

        // Auto-marcar como alcançada se atingiu o valor
        if (goal.CurrentAmount >= goal.TargetAmount && goal.Status == GoalStatus.Active)
        {
            goal.Status = GoalStatus.Achieved;
        }

        await _goalRepository.UpdateAsync(goal);
        await _goalRepository.SaveChangesAsync();

        return Ok(MapToDto(goal));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var goal = await _goalRepository.GetByIdAsync(id);
        if (goal == null || goal.FamilyId != FamilyId)
            return NotFound();

        await _goalRepository.DeleteAsync(goal);
        await _goalRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/contribute")]
    public async Task<ActionResult<GoalDto>> Contribute(Guid id, [FromBody] decimal amount)
    {
        var goal = await _goalRepository.GetByIdAsync(id);
        if (goal == null || goal.FamilyId != FamilyId)
            return NotFound();

        goal.CurrentAmount += amount;

        if (goal.CurrentAmount >= goal.TargetAmount && goal.Status == GoalStatus.Active)
        {
            goal.Status = GoalStatus.Achieved;
        }

        goal.UpdatedAt = DateTime.UtcNow;
        goal.UpdatedByUsername = Username;

        await _goalRepository.UpdateAsync(goal);
        await _goalRepository.SaveChangesAsync();

        return Ok(MapToDto(goal));
    }

    private static GoalDto MapToDto(Goal goal) => new(
        goal.Id,
        goal.Name,
        goal.TargetAmount,
        goal.CurrentAmount,
        goal.RemainingAmount,
        goal.PercentageAchieved,
        goal.TargetDate,
        goal.Status,
        goal.CreatedByUsername,
        goal.CreatedAt,
        goal.UpdatedByUsername,
        goal.UpdatedAt
    );
}
