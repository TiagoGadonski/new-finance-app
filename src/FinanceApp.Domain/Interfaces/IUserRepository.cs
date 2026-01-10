using FinanceApp.Domain.Entities;

namespace FinanceApp.Domain.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByUsernameAsync(string username);
    Task<bool> UsernameExistsAsync(string username);
    Task<User?> GetByRefreshTokenAsync(string refreshToken);
}
