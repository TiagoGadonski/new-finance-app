namespace Orbit.Application.Common.DTOs;

public record ClassificationRuleDto(
    Guid Id,
    string Keyword,
    Guid CategoryId,
    string CategoryName,
    int Priority,
    bool IsLearned,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record CreateClassificationRuleRequest(
    string Keyword,
    Guid CategoryId,
    int Priority = 0,
    bool IsLearned = false
);

public record UpdateClassificationRuleRequest(
    string Keyword,
    Guid CategoryId,
    int Priority
);

public record CategorySuggestionDto(
    Guid? CategoryId,
    string? CategoryName,
    string? MatchedKeyword,
    decimal Confidence
);
