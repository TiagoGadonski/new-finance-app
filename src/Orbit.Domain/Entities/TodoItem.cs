using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class TodoItem : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly? DueDate { get; set; }
    public TodoPriority? Priority { get; set; }
    public TodoCategory? Category { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }

    public Family Family { get; set; } = null!;
    public ICollection<TodoComment> Comments { get; set; } = new List<TodoComment>();
}
