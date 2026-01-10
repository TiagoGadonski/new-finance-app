using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;

namespace FinanceApp.Application.Services;

public class ClassificationService : IClassificationService
{
    private readonly IRepository<ClassificationRule> _ruleRepository;

    public ClassificationService(IRepository<ClassificationRule> ruleRepository)
    {
        _ruleRepository = ruleRepository;
    }

    public async Task<Guid?> SuggestCategoryAsync(Guid familyId, string description)
    {
        var rules = await _ruleRepository.FindAsync(r => r.FamilyId == familyId);

        var matchedRule = rules
            .Where(r => description.Contains(r.Keyword, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(r => r.Priority)
            .ThenByDescending(r => r.IsLearned)
            .FirstOrDefault();

        return matchedRule?.CategoryId;
    }

    public async Task LearnFromUserChoiceAsync(Guid familyId, string description, Guid categoryId)
    {
        // Extrai palavras-chave relevantes da descrição (palavras com 4+ caracteres)
        var words = description.Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length >= 4)
            .Take(3); // Pega as 3 primeiras palavras relevantes

        foreach (var word in words)
        {
            var wordLower = word.ToLower();
            var existingRule = (await _ruleRepository.FindAsync(r =>
                r.FamilyId == familyId &&
                r.Keyword == wordLower))
                .FirstOrDefault();

            if (existingRule != null)
            {
                // Atualiza a categoria se mudou
                if (existingRule.CategoryId != categoryId)
                {
                    existingRule.CategoryId = categoryId;
                    existingRule.Priority++;
                    await _ruleRepository.UpdateAsync(existingRule);
                }
            }
            else
            {
                // Cria nova regra aprendida
                var newRule = new ClassificationRule
                {
                    Id = Guid.NewGuid(),
                    FamilyId = familyId,
                    Keyword = word.ToLower(),
                    CategoryId = categoryId,
                    Priority = 1,
                    IsLearned = true,
                    CreatedAt = DateTime.UtcNow
                };
                await _ruleRepository.AddAsync(newRule);
            }
        }

        await _ruleRepository.SaveChangesAsync();
    }
}
