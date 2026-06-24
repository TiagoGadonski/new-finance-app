using Orbit.Domain.Enums;

namespace Orbit.Application.Common.DTOs;

public record JobApplicationDto(
    Guid Id,
    string Company,
    string JobUrl,
    ApplicationSource Source,
    string? JobTitle,
    string? Stack,
    string? Salary,
    ApplicationFit? Fit,
    ApplicationStatus Status,
    string? NextStep,
    DateOnly? NextStepDate,
    string? Notes,
    DateOnly AppliedDate,
    string CreatedByUsername,
    DateTime CreatedAt,
    string? UpdatedByUsername,
    DateTime? UpdatedAt
);

public record CreateJobApplicationRequest(
    string Company,
    string JobUrl,
    ApplicationSource Source,
    string? JobTitle,
    string? Stack,
    string? Salary,
    ApplicationFit? Fit,
    string? NextStep,
    DateOnly? NextStepDate,
    string? Notes,
    DateOnly? AppliedDate
);

public record UpdateJobApplicationRequest(
    string Company,
    string JobUrl,
    ApplicationSource Source,
    string? JobTitle,
    string? Stack,
    string? Salary,
    ApplicationFit? Fit,
    ApplicationStatus Status,
    string? NextStep,
    DateOnly? NextStepDate,
    string? Notes,
    DateOnly AppliedDate
);

public record PatchStatusRequest(ApplicationStatus Status);

public record JobApplicationStatsDto(
    int Total,
    int AppliedThisWeek,
    int WeeklyGoal,
    int ActiveCount,
    int InProcessCount,
    int InterviewCount,
    int TechnicalTestCount,
    int OfferCount,
    int RejectedCount,
    int NoResponseCount,
    IEnumerable<SourceConversionDto> ConversionBySource
);

public record SourceConversionDto(
    ApplicationSource Source,
    int Total,
    int GotResponse
);

public record JobAnalysisResultDto(
    string? Company,
    string? JobTitle,
    string? Stack,
    string? Salary,
    string? WorkModel,
    bool? AcceptsLatam,
    string SuggestedFit,
    string Verdict,
    IReadOnlyList<string> Pros,
    IReadOnlyList<string> Cons
);
