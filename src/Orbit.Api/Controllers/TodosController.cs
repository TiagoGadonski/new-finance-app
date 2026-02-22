using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;

namespace Orbit.Api.Controllers;

[Route("api/todos")]
public class TodosController : BaseAuthenticatedController
{
    private readonly IRepository<TodoItem> _todoRepository;

    public TodosController(IRepository<TodoItem> todoRepository)
    {
        _todoRepository = todoRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TodoItemDto>>> GetAll([FromQuery] bool? completed = null)
    {
        var todos = completed.HasValue
            ? await _todoRepository.FindAsync(t => t.FamilyId == FamilyId && t.IsCompleted == completed.Value)
            : await _todoRepository.FindAsync(t => t.FamilyId == FamilyId);

        return Ok(todos.OrderByDescending(t => t.CreatedAt).Select(MapToDto).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<TodoItemDto>> Create([FromBody] CreateTodoRequest request)
    {
        var todo = new TodoItem
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Title = request.Title,
            Description = request.Description,
            DueDate = request.DueDate,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        await _todoRepository.AddAsync(todo);
        await _todoRepository.SaveChangesAsync();

        return Ok(MapToDto(todo));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TodoItemDto>> Update(Guid id, [FromBody] UpdateTodoRequest request)
    {
        var todo = await _todoRepository.GetByIdAsync(id);
        if (todo == null || todo.FamilyId != FamilyId)
            return NotFound();

        todo.Title = request.Title;
        todo.Description = request.Description;
        todo.DueDate = request.DueDate;

        if (request.IsCompleted && !todo.IsCompleted)
            todo.CompletedAt = DateTime.UtcNow;
        else if (!request.IsCompleted)
            todo.CompletedAt = null;

        todo.IsCompleted = request.IsCompleted;
        todo.UpdatedAt = DateTime.UtcNow;
        todo.UpdatedByUsername = Username;

        await _todoRepository.UpdateAsync(todo);
        await _todoRepository.SaveChangesAsync();

        return Ok(MapToDto(todo));
    }

    [HttpPost("{id}/toggle")]
    public async Task<ActionResult<TodoItemDto>> Toggle(Guid id)
    {
        var todo = await _todoRepository.GetByIdAsync(id);
        if (todo == null || todo.FamilyId != FamilyId)
            return NotFound();

        todo.IsCompleted = !todo.IsCompleted;
        todo.CompletedAt = todo.IsCompleted ? DateTime.UtcNow : null;
        todo.UpdatedAt = DateTime.UtcNow;
        todo.UpdatedByUsername = Username;

        await _todoRepository.UpdateAsync(todo);
        await _todoRepository.SaveChangesAsync();

        return Ok(MapToDto(todo));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var todo = await _todoRepository.GetByIdAsync(id);
        if (todo == null || todo.FamilyId != FamilyId)
            return NotFound();

        await _todoRepository.DeleteAsync(todo);
        await _todoRepository.SaveChangesAsync();

        return NoContent();
    }

    private static TodoItemDto MapToDto(TodoItem t) => new(
        t.Id, t.Title, t.Description, t.DueDate,
        t.IsCompleted, t.CompletedAt,
        t.CreatedByUsername, t.CreatedAt, t.UpdatedByUsername, t.UpdatedAt
    );
}
