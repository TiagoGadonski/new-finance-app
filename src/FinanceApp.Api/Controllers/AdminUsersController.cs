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
    private readonly IFamilyRepository _familyRepository;
    private readonly IAuthService _authService;

    public AdminUsersController(
        IUserRepository userRepository,
        IFamilyRepository familyRepository,
        IAuthService authService)
    {
        _userRepository = userRepository;
        _familyRepository = familyRepository;
        _authService = authService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AdminUserDto>>> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();
        var userDtos = users.Select(u => new AdminUserDto(
            u.Id,
            u.Name,
            u.Username,
            u.Role,
            u.FamilyId,
            u.Family.Name,
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
            user.Username,
            user.Role,
            user.FamilyId,
            user.Family.Name,
            user.CreatedAt,
            user.UpdatedAt
        ));
    }

    [HttpPost]
    public async Task<ActionResult<AdminUserDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        // Validate username format
        if (request.Username.Length < 3 || request.Username.Length > 20)
            return BadRequest(new { message = "Username must be between 3 and 20 characters" });

        if (!System.Text.RegularExpressions.Regex.IsMatch(request.Username, @"^[a-zA-Z0-9_-]+$"))
            return BadRequest(new { message = "Username can only contain letters, numbers, underscores and hyphens" });

        // Check if username already exists
        var existingUser = await _userRepository.GetByUsernameAsync(request.Username);
        if (existingUser != null)
            return BadRequest(new { message = "Username already in use" });

        // Verify family exists
        var family = await _familyRepository.GetByIdAsync(request.FamilyId);
        if (family == null)
            return BadRequest(new { message = "Family not found" });

        var user = new User
        {
            Id = Guid.NewGuid(),
            FamilyId = request.FamilyId,
            Name = request.Name,
            Username = request.Username,
            PasswordHash = _authService.HashPassword(request.Password),
            Role = request.Role,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetUserById),
            new { id = user.Id },
            new AdminUserDto(user.Id, user.Name, user.Username, user.Role, user.FamilyId, family.Name, user.CreatedAt, user.UpdatedAt)
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

        if (request.Name != null)
            user.Name = request.Name;
        if (request.Role.HasValue)
            user.Role = request.Role.Value;

        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        await _userRepository.SaveChangesAsync();

        return Ok(new AdminUserDto(user.Id, user.Name, user.Username, user.Role, user.FamilyId, user.Family.Name, user.CreatedAt, user.UpdatedAt));
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

    [HttpGet("families")]
    public async Task<ActionResult<IEnumerable<FamilyDto>>> GetAllFamilies()
    {
        var families = await _familyRepository.GetAllWithUsersAsync();
        var familyDtos = families.Select(f => new FamilyDto(
            f.Id,
            f.Name,
            f.IsActive,
            f.Users.Count,
            f.CreatedAt
        ));

        return Ok(familyDtos);
    }

    [HttpGet("families/{familyId}")]
    public async Task<ActionResult<FamilyDetailDto>> GetFamilyById(Guid familyId)
    {
        var family = await _familyRepository.GetWithUsersAsync(familyId);
        if (family == null)
            return NotFound();

        var userDtos = family.Users.Select(u => new AdminUserDto(
            u.Id,
            u.Name,
            u.Username,
            u.Role,
            u.FamilyId,
            family.Name,
            u.CreatedAt,
            u.UpdatedAt
        )).ToList();

        return Ok(new FamilyDetailDto(
            family.Id,
            family.Name,
            family.IsActive,
            userDtos,
            family.CreatedAt
        ));
    }
}
