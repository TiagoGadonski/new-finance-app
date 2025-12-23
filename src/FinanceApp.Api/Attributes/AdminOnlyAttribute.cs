using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using FinanceApp.Domain.Enums;
using FinanceApp.Domain.Interfaces;

namespace FinanceApp.Api.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class AdminOnlyAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var userIdClaim = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var userRepository = context.HttpContext.RequestServices
            .GetRequiredService<IUserRepository>();

        var user = await userRepository.GetByIdAsync(userId);

        if (user == null || user.Role != UserRole.Admin)
        {
            context.Result = new ForbidResult();
            return;
        }
    }
}
