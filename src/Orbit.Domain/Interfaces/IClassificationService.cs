using Orbit.Domain.Entities;

namespace Orbit.Domain.Interfaces;

public interface IClassificationService
{
    Task<Guid?> SuggestCategoryAsync(Guid userId, string description);
    Task LearnFromUserChoiceAsync(Guid userId, string description, Guid categoryId);
}
