using Microsoft.AspNetCore.Mvc;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Enums;
using FinanceApp.Api.Attributes;

namespace FinanceApp.Api.Controllers;

[Route("api/admin/users")]
[AdminOnly]
public class AdminUsersController : BaseAuthenticatedController
{
    private readonly IUserRepository _userRepository;
    private readonly IAuthService _authService;

    public AdminUsersController(
        IUserRepository userRepository,
        IAuthService authService)
    {
        _userRepository = userRepository;
        _authService = authService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();
        var userDtos = users.Select(u => new AdminUserDto(
            u.Id,
            u.Name,
            u.Email,
            u.Role,
            u.CreatedAt,
            u.UpdatedAt
        ));

        return Ok(userDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AdminUserDto>> GetUserById(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return NotFound();

        return Ok(new AdminUserDto(
            user.Id,
            user.Name,
            user.Email,
            user.Role,
            user.CreatedAt,
            user.UpdatedAt
        ));
    }

    [HttpPost]
    public async Task<ActionResult<AdminUserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        // Check if email already exists
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
            return BadRequest(new { message = "Email already in use" });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            PasswordHash = _authService.HashPassword(request.Password),
            Role = request.Role,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetUserById),
            new { id = user.Id },
            new AdminUserDto(user.Id, user.Name, user.Email, user.Role, user.CreatedAt, user.UpdatedAt)
        );
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AdminUserDto>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return NotFound();

        // Prevent demoting the last admin
        if (user.Role == UserRole.Admin && request.Role == UserRole.User)
        {
            var admins = await _userRepository.FindAsync(u => u.Role == UserRole.Admin);
            if (admins.Count() <= 1)
                return BadRequest(new { message = "Cannot demote the last admin user" });
        }

        // Check if new email conflicts with existing user
        if (user.Email != request.Email)
        {
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null)
                return BadRequest(new { message = "Email already in use" });
        }

        user.Name = request.Name;
        user.Email = request.Email;
        user.Role = request.Role;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new AdminUserDto(user.Id, user.Name, user.Email, user.Role, user.CreatedAt, user.UpdatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        // Prevent self-deletion
        if (id == UserId)
            return BadRequest(new { message = "Cannot delete your own account" });

        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return NotFound();

        // Prevent deleting the last admin
        if (user.Role == UserRole.Admin)
        {
            var admins = await _userRepository.FindAsync(u => u.Role == UserRole.Admin);
            if (admins.Count() <= 1)
                return BadRequest(new { message = "Cannot delete the last admin user" });
        }

        await _userRepository.DeleteAsync(user);
        await _userRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/change-password")]
    public async Task<ActionResult> ChangeUserPassword(Guid id, [FromBody] ChangeUserPasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
            return NotFound();

        user.PasswordHash = _authService.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully" });
    }
}
