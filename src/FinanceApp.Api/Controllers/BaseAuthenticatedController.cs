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

    protected Guid FamilyId
    {
        get
        {
            var familyIdClaim = User.FindFirstValue("FamilyId");

            if (string.IsNullOrEmpty(familyIdClaim))
            {
                throw new UnauthorizedAccessException("Family ID claim not found in token.");
            }

            if (!Guid.TryParse(familyIdClaim, out var familyId))
            {
                throw new UnauthorizedAccessException("Invalid Family ID format in token.");
            }

            return familyId;
        }
    }

    protected string Username
    {
        get
        {
            var username = User.FindFirstValue("Username");

            if (string.IsNullOrEmpty(username))
            {
                throw new UnauthorizedAccessException("Username claim not found in token.");
            }

            return username;
        }
    }

    protected bool IsAdmin => User.IsInRole("Admin");
}
