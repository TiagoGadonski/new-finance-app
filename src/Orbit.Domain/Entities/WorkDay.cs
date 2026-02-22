namespace Orbit.Domain.Entities;

public class WorkDay : BaseEntity
{
    public Guid FamilyId { get; set; }
    public Family Family { get; set; } = null!;

    /// <summary>
    /// Data trabalhada
    /// </summary>
    public DateTime Date { get; set; }

    /// <summary>
    /// Horas trabalhadas neste dia (pode ser diferente do padrão)
    /// </summary>
    public decimal HoursWorked { get; set; }
}
