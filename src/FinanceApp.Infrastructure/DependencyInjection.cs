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
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        // Redis Cache
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("Redis");
            options.InstanceName = "FinanceApp_";
        });

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUserRepository, UserRepository>();

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IClassificationService, ClassificationService>();

        return services;
    }
}
