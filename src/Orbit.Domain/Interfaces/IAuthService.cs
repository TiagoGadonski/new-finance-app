using Orbit.Domain.Entities;

namespace Orbit.Domain.Interfaces;

public interface IAuthService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
    string GenerateJwtToken(User user);
    string GenerateRefreshToken();
}
