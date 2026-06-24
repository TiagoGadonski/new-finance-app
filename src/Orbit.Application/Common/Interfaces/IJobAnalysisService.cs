using Orbit.Application.Common.DTOs;

namespace Orbit.Application.Common.Interfaces;

public interface IJobAnalysisService
{
    Task<JobAnalysisResultDto?> AnalyzeJobTextAsync(string jobText);
}
