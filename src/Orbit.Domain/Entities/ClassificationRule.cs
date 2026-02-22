namespace Orbit.Domain.Entities;

public class ClassificationRule : AuditableEntity
{
    public Guid FamilyId { get; set; }
    public string Keyword { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public int Priority { get; set; } // Maior prioridade = aplicada primeiro
    public bool IsLearned { get; set; } // True se foi aprendida das edições do usuário

    // Navigation properties
    public Family Family { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
