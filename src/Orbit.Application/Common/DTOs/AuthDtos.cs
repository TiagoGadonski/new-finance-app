using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

public record SignUpRequest(string Name, string Username, string Password, Guid? FamilyId = null);

public record LoginRequest(string Username, string Password);

public record RefreshTokenRequest(string RefreshToken);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

public record UserDto(Guid Id, string Name, string Username, UserRole Role, Guid FamilyId, string FamilyName, bool IsMeiEnabled = false);
