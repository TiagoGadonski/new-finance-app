using FinanceApp.Domain.Enums;

namespace FinanceApp.Domain.Entities;

public class MeiSettings : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public Family Family { get; set; } = null!;

    /// <summary>
    /// Limite anual de faturamento MEI (R$ 81.000 em 2024)
    /// </summary>
    public decimal AnnualRevenueLimit { get; set; } = 81000m;

    /// <summary>
    /// Ano de referência
    /// </summary>
    public int Year { get; set; }

    /// <summary>
    /// Mês de início da atividade (para cálculo proporcional)
    /// </summary>
    public int StartMonth { get; set; } = 1;

    /// <summary>
    /// Categoria principal do MEI
    /// </summary>
    public Guid? MainCategoryId { get; set; }
    public Category? MainCategory { get; set; }

    /// <summary>
    /// Alertar ao atingir este percentual do limite
    /// </summary>
    public decimal AlertThreshold1 { get; set; } = 70m; // 70%
    public decimal AlertThreshold2 { get; set; } = 80m; // 80%
    public decimal AlertThreshold3 { get; set; } = 90m; // 90%

    /// <summary>
    /// Já enviou alerta de threshold 1
    /// </summary>
    public bool Alert1Sent { get; set; }
    public bool Alert2Sent { get; set; }
    public bool Alert3Sent { get; set; }

    /// <summary>
    /// Calcular limite proporcional baseado no mês de início
    /// Exemplo: iniciou em Julho = 6 meses = 81.000 * (6/12) = 40.500
    /// </summary>
    public decimal GetProportionalLimit()
    {
        if (StartMonth == 1)
            return AnnualRevenueLimit;

        int monthsInYear = 13 - StartMonth; // Meses restantes
        return AnnualRevenueLimit * (monthsInYear / 12m);
    }

    /// <summary>
    /// Calcular média mensal permitida
    /// </summary>
    public decimal GetMonthlyAverageLimit()
    {
        int monthsInYear = StartMonth == 1 ? 12 : (13 - StartMonth);
        return GetProportionalLimit() / monthsInYear;
    }
}
