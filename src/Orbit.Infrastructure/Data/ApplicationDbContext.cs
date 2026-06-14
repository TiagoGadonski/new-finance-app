using Microsoft.EntityFrameworkCore;
using Orbit.Domain.Entities;

namespace Orbit.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
        // Configure PostgreSQL to use UTC timestamps
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
    }

    public DbSet<Family> Families => Set<Family>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<Debt> Debts => Set<Debt>();
    public DbSet<RoundupRule> RoundupRules => Set<RoundupRule>();
    public DbSet<ClassificationRule> ClassificationRules => Set<ClassificationRule>();
    public DbSet<MeiSettings> MeiSettings => Set<MeiSettings>();
    public DbSet<ShoppingList> ShoppingLists => Set<ShoppingList>();
    public DbSet<ShoppingItem> ShoppingItems => Set<ShoppingItem>();
    public DbSet<WorkCalendarSettings> WorkCalendarSettings => Set<WorkCalendarSettings>();
    public DbSet<WorkDay> WorkDays => Set<WorkDay>();
    public DbSet<Holiday> Holidays => Set<Holiday>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<TransactionTemplate> TransactionTemplates => Set<TransactionTemplate>();
    public DbSet<CurrencyRate> CurrencyRates => Set<CurrencyRate>();
    public DbSet<Investment> Investments => Set<Investment>();
    public DbSet<InvestmentTransaction> InvestmentTransactions => Set<InvestmentTransaction>();
    public DbSet<AlertConfiguration> AlertConfigurations => Set<AlertConfiguration>();
    public DbSet<ExpenseSplit> ExpenseSplits => Set<ExpenseSplit>();
    public DbSet<ExpenseSplitItem> ExpenseSplitItems => Set<ExpenseSplitItem>();
    public DbSet<Reminder> Reminders => Set<Reminder>();
    public DbSet<TodoItem> TodoItems => Set<TodoItem>();
    public DbSet<RecurringIncome> RecurringIncomes => Set<RecurringIncome>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Family
        modelBuilder.Entity<Family>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);

            // Unique index em Username (case-insensitive)
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.Username)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.Role).IsRequired().HasDefaultValue(Domain.Enums.UserRole.User);

            // FK para Family
            entity.HasOne(e => e.Family)
                .WithMany(f => f.Users)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Account
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Balance).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("BRL");

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Accounts)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Campos de audit
            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Categories)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false); // Nullable FK

            // Campos de audit
            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);

            // Seed default categories (FamilyId = null)
            entity.HasData(
                // Income categories
                new Category { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), FamilyId = null, Name = "Salário", Type = Domain.Enums.TransactionType.Income, Icon = "💰", Color = "#10b981", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("11111111-1111-1111-1111-111111111112"), FamilyId = null, Name = "Freelance", Type = Domain.Enums.TransactionType.Income, Icon = "💼", Color = "#3b82f6", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("11111111-1111-1111-1111-111111111113"), FamilyId = null, Name = "Investimentos", Type = Domain.Enums.TransactionType.Income, Icon = "📈", Color = "#8b5cf6", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("11111111-1111-1111-1111-111111111114"), FamilyId = null, Name = "Outros Rendimentos", Type = Domain.Enums.TransactionType.Income, Icon = "💵", Color = "#06b6d4", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },

                // Expense categories
                new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222221"), FamilyId = null, Name = "Alimentação", Type = Domain.Enums.TransactionType.Expense, Icon = "🍔", Color = "#f97316", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), FamilyId = null, Name = "Transporte", Type = Domain.Enums.TransactionType.Expense, Icon = "🚗", Color = "#eab308", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222223"), FamilyId = null, Name = "Moradia", Type = Domain.Enums.TransactionType.Expense, Icon = "🏠", Color = "#a855f7", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222224"), FamilyId = null, Name = "Saúde", Type = Domain.Enums.TransactionType.Expense, Icon = "🏥", Color = "#ec4899", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222225"), FamilyId = null, Name = "Educação", Type = Domain.Enums.TransactionType.Expense, Icon = "📚", Color = "#6366f1", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222226"), FamilyId = null, Name = "Lazer", Type = Domain.Enums.TransactionType.Expense, Icon = "🎮", Color = "#14b8a6", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222227"), FamilyId = null, Name = "Compras", Type = Domain.Enums.TransactionType.Expense, Icon = "🛍️", Color = "#f43f5e", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222228"), FamilyId = null, Name = "Contas", Type = Domain.Enums.TransactionType.Expense, Icon = "📄", Color = "#ef4444", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222229"), FamilyId = null, Name = "Assinaturas", Type = Domain.Enums.TransactionType.Expense, Icon = "📱", Color = "#84cc16", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" },
                new Category { Id = Guid.Parse("22222222-2222-2222-2222-222222222230"), FamilyId = null, Name = "Outros Gastos", Type = Domain.Enums.TransactionType.Expense, Icon = "💸", Color = "#64748b", IsDefault = true, CreatedAt = DateTime.UtcNow, CreatedByUsername = "system" }
            );
        });

        // Transaction
        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Transactions)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Account)
                .WithMany(a => a.Transactions)
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Transactions)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Campos de audit
            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // Budget
        modelBuilder.Entity<Budget>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Limit).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Spent).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Budgets)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Budgets)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Campos de audit
            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // Subscription
        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Subscriptions)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Account)
                .WithMany()
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            // Campos de audit
            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // Goal
        modelBuilder.Entity<Goal>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.TargetAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.CurrentAmount).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Goals)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Campos de audit
            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // Debt
        modelBuilder.Entity<Debt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.RemainingAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.InterestRate).HasColumnType("decimal(5,2)");
            entity.Property(e => e.MinimumPayment).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Debts)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            // Campos de audit
            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // RoundupRule
        modelBuilder.Entity<RoundupRule>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Multiplier).HasColumnType("decimal(3,1)");

            entity.HasOne(e => e.Family)
                .WithMany(f => f.RoundupRules)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SourceAccount)
                .WithMany()
                .HasForeignKey(e => e.SourceAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.DestinationAccount)
                .WithMany()
                .HasForeignKey(e => e.DestinationAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            // Campos de audit
            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // ClassificationRule
        modelBuilder.Entity<ClassificationRule>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Keyword).IsRequired().HasMaxLength(100);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.ClassificationRules)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Campos de audit
            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // MeiSettings
        modelBuilder.Entity<MeiSettings>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AnnualRevenueLimit).HasColumnType("decimal(18,2)");
            entity.Property(e => e.AlertThreshold1).HasColumnType("decimal(5,2)");
            entity.Property(e => e.AlertThreshold2).HasColumnType("decimal(5,2)");
            entity.Property(e => e.AlertThreshold3).HasColumnType("decimal(5,2)");

            entity.HasIndex(e => new { e.FamilyId, e.Year }).IsUnique();

            entity.HasOne(e => e.Family)
                .WithMany(f => f.MeiSettings)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.MainCategory)
                .WithMany()
                .HasForeignKey(e => e.MainCategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            // Campos de audit
            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // ShoppingList
        modelBuilder.Entity<ShoppingList>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.ShoppingLists)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.FamilyId, e.Status });

            // Campos de audit
            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // ShoppingItem
        modelBuilder.Entity<ShoppingItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Category).HasMaxLength(100);
            entity.Property(e => e.EstimatedPrice).HasColumnType("decimal(10,2)");
            entity.Property(e => e.ActualPrice).HasColumnType("decimal(10,2)");

            entity.HasOne(e => e.ShoppingList)
                .WithMany(sl => sl.Items)
                .HasForeignKey(e => e.ShoppingListId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Transaction)
                .WithMany()
                .HasForeignKey(e => e.TransactionId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // WorkCalendarSettings
        modelBuilder.Entity<WorkCalendarSettings>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.FamilyId).IsUnique();
            entity.Property(e => e.HourlyRate).HasColumnType("decimal(18,2)");
            entity.Property(e => e.HoursPerDay).HasColumnType("decimal(5,2)");

            entity.HasOne(e => e.Family)
                .WithOne(f => f.WorkCalendarSettings)
                .HasForeignKey<WorkCalendarSettings>(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // WorkDay
        modelBuilder.Entity<WorkDay>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.FamilyId, e.Date }).IsUnique();
            entity.Property(e => e.HoursWorked).HasColumnType("decimal(5,2)");

            entity.HasOne(e => e.Family)
                .WithMany(f => f.WorkDays)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Holiday
        modelBuilder.Entity<Holiday>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Holidays)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Notification
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.Link).HasMaxLength(500);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Notifications)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => new { e.FamilyId, e.IsRead });
        });

        // TransactionTemplate
        modelBuilder.Entity<TransactionTemplate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.TransactionTemplates)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Account)
                .WithMany()
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // CurrencyRate
        modelBuilder.Entity<CurrencyRate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FromCurrency).IsRequired().HasMaxLength(10);
            entity.Property(e => e.ToCurrency).IsRequired().HasMaxLength(10);
            entity.Property(e => e.Rate).HasColumnType("decimal(18,8)");
            entity.Property(e => e.Source).HasMaxLength(100);

            entity.HasIndex(e => new { e.FromCurrency, e.ToCurrency, e.Date });
        });

        // Investment
        modelBuilder.Entity<Investment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Symbol).HasMaxLength(20);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,8)");
            entity.Property(e => e.AveragePrice).HasColumnType("decimal(18,8)");
            entity.Property(e => e.CurrentPrice).HasColumnType("decimal(18,8)");
            entity.Property(e => e.Currency).IsRequired().HasMaxLength(10).HasDefaultValue("BRL");

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Investments)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Account)
                .WithMany()
                .HasForeignKey(e => e.AccountId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // InvestmentTransaction
        modelBuilder.Entity<InvestmentTransaction>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18,8)");
            entity.Property(e => e.Price).HasColumnType("decimal(18,8)");
            entity.Property(e => e.Fees).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.Investment)
                .WithMany(i => i.InvestmentTransactions)
                .HasForeignKey(e => e.InvestmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // AlertConfiguration
        modelBuilder.Entity<AlertConfiguration>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Threshold).HasColumnType("decimal(18,2)");
            entity.Property(e => e.CronSchedule).HasMaxLength(100);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.AlertConfigurations)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // ExpenseSplit
        modelBuilder.Entity<ExpenseSplit>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TotalAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.ExpenseSplits)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Transaction)
                .WithMany()
                .HasForeignKey(e => e.TransactionId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // ExpenseSplitItem
        modelBuilder.Entity<ExpenseSplitItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");

            entity.HasOne(e => e.ExpenseSplit)
                .WithMany(s => s.Items)
                .HasForeignKey(e => e.ExpenseSplitId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Reminder
        modelBuilder.Entity<Reminder>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.Reminders)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });

        // TodoItem
        modelBuilder.Entity<TodoItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(2000);

            entity.HasOne(e => e.Family)
                .WithMany(f => f.TodoItems)
                .HasForeignKey(e => e.FamilyId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.FamilyId, e.IsCompleted });

            entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
            entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
        });
    }
}
