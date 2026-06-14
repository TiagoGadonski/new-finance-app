using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Orbit.Domain.Interfaces;
using Orbit.Infrastructure.Data;
using Orbit.Infrastructure.Repositories;
using Orbit.Infrastructure.Services;
using Orbit.Application.Services;

namespace Orbit.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database - PostgreSQL
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Database connection string is required");
        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        });

        // Distributed Cache - Using in-memory for simplicity
        services.AddDistributedMemoryCache();

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Repositories
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IFamilyRepository, FamilyRepository>();

        // HttpContextAccessor (necessário para CurrentUserService)
        services.AddHttpContextAccessor();

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IClassificationService, ClassificationService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ICurrencyService, CurrencyService>();
        services.AddScoped<Application.Common.Interfaces.ICurrentUserService, CurrentUserService>();

        // HttpClient for CurrencyService
        services.AddHttpClient("CurrencyApi");

        // Telegram
        services.AddHttpClient("TelegramApi");
        services.AddSingleton<ITelegramService, TelegramService>();

        // Alert Evaluation Background Service
        services.AddHostedService<AlertEvaluationService>();
        services.AddScoped<Orbit.Application.Common.Interfaces.IBudgetForecastService, Orbit.Application.Features.BudgetForecast.BudgetForecastService>();

        return services;
    }
}
