using Orbit.Domain.Enums;

namespace Orbit.Domain.Entities;

public class JobApplication : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string? Company { get; set; }
    public string? JobUrl { get; set; }
    public ApplicationSource Source { get; set; } = ApplicationSource.Other;
    public string? JobTitle { get; set; }
    public string? Stack { get; set; }
    public string? Salary { get; set; }
    public ApplicationFit? Fit { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Applied;
    public string? NextStep { get; set; }
    public DateOnly? NextStepDate { get; set; }
    public string? Notes { get; set; }
    public DateOnly AppliedDate { get; set; }

    public Family Family { get; set; } = null!;
}
