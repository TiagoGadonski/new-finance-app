using FinanceApp.Domain.Entities;

namespace FinanceApp.Domain.Interfaces;

public interface IClassificationService
{
    Task<Guid?> SuggestCategoryAsync(Guid userId, string description);
    Task LearnFromUserChoiceAsync(Guid userId, string description, Guid categoryId);
}
