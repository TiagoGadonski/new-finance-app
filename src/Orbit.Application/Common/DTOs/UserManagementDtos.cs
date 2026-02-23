using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

// Full user details for admin view
public record AdminUserDto(
    Guid Id,
    string Name,
    string Username,
    UserRole Role,
    Guid FamilyId,
    string FamilyName,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    bool IsMeiEnabled = false
);

// Request to create a new user (admin only)
// If NewFamilyName is provided, a new family is created for this user.
// Otherwise the user is added to the admin's own family.
public record CreateUserRequest(
    string Name,
    string Username,
    string Password,
    UserRole Role = UserRole.User,
    string? NewFamilyName = null
);

// Request to update user details (admin only)
public record UpdateUserRequest(
    string? Name = null,
    UserRole? Role = null,
    bool? IsMeiEnabled = null
);

// Request to change user password (admin only)
public record ChangeUserPasswordRequest(string NewPassword);

public record FamilyDto(
    Guid Id,
    string Name,
    bool IsActive,
    int UserCount,
    DateTime CreatedAt
);

public record FamilyDetailDto(
    Guid Id,
    string Name,
    bool IsActive,
    List<AdminUserDto> Users,
    DateTime CreatedAt
);
