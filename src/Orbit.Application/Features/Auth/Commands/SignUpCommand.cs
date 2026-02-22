using MediatR;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;
using Orbit.Domain.Exceptions;

namespace Orbit.Application.Features.Auth.Commands;

public record SignUpCommand(string Name, string Username, string Password, Guid? FamilyId = null) : IRequest<AuthResponse>;

public class SignUpCommandHandler : IRequestHandler<SignUpCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IFamilyRepository _familyRepository;
    private readonly IAuthService _authService;

    public SignUpCommandHandler(IUserRepository userRepository, IFamilyRepository familyRepository, IAuthService authService)
    {
        _userRepository = userRepository;
        _familyRepository = familyRepository;
        _authService = authService;
    }

    public async Task<AuthResponse> Handle(SignUpCommand request, CancellationToken cancellationToken)
    {
        // Validate password strength
        if (string.IsNullOrEmpty(request.Password) || request.Password.Length < 8)
            throw new DomainException("Senha deve ter pelo menos 8 caracteres");
        if (!System.Text.RegularExpressions.Regex.IsMatch(request.Password, @"[A-Z]"))
            throw new DomainException("Senha deve conter pelo menos uma letra maiúscula");
        if (!System.Text.RegularExpressions.Regex.IsMatch(request.Password, @"[a-z]"))
            throw new DomainException("Senha deve conter pelo menos uma letra minúscula");
        if (!System.Text.RegularExpressions.Regex.IsMatch(request.Password, @"[0-9]"))
            throw new DomainException("Senha deve conter pelo menos um número");
        if (!System.Text.RegularExpressions.Regex.IsMatch(request.Password, @"[^a-zA-Z0-9]"))
            throw new DomainException("Senha deve conter pelo menos um caractere especial");

        // Validar username format (3-20 chars, alphanumeric + underscore/hyphen)
        if (request.Username.Length < 3 || request.Username.Length > 20)
            throw new DomainException("Username must be between 3 and 20 characters");

        if (!System.Text.RegularExpressions.Regex.IsMatch(request.Username, @"^[a-zA-Z0-9_-]+$"))
            throw new DomainException("Username can only contain letters, numbers, underscores and hyphens");

        var existingUser = await _userRepository.GetByUsernameAsync(request.Username);
        if (existingUser != null)
            throw new DomainException("Username already registered");

        // Se FamilyId não fornecido, criar nova Family
        Family family;
        if (request.FamilyId.HasValue)
        {
            family = await _familyRepository.GetByIdAsync(request.FamilyId.Value)
                ?? throw new NotFoundException("Family", request.FamilyId.Value);
        }
        else
        {
            family = new Family
            {
                Id = Guid.NewGuid(),
                Name = $"{request.Name}'s Family",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            await _familyRepository.AddAsync(family);
            await _familyRepository.SaveChangesAsync();
        }

        var refreshToken = _authService.GenerateRefreshToken();

        var user = new User
        {
            Id = Guid.NewGuid(),
            FamilyId = family.Id,
            Name = request.Name,
            Username = request.Username,
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
            new UserDto(user.Id, user.Name, user.Username, user.Role, family.Id, family.Name)
        );
    }
}
