using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Enums;
using FinanceApp.Domain.Interfaces;
using MediatR;
using System.Globalization;

namespace FinanceApp.Application.Features.Mei.Queries;

public record GetMeiDashboardQuery(Guid UserId, int Year) : IRequest<MeiDashboardDto>;

public class GetMeiDashboardQueryHandler : IRequestHandler<GetMeiDashboardQuery, MeiDashboardDto>
{
    private readonly IRepository<MeiSettings> _meiRepository;
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Category> _categoryRepository;

    public GetMeiDashboardQueryHandler(
        IRepository<MeiSettings> meiRepository,
        IRepository<Transaction> transactionRepository,
        IRepository<Category> categoryRepository)
    {
        _meiRepository = meiRepository;
        _transactionRepository = transactionRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<MeiDashboardDto> Handle(GetMeiDashboardQuery request, CancellationToken cancellationToken)
    {
        // Buscar configurações MEI do usuário
        var meiSettings = (await _meiRepository.FindAsync(m =>
            m.UserId == request.UserId && m.Year == request.Year))
            .FirstOrDefault();

        if (meiSettings == null)
        {
            // Retornar dashboard vazio se não configurado
            return new MeiDashboardDto(
                request.Year,
                81000m,
                81000m,
                0,
                81000m,
                0,
                6750m,
                0,
                0,
                false,
                "Configure suas definições MEI para começar o acompanhamento.",
                new List<MonthlyMeiRevenueDto>()
            );
        }

        // Buscar todas as receitas do ano (tipo Income)
        var yearStart = new DateTime(request.Year, 1, 1);
        var yearEnd = new DateTime(request.Year, 12, 31, 23, 59, 59);

        var incomeTransactions = await _transactionRepository.FindAsync(t =>
            t.UserId == request.UserId &&
            t.Type == TransactionType.Income &&
            t.Date >= yearStart &&
            t.Date <= yearEnd);

        // Se tem categoria principal configurada, filtrar apenas ela
        if (meiSettings.MainCategoryId.HasValue)
        {
            incomeTransactions = incomeTransactions
                .Where(t => t.CategoryId == meiSettings.MainCategoryId.Value)
                .ToList();
        }

        // Calcular totais
        var currentRevenue = incomeTransactions.Sum(t => t.Amount);
        var proportionalLimit = meiSettings.GetProportionalLimit();
        var remainingRevenue = proportionalLimit - currentRevenue;
        var percentageUsed = proportionalLimit > 0 ? (currentRevenue / proportionalLimit) * 100 : 0;
        var monthlyAverageLimit = meiSettings.GetMonthlyAverageLimit();

        // Receita do mês atual
        var currentMonth = DateTime.Now.Month;
        var currentMonthRevenue = incomeTransactions
            .Where(t => t.Date.Month == currentMonth)
            .Sum(t => t.Amount);

        // Projeção anual baseada na média mensal até agora
        var monthsElapsed = currentMonth;
        var averageMonthlyRevenue = monthsElapsed > 0 ? currentRevenue / monthsElapsed : 0;
        var projectedAnnualRevenue = averageMonthlyRevenue * 12;

        // Verificar se está em risco
        var isAtRisk = percentageUsed >= 80 || projectedAnnualRevenue > proportionalLimit;

        // Gerar mensagem de alerta
        string? alertMessage = null;
        if (percentageUsed >= 100)
            alertMessage = $"⚠️ LIMITE EXCEDIDO! Você ultrapassou o limite MEI em {percentageUsed - 100:F1}%. Considere migrar para ME.";
        else if (percentageUsed >= meiSettings.AlertThreshold3)
            alertMessage = $"🚨 ATENÇÃO! Você já utilizou {percentageUsed:F1}% do seu limite MEI. Faltam apenas R$ {remainingRevenue:N2}.";
        else if (percentageUsed >= meiSettings.AlertThreshold2)
            alertMessage = $"⚠️ Alerta: {percentageUsed:F1}% do limite MEI utilizado. Fique atento ao faturamento.";
        else if (percentageUsed >= meiSettings.AlertThreshold1)
            alertMessage = $"💡 Você já atingiu {percentageUsed:F1}% do limite MEI. Monitore suas receitas.";

        // Breakdown mensal
        var monthlyBreakdown = new List<MonthlyMeiRevenueDto>();
        var culture = new CultureInfo("pt-BR");

        for (int month = 1; month <= 12; month++)
        {
            var monthRevenue = incomeTransactions
                .Where(t => t.Date.Month == month)
                .Sum(t => t.Amount);

            var monthName = culture.DateTimeFormat.GetMonthName(month);
            var percentUsed = monthlyAverageLimit > 0 ? (monthRevenue / monthlyAverageLimit) * 100 : 0;

            monthlyBreakdown.Add(new MonthlyMeiRevenueDto(
                month,
                monthName,
                monthRevenue,
                monthlyAverageLimit,
                percentUsed,
                monthRevenue > monthlyAverageLimit
            ));
        }

        return new MeiDashboardDto(
            request.Year,
            meiSettings.AnnualRevenueLimit,
            proportionalLimit,
            currentRevenue,
            remainingRevenue,
            percentageUsed,
            monthlyAverageLimit,
            currentMonthRevenue,
            projectedAnnualRevenue,
            isAtRisk,
            alertMessage,
            monthlyBreakdown
        );
    }
}
