using Orbit.Domain.Enums;

namespace Orbit.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid UserId { get; }
    Guid FamilyId { get; }
    string Username { get; }
    UserRole Role { get; }
    bool IsAdmin { get; }
}
