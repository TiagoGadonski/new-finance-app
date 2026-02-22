namespace Orbit.Domain.Interfaces;

public interface ITelegramService
{
    bool IsConfigured { get; }
    Task SendMessageAsync(string message);
}
