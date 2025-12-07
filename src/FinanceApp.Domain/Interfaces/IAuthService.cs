using FinanceApp.Domain.Entities;

namespace FinanceApp.Domain.Interfaces;

public interface IAuthService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
    string GenerateJwtToken(User user);
    string GenerateRefreshToken();
}
