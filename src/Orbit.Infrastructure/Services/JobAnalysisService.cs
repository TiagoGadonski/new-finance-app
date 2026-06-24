using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Orbit.Application.Common.DTOs;
using Orbit.Application.Common.Interfaces;

namespace Orbit.Infrastructure.Services;

public class JobAnalysisService : IJobAnalysisService
{
    private const string UserProfile = """
        Desenvolvedor .NET (C#, ASP.NET Core), full-stack com TypeScript/React/Next.js.
        Nível: em transição júnior → pleno (~6 meses como dev full-time PJ, após 2 anos de estágio). NÃO é sênior consolidado.
        Inglês fluente; francês e espanhol intermediários.
        Baseado no Brasil, busca trabalho REMOTO internacional (de preferência pagando em dólar/euro).
        Tem projetos próprios (Orbit/finanças; TaktIQ/fitness) com integração de LLM.
        Critérios para "vale a pena aplicar":
        - Remoto e aceita LATAM/Brasil
        - Nível compatível (mid / mid-senior; evitar vagas sênior 7-8+ anos, staff, lead)
        - Stack bate (.NET/C#/full-stack; Java é aceitável como stack próxima)
        - Paga em dólar/euro ou acima do salário atual
        - Empresa legítima
        """;

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<JobAnalysisService> _logger;
    private readonly string? _apiKey;

    public JobAnalysisService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<JobAnalysisService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _apiKey = configuration["ANTHROPIC_API_KEY"];
    }

    public async Task<JobAnalysisResultDto?> AnalyzeJobTextAsync(string jobText)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            _logger.LogWarning("ANTHROPIC_API_KEY not configured. Job analysis unavailable.");
            return null;
        }

        var jsonTemplate = """
            {
              "Company": "nome da empresa ou null",
              "JobTitle": "título da vaga ou null",
              "Stack": "tecnologias principais separadas por vírgula ou null",
              "Salary": "texto livre com salário/faixa ou null",
              "WorkModel": "remote / hybrid / onsite ou null",
              "AcceptsLatam": true/false/null,
              "SuggestedFit": "High" ou "Medium" ou "Low",
              "Verdict": "parecer honesto e crítico em 2-4 frases",
              "Pros": ["ponto a favor 1", "ponto a favor 2"],
              "Cons": ["risco ou ponto contra 1", "risco ou ponto contra 2"]
            }
            """;

        var prompt = $"""
            Você receberá o texto bruto de uma vaga de emprego e o perfil de um candidato.
            Sua tarefa é:
            1. Extrair os campos estruturados da vaga (não invente — se não estiver no texto, retorne null).
            2. Avaliar o fit do candidato com a vaga de forma HONESTA e CRÍTICA, como um mentor direto.
               Se a vaga pede senioridade acima do nível do candidato, diga claramente.
               Se a stack não bate, diga. Se vale tentar mesmo sem bater 100%, diga por quê.
               Não seja otimista por educação — o objetivo é poupar tempo do candidato.

            Perfil do candidato:
            {UserProfile}

            Texto da vaga:
            {jobText}

            Responda APENAS com JSON válido, sem markdown, sem preâmbulo, sem explicação fora do JSON.
            Formato exato:
            {jsonTemplate}
            """;

        var requestBody = new
        {
            model = "claude-haiku-4-5-20251001",
            max_tokens = 1024,
            messages = new[]
            {
                new { role = "user", content = prompt }
            }
        };

        try
        {
            var client = _httpClientFactory.CreateClient("AnthropicApi");
            client.BaseAddress = new Uri("https://api.anthropic.com");
            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Add("x-api-key", _apiKey);
            client.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("/v1/messages", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Anthropic API error {Status}: {Body}", response.StatusCode, responseBody);
                return null;
            }

            using var doc = JsonDocument.Parse(responseBody);
            var textContent = doc.RootElement
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(textContent))
                return null;

            // Strip markdown code fences if model added them despite instructions
            var cleanJson = textContent.Trim();
            if (cleanJson.StartsWith("```"))
            {
                var start = cleanJson.IndexOf('\n') + 1;
                var end = cleanJson.LastIndexOf("```");
                if (end > start)
                    cleanJson = cleanJson[start..end].Trim();
            }

            var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var raw = JsonSerializer.Deserialize<RawAnalysis>(cleanJson, opts);
            if (raw is null)
                return null;

            return new JobAnalysisResultDto(
                Company: raw.Company,
                JobTitle: raw.JobTitle,
                Stack: raw.Stack,
                Salary: raw.Salary,
                WorkModel: raw.WorkModel,
                AcceptsLatam: raw.AcceptsLatam,
                SuggestedFit: raw.SuggestedFit ?? "Medium",
                Verdict: raw.Verdict ?? "Não foi possível gerar um parecer.",
                Pros: raw.Pros ?? [],
                Cons: raw.Cons ?? []
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to analyze job text");
            return null;
        }
    }

    private sealed class RawAnalysis
    {
        public string? Company { get; set; }
        public string? JobTitle { get; set; }
        public string? Stack { get; set; }
        public string? Salary { get; set; }
        public string? WorkModel { get; set; }
        public bool? AcceptsLatam { get; set; }
        public string? SuggestedFit { get; set; }
        public string? Verdict { get; set; }
        public List<string>? Pros { get; set; }
        public List<string>? Cons { get; set; }
    }
}
