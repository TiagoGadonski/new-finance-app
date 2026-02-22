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
    DateTime? UpdatedAt
);

// Request to create a new user (admin only)
public record CreateUserRequest(
    string Name,
    string Username,
    string Password,
    Guid FamilyId,
    UserRole Role = UserRole.User
);

// Request to update user details (admin only)
public record UpdateUserRequest(
    string? Name = null,
    UserRole? Role = null
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
