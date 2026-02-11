using FinanceApp.Domain.Enums;

namespace FinanceApp.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid FamilyId { get; set; }
    public Guid? UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public string? Link { get; set; }

    // Navigation properties
    public Family Family { get; set; } = null!;
    public User? User { get; set; }
}
