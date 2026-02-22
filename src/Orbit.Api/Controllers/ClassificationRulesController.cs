using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;

namespace Orbit.Api.Controllers;

[Route("api/classification-rules")]
public class ClassificationRulesController : BaseAuthenticatedController
{
    private readonly IRepository<ClassificationRule> _ruleRepository;
    private readonly IClassificationService _classificationService;
    private readonly IRepository<Category> _categoryRepository;

    public ClassificationRulesController(
        IRepository<ClassificationRule> ruleRepository,
        IClassificationService classificationService,
        IRepository<Category> categoryRepository)
    {
        _ruleRepository = ruleRepository;
        _classificationService = classificationService;
        _categoryRepository = categoryRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClassificationRuleDto>>> GetAll()
    {
        var rules = await _ruleRepository.FindAsync(
            r => r.FamilyId == FamilyId,
            r => r.Category);

        return Ok(rules.Select(MapToDto).ToList());
    }

    [HttpPost]
    public async Task<ActionResult<ClassificationRuleDto>> Create([FromBody] CreateClassificationRuleRequest request)
    {
        var rule = new ClassificationRule
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Keyword = request.Keyword,
            CategoryId = request.CategoryId,
            Priority = request.Priority,
            IsLearned = request.IsLearned,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        await _ruleRepository.AddAsync(rule);
        await _ruleRepository.SaveChangesAsync();

        // Reload with navigation
        rule = (await _ruleRepository.FindAsync(r => r.Id == rule.Id, r => r.Category)).First();

        return Ok(MapToDto(rule));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ClassificationRuleDto>> Update(Guid id, [FromBody] UpdateClassificationRuleRequest request)
    {
        var rule = await _ruleRepository.GetByIdAsync(id);
        if (rule == null || rule.FamilyId != FamilyId)
            return NotFound();

        rule.Keyword = request.Keyword;
        rule.CategoryId = request.CategoryId;
        rule.Priority = request.Priority;
        rule.UpdatedAt = DateTime.UtcNow;
        rule.UpdatedByUsername = Username;

        await _ruleRepository.UpdateAsync(rule);
        await _ruleRepository.SaveChangesAsync();

        rule = (await _ruleRepository.FindAsync(r => r.Id == rule.Id, r => r.Category)).First();

        return Ok(MapToDto(rule));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var rule = await _ruleRepository.GetByIdAsync(id);
        if (rule == null || rule.FamilyId != FamilyId)
            return NotFound();

        await _ruleRepository.DeleteAsync(rule);
        await _ruleRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("suggest")]
    public async Task<ActionResult<CategorySuggestionDto>> Suggest([FromQuery] string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            return BadRequest("Description is required");

        var rules = await _ruleRepository.FindAsync(
            r => r.FamilyId == FamilyId,
            r => r.Category);

        var matchedRule = rules
            .Where(r => description.Contains(r.Keyword, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(r => r.Priority)
            .ThenByDescending(r => r.IsLearned)
            .FirstOrDefault();

        if (matchedRule == null)
            return Ok(new CategorySuggestionDto(null, null, null, 0));

        return Ok(new CategorySuggestionDto(
            matchedRule.CategoryId,
            matchedRule.Category?.Name,
            matchedRule.Keyword,
            matchedRule.IsLearned ? 0.7m : 0.9m
        ));
    }

    private static ClassificationRuleDto MapToDto(ClassificationRule r) => new(
        r.Id, r.Keyword, r.CategoryId, r.Category?.Name ?? "N/A",
        r.Priority, r.IsLearned,
        r.CreatedByUsername, r.CreatedAt, r.UpdatedByUsername, r.UpdatedAt
    );
}
