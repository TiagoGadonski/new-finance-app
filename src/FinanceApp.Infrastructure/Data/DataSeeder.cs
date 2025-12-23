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
            if (await context.Categories.AnyAsync())
                return; // Dados já existem
        }
        catch
        {
            // Table doesn't exist yet, continue with seeding
        }

        // Criar usuário padrão para desenvolvimento
        var defaultUser = new User
        {
            Id = Guid.NewGuid(),
            Name = "Demo User",
            Email = "demo@financeapp.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo@123"),
            Role = Domain.Enums.UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        await context.Users.AddAsync(defaultUser);
        await context.SaveChangesAsync();

        // Categorias padrão de despesas
        var expenseCategories = new[]
        {
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "Alimentação", Type = TransactionType.Expense, Icon = "🍔", Color = "#FF6B6B", IsDefault = true, CreatedAt = DateTime.UtcNow },
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "Transporte", Type = TransactionType.Expense, Icon = "🚗", Color = "#4ECDC4", IsDefault = true, CreatedAt = DateTime.UtcNow },
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "Moradia", Type = TransactionType.Expense, Icon = "🏠", Color = "#45B7D1", IsDefault = true, CreatedAt = DateTime.UtcNow },
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "Saúde", Type = TransactionType.Expense, Icon = "⚕️", Color = "#96CEB4", IsDefault = true, CreatedAt = DateTime.UtcNow },
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "Educação", Type = TransactionType.Expense, Icon = "📚", Color = "#FFEAA7", IsDefault = true, CreatedAt = DateTime.UtcNow },
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "Lazer", Type = TransactionType.Expense, Icon = "🎮", Color = "#DFE6E9", IsDefault = true, CreatedAt = DateTime.UtcNow },
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "Assinaturas", Type = TransactionType.Expense, Icon = "📱", Color = "#74B9FF", IsDefault = true, CreatedAt = DateTime.UtcNow },
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "MEI/Negócios", Type = TransactionType.Expense, Icon = "💼", Color = "#A29BFE", IsDefault = true, CreatedAt = DateTime.UtcNow },
        };

        // Categorias padrão de receitas
        var incomeCategories = new[]
        {
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "Salário", Type = TransactionType.Income, Icon = "💰", Color = "#00B894", IsDefault = true, CreatedAt = DateTime.UtcNow },
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "Freelance", Type = TransactionType.Income, Icon = "💻", Color = "#00CEC9", IsDefault = true, CreatedAt = DateTime.UtcNow },
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "MEI/Serviços", Type = TransactionType.Income, Icon = "🏢", Color = "#6C5CE7", IsDefault = true, CreatedAt = DateTime.UtcNow },
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "Investimentos", Type = TransactionType.Income, Icon = "📈", Color = "#FDCB6E", IsDefault = true, CreatedAt = DateTime.UtcNow },
            new Category { Id = Guid.NewGuid(), UserId = defaultUser.Id, Name = "Outros", Type = TransactionType.Income, Icon = "💵", Color = "#55EFC4", IsDefault = true, CreatedAt = DateTime.UtcNow },
        };

        await context.Categories.AddRangeAsync(expenseCategories);
        await context.Categories.AddRangeAsync(incomeCategories);

        // Conta padrão - Carteira
        var defaultAccount = new Account
        {
            Id = Guid.NewGuid(),
            UserId = defaultUser.Id,
            Name = "Carteira",
            Type = AccountType.Wallet,
            Balance = 0,
            Color = "#2ECC71",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await context.Accounts.AddAsync(defaultAccount);
        await context.SaveChangesAsync();
    }
}
