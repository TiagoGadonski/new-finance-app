namespace FinanceApp.Domain.Entities;

/// <summary>
/// Represents a family/household - the top-level container for all financial data.
/// Multiple users (logins) can belong to the same family and share all financial data.
/// </summary>
public class Family : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    // Navigation properties - All financial data belongs to the family
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Account> Accounts { get; set; } = new List<Account>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    public ICollection<Budget> Budgets { get; set; } = new List<Budget>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    public ICollection<Goal> Goals { get; set; } = new List<Goal>();
    public ICollection<Debt> Debts { get; set; } = new List<Debt>();
    public ICollection<RoundupRule> RoundupRules { get; set; } = new List<RoundupRule>();
    public ICollection<ClassificationRule> ClassificationRules { get; set; } = new List<ClassificationRule>();
    public ICollection<MeiSettings> MeiSettings { get; set; } = new List<MeiSettings>();
    public ICollection<ShoppingList> ShoppingLists { get; set; } = new List<ShoppingList>();
}
