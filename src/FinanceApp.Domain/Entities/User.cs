using FinanceApp.Domain.Enums;

namespace FinanceApp.Domain.Entities;

public class User : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.User;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    // Navigation properties
    public ICollection<Account> Accounts { get; set; } = new List<Account>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    public ICollection<Goal> Goals { get; set; } = new List<Goal>();
    public ICollection<Debt> Debts { get; set; } = new List<Debt>();
    public ICollection<RoundupRule> RoundupRules { get; set; } = new List<RoundupRule>();
    public ICollection<ClassificationRule> ClassificationRules { get; set; } = new List<ClassificationRule>();
}
