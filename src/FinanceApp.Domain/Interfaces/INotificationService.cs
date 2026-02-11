namespace FinanceApp.Domain.Interfaces;

public interface INotificationService
{
    Task CreateAsync(Guid familyId, string title, string message, Domain.Enums.NotificationType type, string? link = null, Guid? userId = null);
}
