using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

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

// Priority: ExistingFamilyId > NewFamilyName > admin's own family.
public record CreateUserRequest(
    string Name,
    string Username,
    string Password,
    UserRole Role = UserRole.User,
    string? NewFamilyName = null,
    Guid? ExistingFamilyId = null
);

public record UpdateUserRequest(
    string? Name = null,
    UserRole? Role = null,
    bool? IsMeiEnabled = null
);

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
