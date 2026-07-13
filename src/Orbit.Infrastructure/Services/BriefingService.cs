using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Orbit.Application.Common.Interfaces;
using Orbit.Domain.Enums;
using Orbit.Domain.Interfaces;
using Orbit.Infrastructure.Data;

namespace Orbit.Infrastructure.Services;

public class BriefingService : IBriefingService
{
    private readonly ApplicationDbContext _context;
    private readonly ITelegramService _telegram;
    private readonly ILogger<BriefingService> _logger;
    private readonly string? _defaultChatId;

    public BriefingService(
        ApplicationDbContext context,
        ITelegramService telegram,
        IConfiguration configuration,
        ILogger<BriefingService> logger)
    {
        _context = context;
        _telegram = telegram;
        _logger = logger;
        _defaultChatId = configuration["TELEGRAM_CHAT_ID"];
    }

    public async Task SendBriefingAsync(Guid familyId, string chatId, CancellationToken ct = default)
    {
        try
        {
            var text = await BuildBriefingAsync(familyId, ct);
            await _telegram.SendToAsync(text, chatId);
            _logger.LogInformation("Briefing sent to chat {ChatId} for family {FamilyId}", chatId, familyId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send briefing for family {FamilyId}", familyId);
        }
    }

    public async Task SendBriefingToAllFamiliesAsync(CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(_defaultChatId)) return;

        var families = await _context.Families.Select(f => f.Id).ToListAsync(ct);
        foreach (var familyId in families)
            await SendBriefingAsync(familyId, _defaultChatId, ct);
    }

    private async Task<string> BuildBriefingAsync(Guid familyId, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var todayPlusFour = today.AddDays(3);
        var sevenDaysAgo = now.AddDays(-7);
        var weekAgo = today.AddDays(-7);

        var applications = await _context.JobApplications
            .Where(j => j.FamilyId == familyId)
            .ToListAsync(ct);

        var tasks = await _context.TodoItems
            .Where(t => t.FamilyId == familyId && !t.IsCompleted)
            .ToListAsync(ct);

        var sb = new StringBuilder();

        // 1. Saudação
        var dataBr = now.ToString("dddd, dd/MM/yyyy", new System.Globalization.CultureInfo("pt-BR"));
        sb.AppendLine($"☀️ <b>Bom dia! Briefing de {dataBr}</b>");
        sb.AppendLine();

        // 2. Candidaturas com atenção (NextStepDate nos próximos 3 dias)
        var comAtencao = applications
            .Where(j => j.NextStepDate.HasValue && j.NextStepDate.Value >= today && j.NextStepDate.Value <= todayPlusFour)
            .OrderBy(j => j.NextStepDate)
            .ToList();

        sb.AppendLine("📋 <b>Candidaturas com atenção:</b>");
        if (comAtencao.Any())
        {
            foreach (var j in comAtencao)
            {
                var empresa = j.Company ?? j.JobTitle ?? "(sem nome)";
                var prazo = j.NextStepDate!.Value == today ? "hoje" : j.NextStepDate!.Value.ToString("dd/MM");
                var passo = string.IsNullOrEmpty(j.NextStep) ? "" : $" — {j.NextStep}";
                sb.AppendLine($"  • <b>{empresa}</b>{passo} <i>({prazo})</i>");
            }
        }
        else
        {
            // Fallback: candidaturas em processo/entrevista
            var emAndamento = applications
                .Where(j => j.Status is ApplicationStatus.InProcess or ApplicationStatus.Interview or ApplicationStatus.TechnicalTest)
                .ToList();
            if (emAndamento.Any())
            {
                sb.AppendLine("  (nenhum prazo nos próximos 3 dias — em andamento:)");
                foreach (var j in emAndamento.Take(5))
                {
                    var empresa = j.Company ?? j.JobTitle ?? "(sem nome)";
                    var status = j.Status switch
                    {
                        ApplicationStatus.InProcess => "Em processo",
                        ApplicationStatus.Interview => "Entrevista",
                        ApplicationStatus.TechnicalTest => "Teste técnico",
                        _ => j.Status.ToString()
                    };
                    sb.AppendLine($"  • <b>{empresa}</b> — {status}");
                }
            }
            else
            {
                sb.AppendLine("  Nenhuma candidatura urgente. 👍");
            }
        }
        sb.AppendLine();

        // 3. Ritmo da semana
        var metaSemanal = 5;
        var estaSemana = applications.Count(j => j.AppliedDate >= weekAgo && j.AppliedDate <= today);
        var ritmoBarra = new string('█', Math.Min(estaSemana, metaSemanal)) + new string('░', Math.Max(0, metaSemanal - estaSemana));
        sb.AppendLine($"📈 <b>Ritmo da semana:</b> {estaSemana}/{metaSemanal} vagas [{ritmoBarra}]");
        sb.AppendLine();

        // 4. Funil por status
        var funil = applications
            .GroupBy(j => j.Status)
            .Where(g => g.Key is not ApplicationStatus.Rejected and not ApplicationStatus.NoResponse)
            .OrderBy(g => g.Key)
            .ToList();

        if (funil.Any())
        {
            sb.AppendLine("🔽 <b>Funil:</b>");
            var statusLabels = new Dictionary<ApplicationStatus, string>
            {
                [ApplicationStatus.Applied] = "Aplicado",
                [ApplicationStatus.InProcess] = "Em processo",
                [ApplicationStatus.Interview] = "Entrevista",
                [ApplicationStatus.TechnicalTest] = "Teste técnico",
                [ApplicationStatus.Offer] = "Oferta",
                [ApplicationStatus.Rejected] = "Rejeitado",
                [ApplicationStatus.NoResponse] = "Sem resposta",
            };
            foreach (var g in funil)
                sb.AppendLine($"  {statusLabels.GetValueOrDefault(g.Key, g.Key.ToString())}: {g.Count()}");
            sb.AppendLine();
        }

        // 5. Tarefas urgentes
        var urgentes = tasks
            .Where(t => t.DueDate.HasValue && t.DueDate.Value <= today.AddDays(2))
            .OrderBy(t => t.DueDate)
            .ToList();

        sb.AppendLine($"✅ <b>Tarefas urgentes</b> ({tasks.Count} pendentes no total):");
        if (urgentes.Any())
        {
            foreach (var t in urgentes)
            {
                var prazo = t.DueDate!.Value < today ? $"⚠️ vencida em {t.DueDate.Value:dd/MM}" : t.DueDate.Value == today ? "hoje" : t.DueDate.Value.ToString("dd/MM");
                var cat = t.Category.HasValue ? $" [{t.Category}]" : "";
                sb.AppendLine($"  • {t.Title}{cat} <i>({prazo})</i>");
            }
        }
        else
        {
            sb.AppendLine("  Nenhuma tarefa urgente. 👍");
        }
        sb.AppendLine();

        // 6. Fecho
        sb.AppendLine("🚀 Foco no que move o ponteiro. Bom dia!");

        return sb.ToString().TrimEnd();
    }
}
