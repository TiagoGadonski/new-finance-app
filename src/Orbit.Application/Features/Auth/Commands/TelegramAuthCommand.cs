using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Exceptions;
using Orbit.Domain.Interfaces;

namespace Orbit.Application.Features.Auth.Commands;

public record TelegramAuthCommand(string TelegramChatId, string BotSecret) : IRequest<AuthResponse>;

public class TelegramAuthCommandHandler : IRequestHandler<TelegramAuthCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<TelegramAuthCommandHandler> _logger;

    public TelegramAuthCommandHandler(
        IUserRepository userRepository,
        IAuthService authService,
        IConfiguration configuration,
        ILogger<TelegramAuthCommandHandler> logger)
    {
        _userRepository = userRepository;
        _authService = authService;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<AuthResponse> Handle(TelegramAuthCommand request, CancellationToken cancellationToken)
    {
        var configuredSecret = _configuration["BotSecret"];
        if (string.IsNullOrEmpty(configuredSecret) || request.BotSecret != configuredSecret)
            throw new UnauthorizedException("Invalid bot secret");

        var user = await _userRepository.GetByTelegramChatIdAsync(request.TelegramChatId);
        if (user == null)
            throw new UnauthorizedException("Telegram ID not registered in FinanceApp");

        var refreshToken = _authService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        var accessToken = _authService.GenerateJwtToken(user);

        _logger.LogInformation("Telegram auth for {Username} (chatId: {ChatId})", user.Username, request.TelegramChatId);

        return new AuthResponse(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddHours(1),
            new UserDto(user.Id, user.Name, user.Username, user.Role, user.FamilyId, user.Family.Name, user.IsMeiEnabled)
        );
    }
}
