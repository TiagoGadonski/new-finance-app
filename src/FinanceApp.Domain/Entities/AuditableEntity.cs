namespace FinanceApp.Domain.Entities;

/// <summary>
/// Base class for entities that require audit trail tracking.
/// Uses username strings instead of UserId foreign keys to maintain audit history
/// even if users are deleted, and for easy display in UI.
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    /// <summary>
    /// Username of the user who created this entity (e.g., "pai", "mae")
    /// </summary>
    public string CreatedByUsername { get; set; } = string.Empty;

    /// <summary>
    /// Username of the user who last updated this entity, or null if never updated
    /// </summary>
    public string? UpdatedByUsername { get; set; }
}
