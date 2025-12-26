using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Infrastructure.Data;
using FinanceApp.Infrastructure.Repositories;
using FinanceApp.Infrastructure.Services;
using FinanceApp.Application.Services;

namespace FinanceApp.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database - Use SQLite for development
        var connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=financeapp.db";
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            if (connectionString.Contains(".db") || connectionString.StartsWith("Data Source="))
            {
                // SQLite for development
                options.UseSqlite(connectionString);
            }
            else
            {
                // PostgreSQL for production
                options.UseNpgsql(connectionString);
            }
        });

        // Distributed Cache - Using in-memory for simplicity
        services.AddDistributedMemoryCache();

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUserRepository, UserRepository>();

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IClassificationService, ClassificationService>();

        return services;
    }
}
