using Microsoft.AspNetCore.Mvc;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;

namespace FinanceApp.Api.Controllers;

[Route("api/[controller]")]
public class AccountsController : BaseAuthenticatedController
{
    private readonly IRepository<Account> _accountRepository;

    public AccountsController(IRepository<Account> accountRepository)
    {
        _accountRepository = accountRepository;
    }

    [HttpPost]
    public async Task<ActionResult<AccountDto>> Create([FromBody] CreateAccountRequest request)
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Name = request.Name,
            Type = request.Type,
            Balance = request.InitialBalance,
            Color = request.Color,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _accountRepository.AddAsync(account);
        await _accountRepository.SaveChangesAsync();

        return Ok(new AccountDto(
            account.Id,
            account.Name,
            account.Type,
            account.Balance,
            account.Color,
            account.IsActive
        ));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AccountDto>>> GetAll()
    {
        var accounts = await _accountRepository.FindAsync(a => a.FamilyId == FamilyId);

        var accountDtos = accounts.Select(a => new AccountDto(
            a.Id,
            a.Name,
            a.Type,
            a.Balance,
            a.Color,
            a.IsActive
        ));

        return Ok(accountDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AccountDto>> GetById(Guid id)
    {
        var account = await _accountRepository.GetByIdAsync(id);
        if (account == null || account.FamilyId != FamilyId)
            return NotFound();

        return Ok(new AccountDto(
            account.Id,
            account.Name,
            account.Type,
            account.Balance,
            account.Color,
            account.IsActive
        ));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AccountDto>> Update(Guid id, [FromBody] UpdateAccountRequest request)
    {
        var account = await _accountRepository.GetByIdAsync(id);
        if (account == null || account.FamilyId != FamilyId)
            return NotFound();

        account.Name = request.Name;
        account.Color = request.Color;
        account.IsActive = request.IsActive;
        account.UpdatedAt = DateTime.UtcNow;

        await _accountRepository.UpdateAsync(account);
        await _accountRepository.SaveChangesAsync();

        return Ok(new AccountDto(
            account.Id,
            account.Name,
            account.Type,
            account.Balance,
            account.Color,
            account.IsActive
        ));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var account = await _accountRepository.GetByIdAsync(id);
        if (account == null || account.FamilyId != FamilyId)
            return NotFound();

        await _accountRepository.DeleteAsync(account);
        await _accountRepository.SaveChangesAsync();

        return NoContent();
    }
}
