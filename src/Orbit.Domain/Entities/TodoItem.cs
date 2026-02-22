namespace Orbit.Domain.Entities;

public class TodoItem : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public Family Family { get; set; } = null!;
}
