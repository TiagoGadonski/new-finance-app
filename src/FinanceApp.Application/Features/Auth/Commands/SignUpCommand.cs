using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Exceptions;

namespace FinanceApp.Application.Features.Auth.Commands;

public record SignUpCommand(string Name, string Email, string Password) : IRequest<AuthResponse>;

public class SignUpCommandHandler : IRequestHandler<SignUpCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;

    public SignUpCommandHandler(IUserRepository userRepository, IAuthService authService)
    {
        _userRepository = userRepository;
        _authService = authService;
    }

    public async Task<AuthResponse> Handle(SignUpCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
            throw new DomainException("Email already registered");

        var refreshToken = _authService.GenerateRefreshToken();

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            PasswordHash = _authService.HashPassword(request.Password),
            RefreshToken = refreshToken,
            RefreshTokenExpiry = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        var accessToken = _authService.GenerateJwtToken(user);

        return new AuthResponse(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddHours(1),
            new UserDto(user.Id, user.Name, user.Email)
        );
    }
}
