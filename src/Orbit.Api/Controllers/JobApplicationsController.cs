using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;
using Orbit.Domain.Interfaces;
using Orbit.Application.Common.Interfaces;

namespace Orbit.Api.Controllers;

public record AnalyzeJobRequest(string JobText);

[Route("api/[controller]")]
public class JobApplicationsController : BaseAuthenticatedController
{
    private readonly IRepository<JobApplication> _repo;
    private readonly IJobAnalysisService _analysisService;
    private const int WeeklyGoal = 5;

    public JobApplicationsController(IRepository<JobApplication> repo, IJobAnalysisService analysisService)
    {
        _repo = repo;
        _analysisService = analysisService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetAll()
    {
        var items = await _repo.FindAsync(j => j.FamilyId == FamilyId);
        return Ok(items.OrderByDescending(j => j.AppliedDate).Select(MapToDto));
    }

    [HttpGet("stats")]
    public async Task<ActionResult<JobApplicationStatsDto>> GetStats()
    {
        var all = (await _repo.FindAsync(j => j.FamilyId == FamilyId)).ToList();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
        var appliedThisWeek = all.Count(j => j.AppliedDate >= startOfWeek);

        var responseStatuses = new[] { ApplicationStatus.InProcess, ApplicationStatus.Interview, ApplicationStatus.TechnicalTest, ApplicationStatus.Offer };

        var conversionBySource = all
            .GroupBy(j => j.Source)
            .Select(g => new SourceConversionDto(
                g.Key,
                g.Count(),
                g.Count(j => responseStatuses.Contains(j.Status))
            ))
            .OrderByDescending(c => c.Total);

        var active = all.Where(j => j.Status != ApplicationStatus.Rejected && j.Status != ApplicationStatus.NoResponse).ToList();

        return Ok(new JobApplicationStatsDto(
            Total: all.Count,
            AppliedThisWeek: appliedThisWeek,
            WeeklyGoal: WeeklyGoal,
            ActiveCount: active.Count,
            InProcessCount: all.Count(j => j.Status == ApplicationStatus.InProcess),
            InterviewCount: all.Count(j => j.Status == ApplicationStatus.Interview),
            TechnicalTestCount: all.Count(j => j.Status == ApplicationStatus.TechnicalTest),
            OfferCount: all.Count(j => j.Status == ApplicationStatus.Offer),
            RejectedCount: all.Count(j => j.Status == ApplicationStatus.Rejected),
            NoResponseCount: all.Count(j => j.Status == ApplicationStatus.NoResponse),
            ConversionBySource: conversionBySource
        ));
    }

    [HttpPost]
    public async Task<ActionResult<JobApplicationDto>> Create([FromBody] CreateJobApplicationRequest request)
    {
        var entity = new JobApplication
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Company = request.Company,
            JobUrl = request.JobUrl,
            Source = request.Source,
            JobTitle = request.JobTitle,
            Stack = request.Stack,
            Salary = request.Salary,
            Fit = request.Fit,
            Status = ApplicationStatus.Applied,
            NextStep = request.NextStep,
            NextStepDate = request.NextStepDate,
            Notes = request.Notes,
            AppliedDate = request.AppliedDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        await _repo.AddAsync(entity);
        await _repo.SaveChangesAsync();

        return Ok(MapToDto(entity));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<JobApplicationDto>> Update(Guid id, [FromBody] UpdateJobApplicationRequest request)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null || entity.FamilyId != FamilyId) return NotFound();

        entity.Company = request.Company;
        entity.JobUrl = request.JobUrl;
        entity.Source = request.Source;
        entity.JobTitle = request.JobTitle;
        entity.Stack = request.Stack;
        entity.Salary = request.Salary;
        entity.Fit = request.Fit;
        entity.Status = request.Status;
        entity.NextStep = request.NextStep;
        entity.NextStepDate = request.NextStepDate;
        entity.Notes = request.Notes;
        entity.AppliedDate = request.AppliedDate;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedByUsername = Username;

        await _repo.UpdateAsync(entity);
        await _repo.SaveChangesAsync();

        return Ok(MapToDto(entity));
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<JobApplicationDto>> PatchStatus(Guid id, [FromBody] PatchStatusRequest request)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null || entity.FamilyId != FamilyId) return NotFound();

        entity.Status = request.Status;
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedByUsername = Username;

        await _repo.UpdateAsync(entity);
        await _repo.SaveChangesAsync();

        return Ok(MapToDto(entity));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null || entity.FamilyId != FamilyId) return NotFound();

        await _repo.DeleteAsync(entity);
        await _repo.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> Analyze([FromBody] AnalyzeJobRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.JobText))
            return BadRequest("jobText is required");

        var result = await _analysisService.AnalyzeJobTextAsync(request.JobText);
        if (result is null)
            return StatusCode(422, new { error = "Não consegui analisar a vaga. Tente colar o texto novamente ou cadastre manualmente." });

        return Ok(result);
    }

    private static JobApplicationDto MapToDto(JobApplication j) => new(
        j.Id,
        j.Company,
        j.JobUrl,
        j.Source,
        j.JobTitle,
        j.Stack,
        j.Salary,
        j.Fit,
        j.Status,
        j.NextStep,
        j.NextStepDate,
        j.Notes,
        j.AppliedDate,
        j.CreatedByUsername,
        j.CreatedAt,
        j.UpdatedByUsername,
        j.UpdatedAt
    );
}
