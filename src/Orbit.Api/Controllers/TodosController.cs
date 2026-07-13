using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;
using Orbit.Infrastructure.Data;

namespace Orbit.Api.Controllers;

[Route("api/todos")]
public class TodosController : BaseAuthenticatedController
{
    private readonly IRepository<TodoItem> _todoRepository;
    private readonly IRepository<TodoComment> _commentRepository;
    private readonly ApplicationDbContext _context;

    public TodosController(
        IRepository<TodoItem> todoRepository,
        IRepository<TodoComment> commentRepository,
        ApplicationDbContext context)
    {
        _todoRepository = todoRepository;
        _commentRepository = commentRepository;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TodoItemDto>>> GetAll(
        [FromQuery] bool? completed = null,
        [FromQuery] string? category = null)
    {
        var query = _context.TodoItems
            .Include(t => t.Comments)
            .Where(t => t.FamilyId == FamilyId);

        if (completed.HasValue)
            query = query.Where(t => t.IsCompleted == completed.Value);

        if (!string.IsNullOrEmpty(category) && Enum.TryParse<Orbit.Domain.Enums.TodoCategory>(category, out var cat))
            query = query.Where(t => t.Category == cat);

        var todos = await query.ToListAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        return Ok(todos
            .OrderBy(t => t.IsCompleted)
            .ThenBy(t => t.DueDate.HasValue ? 0 : 1)
            .ThenBy(t => t.DueDate ?? DateOnly.MaxValue)
            .ThenByDescending(t => t.Priority)
            .Select(MapToDto)
            .ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TodoItemDto>> GetById(Guid id)
    {
        var todo = await _context.TodoItems
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id && t.FamilyId == FamilyId);

        if (todo == null) return NotFound();
        return Ok(MapToDto(todo));
    }

    [HttpGet("stats")]
    public async Task<ActionResult<TodoStatsDto>> GetStats()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var soon = today.AddDays(3);
        var weekAgo = DateTime.UtcNow.AddDays(-7);

        var todos = await _todoRepository.FindAsync(t => t.FamilyId == FamilyId);

        var pending = todos.Where(t => !t.IsCompleted).ToList();
        return Ok(new TodoStatsDto(
            Pending: pending.Count,
            Overdue: pending.Count(t => t.DueDate.HasValue && t.DueDate.Value < today),
            DueToday: pending.Count(t => t.DueDate.HasValue && t.DueDate.Value == today),
            DueSoon: pending.Count(t => t.DueDate.HasValue && t.DueDate.Value > today && t.DueDate.Value <= soon),
            CompletedThisWeek: todos.Count(t => t.IsCompleted && t.CompletedAt.HasValue && t.CompletedAt.Value >= weekAgo)
        ));
    }

    [HttpPost]
    public async Task<ActionResult<TodoItemDto>> Create([FromBody] CreateTodoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest("Title is required.");

        var todo = new TodoItem
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Title = request.Title.Trim(),
            Description = request.Description,
            DueDate = request.DueDate,
            Priority = request.Priority,
            Category = request.Category,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        await _todoRepository.AddAsync(todo);
        await _todoRepository.SaveChangesAsync();

        todo.Comments = new List<TodoComment>();
        return Ok(MapToDto(todo));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TodoItemDto>> Update(Guid id, [FromBody] UpdateTodoRequest request)
    {
        var todo = await _context.TodoItems
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id && t.FamilyId == FamilyId);

        if (todo == null) return NotFound();

        todo.Title = request.Title.Trim();
        todo.Description = request.Description;
        todo.DueDate = request.DueDate;
        todo.Priority = request.Priority;
        todo.Category = request.Category;

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

    [HttpPost("{id}/done")]
    public async Task<ActionResult<TodoItemDto>> MarkDone(Guid id)
    {
        var todo = await _context.TodoItems
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id && t.FamilyId == FamilyId);

        if (todo == null) return NotFound();

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
        if (todo == null || todo.FamilyId != FamilyId) return NotFound();

        await _todoRepository.DeleteAsync(todo);
        await _todoRepository.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/comments")]
    public async Task<ActionResult<TodoCommentDto>> AddComment(Guid id, [FromBody] AddTodoCommentRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
            return BadRequest("Text is required.");

        var todo = await _todoRepository.GetByIdAsync(id);
        if (todo == null || todo.FamilyId != FamilyId) return NotFound();

        var comment = new TodoComment
        {
            Id = Guid.NewGuid(),
            TodoItemId = id,
            Text = request.Text.Trim(),
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        await _commentRepository.AddAsync(comment);
        await _commentRepository.SaveChangesAsync();

        return Ok(new TodoCommentDto(comment.Id, comment.Text, comment.CreatedAt, comment.CreatedByUsername));
    }

    private static TodoItemDto MapToDto(TodoItem t) => new(
        t.Id, t.Title, t.Description, t.DueDate,
        t.Priority, t.Category,
        t.IsCompleted, t.CompletedAt,
        t.CreatedByUsername, t.CreatedAt, t.UpdatedByUsername, t.UpdatedAt,
        t.Comments.OrderBy(c => c.CreatedAt).Select(c => new TodoCommentDto(c.Id, c.Text, c.CreatedAt, c.CreatedByUsername)).ToList()
    );
}
