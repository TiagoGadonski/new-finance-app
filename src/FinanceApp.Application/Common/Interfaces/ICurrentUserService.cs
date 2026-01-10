using FinanceApp.Domain.Enums;

namespace FinanceApp.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid UserId { get; }
    Guid FamilyId { get; }
    string Username { get; }
    UserRole Role { get; }
    bool IsAdmin { get; }
}
