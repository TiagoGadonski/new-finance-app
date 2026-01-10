using Microsoft.EntityFrameworkCore;
using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Enums;

namespace FinanceApp.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        try
        {
            // Check if user already exists instead of categories
            // (categories are seeded via ApplicationDbContext.OnModelCreating)
            if (await context.Users.AnyAsync())
                return; // User already exists
        }
        catch
        {
            // Table doesn't exist yet, continue with seeding
        }

        // 1. Criar Family padrão
        var defaultFamily = new Family
        {
            Id = Guid.NewGuid(),
            Name = "Demo Family",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        await context.Families.AddAsync(defaultFamily);
        await context.SaveChangesAsync();

        // 2. Criar User com FamilyId e Username
        var defaultUser = new User
        {
            Id = Guid.NewGuid(),
            FamilyId = defaultFamily.Id,
            Name = "Demo User",
            Username = "demo",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo@123"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };
        await context.Users.AddAsync(defaultUser);
        await context.SaveChangesAsync();

        // 3. Categorias padrão de despesas (family-specific)
        var expenseCategories = new[]
        {
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "Alimentação", Type = TransactionType.Expense, Icon = "🍔", Color = "#FF6B6B", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "Transporte", Type = TransactionType.Expense, Icon = "🚗", Color = "#4ECDC4", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "Moradia", Type = TransactionType.Expense, Icon = "🏠", Color = "#45B7D1", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "Saúde", Type = TransactionType.Expense, Icon = "⚕️", Color = "#96CEB4", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "Educação", Type = TransactionType.Expense, Icon = "📚", Color = "#FFEAA7", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "Lazer", Type = TransactionType.Expense, Icon = "🎮", Color = "#DFE6E9", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "Assinaturas", Type = TransactionType.Expense, Icon = "📱", Color = "#74B9FF", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "MEI/Negócios", Type = TransactionType.Expense, Icon = "💼", Color = "#A29BFE", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
        };

        // 4. Categorias padrão de receitas (family-specific)
        var incomeCategories = new[]
        {
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "Salário", Type = TransactionType.Income, Icon = "💰", Color = "#00B894", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "Freelance", Type = TransactionType.Income, Icon = "💻", Color = "#00CEC9", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "MEI/Serviços", Type = TransactionType.Income, Icon = "🏢", Color = "#6C5CE7", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "Investimentos", Type = TransactionType.Income, Icon = "📈", Color = "#FDCB6E", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
            new Category { Id = Guid.NewGuid(), FamilyId = defaultFamily.Id, Name = "Outros", Type = TransactionType.Income, Icon = "💵", Color = "#55EFC4", IsDefault = false, CreatedAt = DateTime.UtcNow, CreatedByUsername = "demo" },
        };

        await context.Categories.AddRangeAsync(expenseCategories);
        await context.Categories.AddRangeAsync(incomeCategories);

        // 5. Conta padrão - Carteira
        var defaultAccount = new Account
        {
            Id = Guid.NewGuid(),
            FamilyId = defaultFamily.Id,
            Name = "Carteira",
            Type = AccountType.Wallet,
            Balance = 0,
            Color = "#2ECC71",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = "demo"
        };

        await context.Accounts.AddAsync(defaultAccount);
        await context.SaveChangesAsync();
    }
}
