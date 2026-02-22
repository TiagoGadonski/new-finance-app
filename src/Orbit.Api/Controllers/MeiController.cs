using Orbit.Application.Common.DTOs;
using Orbit.Application.Features.Mei.Commands;
using Orbit.Application.Features.Mei.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Orbit.Api.Controllers;

[Route("api/[controller]")]
public class MeiController : BaseAuthenticatedController
{
    private readonly IMediator _mediator;

    public MeiController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Obter dashboard MEI com faturamento e limites
    /// </summary>
    [HttpGet("dashboard/{year}")]
    public async Task<ActionResult<MeiDashboardDto>> GetDashboard(int year)
    {
        var query = new GetMeiDashboardQuery(FamilyId, year);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Obter dashboard MEI do ano atual
    /// </summary>
    [HttpGet("dashboard")]
    public async Task<ActionResult<MeiDashboardDto>> GetCurrentYearDashboard()
    {
        var currentYear = DateTime.Now.Year;
        var query = new GetMeiDashboardQuery(FamilyId, currentYear);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Configurar definições MEI
    /// </summary>
    [HttpPost("configure")]
    public async Task<ActionResult<MeiSettingsDto>> Configure([FromBody] CreateMeiSettingsRequest request)
    {
        var command = new ConfigureMeiSettingsCommand(FamilyId, Username, request);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Obter alertas e recomendações
    /// </summary>
    [HttpGet("alerts/{year}")]
    public async Task<ActionResult<List<MeiAlertDto>>> GetAlerts(int year)
    {
        var dashboard = await _mediator.Send(new GetMeiDashboardQuery(FamilyId, year));

        var alerts = new List<MeiAlertDto>();

        if (dashboard.PercentageUsed >= 100)
        {
            alerts.Add(new MeiAlertDto(
                "critical",
                $"Limite MEI excedido em {dashboard.PercentageUsed - 100:F1}%",
                dashboard.PercentageUsed,
                dashboard.RemainingRevenue,
                "Você precisa migrar para Microempresa (ME) imediatamente. Consulte um contador."
            ));
        }
        else if (dashboard.PercentageUsed >= 90)
        {
            alerts.Add(new MeiAlertDto(
                "danger",
                $"{dashboard.PercentageUsed:F1}% do limite utilizado",
                dashboard.PercentageUsed,
                dashboard.RemainingRevenue,
                $"Restam apenas R$ {dashboard.RemainingRevenue:N2}. Evite novas receitas ou prepare-se para migrar."
            ));
        }
        else if (dashboard.PercentageUsed >= 80)
        {
            alerts.Add(new MeiAlertDto(
                "warning",
                $"{dashboard.PercentageUsed:F1}% do limite utilizado",
                dashboard.PercentageUsed,
                dashboard.RemainingRevenue,
                "Atenção: você está próximo do limite. Monitore suas receitas com cuidado."
            ));
        }
        else if (dashboard.PercentageUsed >= 70)
        {
            alerts.Add(new MeiAlertDto(
                "info",
                $"{dashboard.PercentageUsed:F1}% do limite utilizado",
                dashboard.PercentageUsed,
                dashboard.RemainingRevenue,
                "Você está em um bom ritmo. Continue monitorando mensalmente."
            ));
        }

        // Alerta de projeção
        if (dashboard.ProjectedAnnualRevenue > dashboard.ProportionalLimit)
        {
            var excessProjected = dashboard.ProjectedAnnualRevenue - dashboard.ProportionalLimit;
            alerts.Add(new MeiAlertDto(
                "warning",
                "Projeção indica que você pode ultrapassar o limite",
                (dashboard.ProjectedAnnualRevenue / dashboard.ProportionalLimit) * 100,
                dashboard.RemainingRevenue,
                $"Com a média atual, você pode exceder o limite em R$ {excessProjected:N2}. Considere reduzir o ritmo."
            ));
        }

        return Ok(alerts);
    }
}
