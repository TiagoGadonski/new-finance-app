namespace FinanceApp.Domain.Entities;

public class Holiday : BaseEntity
{
    public Guid FamilyId { get; set; }
    public Family Family { get; set; } = null!;

    /// <summary>
    /// Nome do feriado
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Mês (1-12), nullable para feriados variáveis baseados na Páscoa
    /// </summary>
    public int? Month { get; set; }

    /// <summary>
    /// Dia (1-31), nullable para feriados variáveis baseados na Páscoa
    /// </summary>
    public int? Day { get; set; }

    /// <summary>
    /// Se é data fixa ou baseada na Páscoa
    /// </summary>
    public bool IsFixed { get; set; }

    /// <summary>
    /// Offset em dias em relação à Páscoa (ex: -2 = Sexta Santa, +60 = Corpus Christi)
    /// </summary>
    public int? EasterOffset { get; set; }
}
