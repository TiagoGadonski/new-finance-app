using MediatR;
using Microsoft.Extensions.Logging;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Exceptions;

namespace Orbit.Application.Features.Auth.Commands;

public record LoginCommand(string Username, string Password) : IRequest<AuthResponse>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(IUserRepository userRepository, IAuthService authService, ILogger<LoginCommandHandler> logger)
    {
        _userRepository = userRepository;
        _authService = authService;
        _logger = logger;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByUsernameAsync(request.Username);
        if (user == null)
        {
            _logger.LogWarning("Failed login attempt for non-existent username: {Username}", request.Username);
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!_authService.VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Failed login attempt for user: {Username} (wrong password)", request.Username);
            throw new UnauthorizedException("Invalid credentials");
        }

        var refreshToken = _authService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        var accessToken = _authService.GenerateJwtToken(user);

        _logger.LogInformation("Successful login for user: {Username}", request.Username);

        return new AuthResponse(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddHours(1),
            new UserDto(user.Id, user.Name, user.Username, user.Role, user.FamilyId, user.Family.Name, user.IsMeiEnabled)
        );
    }
}
