using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Exceptions;

namespace FinanceApp.Application.Features.Auth.Commands;

public record LoginCommand(string Username, string Password) : IRequest<AuthResponse>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;

    public LoginCommandHandler(IUserRepository userRepository, IAuthService authService)
    {
        _userRepository = userRepository;
        _authService = authService;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByUsernameAsync(request.Username);
        if (user == null)
            throw new UnauthorizedException("Invalid credentials");

        if (!_authService.VerifyPassword(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials");

        var refreshToken = _authService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        var accessToken = _authService.GenerateJwtToken(user);

        return new AuthResponse(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddHours(1),
            new UserDto(user.Id, user.Name, user.Username, user.Role, user.FamilyId, user.Family.Name)
        );
    }
}
