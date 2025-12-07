using Microsoft.AspNetCore.Mvc;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Enums;

namespace FinanceApp.Api.Controllers;

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
            UserId = UserId,
            Name = request.Name,
            TargetAmount = request.TargetAmount,
            CurrentAmount = 0,
            TargetDate = request.TargetDate,
            Status = GoalStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        await _goalRepository.AddAsync(goal);
        await _goalRepository.SaveChangesAsync();

        return Ok(MapToDto(goal));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GoalDto>>> GetAll()
    {
        var goals = await _goalRepository.FindAsync(g => g.UserId == UserId);
        return Ok(goals.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GoalDto>> GetById(Guid id)
    {
        var goal = await _goalRepository.GetByIdAsync(id);
        if (goal == null || goal.UserId != UserId)
            return NotFound();

        return Ok(MapToDto(goal));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<GoalDto>> Update(Guid id, [FromBody] UpdateGoalRequest request)
    {
        var goal = await _goalRepository.GetByIdAsync(id);
        if (goal == null || goal.UserId != UserId)
            return NotFound();

        goal.Name = request.Name;
        goal.TargetAmount = request.TargetAmount;
        goal.CurrentAmount = request.CurrentAmount;
        goal.TargetDate = request.TargetDate;
        goal.Status = request.Status;
        goal.UpdatedAt = DateTime.UtcNow;

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
        if (goal == null || goal.UserId != UserId)
            return NotFound();

        await _goalRepository.DeleteAsync(goal);
        await _goalRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/contribute")]
    public async Task<ActionResult<GoalDto>> Contribute(Guid id, [FromBody] decimal amount)
    {
        var goal = await _goalRepository.GetByIdAsync(id);
        if (goal == null || goal.UserId != UserId)
            return NotFound();

        goal.CurrentAmount += amount;

        if (goal.CurrentAmount >= goal.TargetAmount && goal.Status == GoalStatus.Active)
        {
            goal.Status = GoalStatus.Achieved;
        }

        goal.UpdatedAt = DateTime.UtcNow;

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
        goal.Status
    );
}
