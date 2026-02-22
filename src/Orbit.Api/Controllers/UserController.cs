using Microsoft.AspNetCore.Mvc;
using MediatR;
using Orbit.Domain.Interfaces;
using Orbit.Application.Common.DTOs;

namespace Orbit.Api.Controllers;

[Route("api/[controller]")]
public class UserController : BaseAuthenticatedController
{
    private readonly IUserRepository _userRepository;

    public UserController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetMe()
    {
        var user = await _userRepository.GetByIdAsync(UserId, u => u.Family);
        if (user == null)
            return NotFound();

        return Ok(new UserDto(user.Id, user.Name, user.Username, user.Role, user.FamilyId, user.Family?.Name ?? ""));
    }
}
