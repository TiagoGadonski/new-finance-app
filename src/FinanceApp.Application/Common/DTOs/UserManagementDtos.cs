using FinanceApp.Domain.Enums;

namespace FinanceApp.Application.Common.DTOs;

// Full user details for admin view
public record AdminUserDto(
    Guid Id,
    string Name,
    string Email,
    UserRole Role,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

// Request to create a new user (admin only)
public record CreateUserRequest(
    string Name,
    string Email,
    string Password,
    UserRole Role
);

// Request to update user details (admin only)
public record UpdateUserRequest(
    string Name,
    string Email,
    UserRole Role
);

// Request to change user password (admin only)
public record ChangeUserPasswordRequest(
    string NewPassword
);
