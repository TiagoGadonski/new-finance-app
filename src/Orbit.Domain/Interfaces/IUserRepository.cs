using Orbit.Domain.Entities;

namespace Orbit.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
    Task<bool> UsernameExistsAsync(string username);
    Task<User?> GetByRefreshTokenAsync(string refreshToken);
    Task<User?> GetByTelegramChatIdAsync(string telegramChatId);
}
