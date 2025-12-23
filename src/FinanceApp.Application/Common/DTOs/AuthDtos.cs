using FinanceApp.Domain.Enums;

namespace FinanceApp.Application.Common.DTOs;

public record SignUpRequest(string Name, string Email, string Password);

public record LoginRequest(string Email, string Password);

public record RefreshTokenRequest(string RefreshToken);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserDto User
);

public record UserDto(Guid Id, string Name, string Email, UserRole Role);
