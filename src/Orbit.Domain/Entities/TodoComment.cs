namespace Orbit.Domain.Entities;

public class TodoComment : BaseEntity
{
    public Guid TodoItemId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string CreatedByUsername { get; set; } = string.Empty;

    public TodoItem TodoItem { get; set; } = null!;
}
