namespace FinanceApp.Domain.Entities;

public class ClassificationRule : BaseEntity
{
    public Guid UserId { get; set; }
    public string Keyword { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public int Priority { get; set; } // Maior prioridade = aplicada primeiro
    public bool IsLearned { get; set; } // True se foi aprendida das edições do usuário

    // Navigation properties
    public User User { get; set; } = null!;
    public Category Category { get; set; } = null!;
}
