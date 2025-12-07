using Microsoft.AspNetCore.Mvc;
using MediatR;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Application.Common.DTOs;

namespace FinanceApp.Api.Controllers;

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
        var user = await _userRepository.GetByIdAsync(UserId);
        if (user == null)
            return NotFound();

        return Ok(new UserDto(user.Id, user.Name, user.Email));
    }
}
