using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using FinanceApp.Application.Common.Interfaces;
using FinanceApp.Domain.Enums;

namespace FinanceApp.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid UserId => Guid.Parse(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? Guid.Empty.ToString());

    public Guid FamilyId => Guid.Parse(_httpContextAccessor.HttpContext?.User.FindFirstValue("FamilyId") ?? Guid.Empty.ToString());

    public string Username => _httpContextAccessor.HttpContext?.User.FindFirstValue("Username") ?? "";

    public UserRole Role
    {
        get
        {
            var roleString = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
            return Enum.TryParse<UserRole>(roleString, out var role) ? role : UserRole.User;
        }
    }

    public bool IsAdmin => Role == UserRole.Admin;
}
