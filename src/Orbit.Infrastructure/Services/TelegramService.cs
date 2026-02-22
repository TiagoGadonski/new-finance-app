using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Orbit.Domain.Interfaces;

namespace Orbit.Infrastructure.Services;

public class TelegramService : ITelegramService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<TelegramService> _logger;
    private readonly string? _botToken;
    private readonly string? _chatId;

    public TelegramService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<TelegramService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _botToken = configuration["TELEGRAM_BOT_TOKEN"];
        _chatId = configuration["TELEGRAM_CHAT_ID"];
    }

    public bool IsConfigured => !string.IsNullOrEmpty(_botToken) && !string.IsNullOrEmpty(_chatId);

    public async Task SendMessageAsync(string message)
    {
        if (!IsConfigured)
        {
            _logger.LogWarning("Telegram not configured. Skipping message send.");
            return;
        }

        try
        {
            var client = _httpClientFactory.CreateClient("TelegramApi");
            var url = $"https://api.telegram.org/bot{_botToken}/sendMessage";

            var payload = new
            {
                chat_id = _chatId,
                text = message,
                parse_mode = "HTML"
            };

            var content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json");

            var response = await client.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogError("Telegram API error: {StatusCode} - {Body}", response.StatusCode, body);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Telegram message");
        }
    }
}
