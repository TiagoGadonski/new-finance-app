using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Entities;
using Orbit.Domain.Interfaces;
using Orbit.Infrastructure.Data;

namespace Orbit.Infrastructure.Repositories;

public class FamilyRepository : Repository<Family>, IFamilyRepository
{
    public FamilyRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<Family?> GetWithUsersAsync(Guid familyId)
    {
        return await _dbSet
            .Include(f => f.Users)
            .FirstOrDefaultAsync(f => f.Id == familyId);
    }

    public async Task<IEnumerable<Family>> GetAllWithUsersAsync()
    {
        return await _dbSet
            .Include(f => f.Users)
            .ToListAsync();
    }
}
