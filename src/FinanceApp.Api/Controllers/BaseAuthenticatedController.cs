using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FinanceApp.Api.Controllers;

[Authorize]
[ApiController]
public abstract class BaseAuthenticatedController : ControllerBase
{
    protected Guid UserId
    {
        get
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User ID claim not found in token.");
            }

            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid User ID format in token.");
            }

            return userId;
        }
    }

    protected Guid FamilyId => Guid.Parse(User.FindFirstValue("FamilyId")!);
    protected string Username => User.FindFirstValue("Username") ?? "";
    protected bool IsAdmin => User.IsInRole("Admin");
}
