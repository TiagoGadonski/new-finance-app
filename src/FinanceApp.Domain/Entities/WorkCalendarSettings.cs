namespace FinanceApp.Domain.Entities;

public class WorkCalendarSettings : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public Family Family { get; set; } = null!;

    /// <summary>
    /// Valor por hora (R$)
    /// </summary>
    public decimal HourlyRate { get; set; }

    /// <summary>
    /// Horas por dia (default 8)
    /// </summary>
    public decimal HoursPerDay { get; set; } = 8m;
}
