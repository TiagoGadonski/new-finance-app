using Microsoft.AspNetCore.Mvc;
using MediatR;
using Orbit.Domain.Interfaces;
using Orbit.Application.Common.DTOs;

namespace Orbit.Api.Controllers;

[Route("api/[controller]")]
public class UserController : BaseAuthenticatedController
{
    private readonly IUserRepository _userRepository;

    public UserController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        var user = await _userRepository.GetByIdAsync(UserId, u => u.Family);
        if (user == null)
            return NotFound();

        return Ok(new UserDto(user.Id, user.Name, user.Username, user.Role, user.FamilyId, user.Family?.Name ?? ""));
    }

    [HttpGet("me/telegram")]
    public async Task<ActionResult<object>> GetTelegramChatId()
    {
        var user = await _userRepository.GetByIdAsync(UserId);
        if (user == null)
            return NotFound();

        return Ok(new { telegramChatId = user.TelegramChatId });
    }

    [HttpPut("me/telegram")]
    public async Task<ActionResult> SetTelegramChatId([FromBody] SetTelegramChatIdRequest request)
    {
        var user = await _userRepository.GetByIdAsync(UserId);
        if (user == null)
            return NotFound();

        user.TelegramChatId = string.IsNullOrWhiteSpace(request.TelegramChatId) ? null : request.TelegramChatId.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new { message = "Telegram configurado com sucesso" });
    }
}

public record SetTelegramChatIdRequest(string? TelegramChatId);
