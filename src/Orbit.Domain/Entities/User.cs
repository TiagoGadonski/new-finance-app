using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

/// <summary>
/// Represents a user/login in the system.
/// Multiple users can belong to the same Family and share all financial data.
/// </summary>
public class User : BaseEntity
{
    /// <summary>
    /// The family this user belongs to
    /// </summary>
    public Guid FamilyId { get; set; }

    /// <summary>
    /// Unique username for login (case-insensitive, 3-20 chars, alphanumeric + underscore/hyphen only)
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Display name of the user
    /// </summary>
    public string Name { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    // Navigation properties
    public Family Family { get; set; } = null!;
    // Note: All financial data navigation properties (Accounts, Transactions, etc.)
    // have been moved to Family entity since data is now family-scoped, not user-scoped
}
