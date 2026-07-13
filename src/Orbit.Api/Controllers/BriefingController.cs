using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Orbit.Application.Common.Interfaces;

namespace Orbit.Api.Controllers;

[Route("api/briefing")]
public class BriefingController : BaseAuthenticatedController
{
    private readonly IBriefingService _briefingService;
    private readonly string? _defaultChatId;

    public BriefingController(IBriefingService briefingService, IConfiguration configuration)
    {
        _briefingService = briefingService;
        _defaultChatId = configuration["TELEGRAM_CHAT_ID"];
    }

    /// <summary>Dispara o briefing matinal manualmente (para teste).</summary>
    [HttpPost("send")]
    public async Task<IActionResult> SendNow([FromQuery] string? chatId = null)
    {
        var target = chatId ?? _defaultChatId;
        if (string.IsNullOrEmpty(target))
            return BadRequest("chatId não configurado. Passe como query param ou configure TELEGRAM_CHAT_ID.");

        await _briefingService.SendBriefingAsync(FamilyId, target);
        return Ok(new { message = "Briefing enviado." });
    }
}
