using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Exceptions;

namespace FinanceApp.Application.Features.Auth.Commands;

public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResponse>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;

    public RefreshTokenCommandHandler(IUserRepository userRepository, IAuthService authService)
    {
        _userRepository = userRepository;
        _authService = authService;
    }

    public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken);
        if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new UnauthorizedException("Invalid or expired refresh token");

        var newRefreshToken = _authService.GenerateRefreshToken();
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        var accessToken = _authService.GenerateJwtToken(user);

        return new AuthResponse(
            accessToken,
            newRefreshToken,
            DateTime.UtcNow.AddHours(1),
            new UserDto(user.Id, user.Name, user.Email)
        );
    }
}
