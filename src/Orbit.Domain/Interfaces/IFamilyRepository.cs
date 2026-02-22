using Orbit.Domain.Entities;

namespace Orbit.Domain.Interfaces;

public interface IFamilyRepository : IRepository<Family>
{
    Task<Family?> GetWithUsersAsync(Guid familyId);
    Task<IEnumerable<Family>> GetAllWithUsersAsync();
}
