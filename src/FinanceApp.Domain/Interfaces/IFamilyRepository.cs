using FinanceApp.Domain.Entities;

namespace FinanceApp.Domain.Interfaces;

public interface IFamilyRepository : IRepository<Family>
{
    Task<Family?> GetWithUsersAsync(Guid familyId);
    Task<IEnumerable<Family>> GetAllWithUsersAsync();
}
