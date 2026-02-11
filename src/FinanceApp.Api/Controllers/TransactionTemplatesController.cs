using Microsoft.AspNetCore.Mvc;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;

namespace FinanceApp.Api.Controllers;

[Route("api/transaction-templates")]
public class TransactionTemplatesController : BaseAuthenticatedController
{
    private readonly IRepository<TransactionTemplate> _templateRepository;
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Account> _accountRepository;

    public TransactionTemplatesController(
        IRepository<TransactionTemplate> templateRepository,
        IRepository<Transaction> transactionRepository,
        IRepository<Account> accountRepository)
    {
        _templateRepository = templateRepository;
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransactionTemplateDto>>> GetAll()
    {
        var templates = await _templateRepository.FindAsync(
            t => t.FamilyId == FamilyId,
            t => t.Account,
            t => t.Category);

        var dtos = templates.Select(t => new TransactionTemplateDto(
            t.Id, t.Name, t.AccountId, t.CategoryId, t.Amount, t.Type,
            t.Description, t.Tags,
            t.Account?.Name ?? "N/A", t.Category?.Name ?? "N/A"
        ));

        return Ok(dtos);
    }

    [HttpPost]
    public async Task<ActionResult<TransactionTemplateDto>> Create([FromBody] CreateTransactionTemplateRequest request)
    {
        var template = new TransactionTemplate
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Name = request.Name,
            AccountId = request.AccountId,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Type = request.Type,
            Description = request.Description,
            Tags = request.Tags,
            CreatedAt = DateTime.UtcNow
        };

        await _templateRepository.AddAsync(template);
        await _templateRepository.SaveChangesAsync();

        var saved = await _templateRepository.GetByIdAsync(template.Id, t => t.Account, t => t.Category);

        return Ok(new TransactionTemplateDto(
            saved!.Id, saved.Name, saved.AccountId, saved.CategoryId, saved.Amount, saved.Type,
            saved.Description, saved.Tags,
            saved.Account?.Name ?? "N/A", saved.Category?.Name ?? "N/A"
        ));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TransactionTemplateDto>> Update(Guid id, [FromBody] UpdateTransactionTemplateRequest request)
    {
        var template = await _templateRepository.GetByIdAsync(id);
        if (template == null || template.FamilyId != FamilyId)
            return NotFound();

        template.Name = request.Name;
        template.AccountId = request.AccountId;
        template.CategoryId = request.CategoryId;
        template.Amount = request.Amount;
        template.Type = request.Type;
        template.Description = request.Description;
        template.Tags = request.Tags;
        template.UpdatedAt = DateTime.UtcNow;

        await _templateRepository.UpdateAsync(template);
        await _templateRepository.SaveChangesAsync();

        var saved = await _templateRepository.GetByIdAsync(template.Id, t => t.Account, t => t.Category);

        return Ok(new TransactionTemplateDto(
            saved!.Id, saved.Name, saved.AccountId, saved.CategoryId, saved.Amount, saved.Type,
            saved.Description, saved.Tags,
            saved.Account?.Name ?? "N/A", saved.Category?.Name ?? "N/A"
        ));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var template = await _templateRepository.GetByIdAsync(id);
        if (template == null || template.FamilyId != FamilyId)
            return NotFound();

        await _templateRepository.DeleteAsync(template);
        await _templateRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/apply")]
    public async Task<ActionResult<TransactionDto>> Apply(Guid id)
    {
        var template = await _templateRepository.GetByIdAsync(id, t => t.Account, t => t.Category);
        if (template == null || template.FamilyId != FamilyId)
            return NotFound();

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            AccountId = template.AccountId,
            CategoryId = template.CategoryId,
            Amount = template.Amount,
            Type = template.Type,
            Description = template.Description ?? template.Name,
            Date = DateTime.UtcNow,
            IsRecurring = false,
            Tags = template.Tags,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        // Update account balance
        var account = await _accountRepository.GetByIdAsync(template.AccountId);
        if (account != null)
        {
            if (transaction.Type == Domain.Enums.TransactionType.Income)
                account.Balance += transaction.Amount;
            else
                account.Balance -= transaction.Amount;
            await _accountRepository.UpdateAsync(account);
        }

        await _transactionRepository.AddAsync(transaction);
        await _transactionRepository.SaveChangesAsync();

        return Ok(new TransactionDto(
            transaction.Id, transaction.AccountId, transaction.CategoryId,
            transaction.Amount, transaction.Type, transaction.Description,
            transaction.Date, transaction.IsRecurring, transaction.Tags,
            template.Account?.Name ?? "N/A", template.Category?.Name ?? "N/A",
            null, null, null,
            transaction.CreatedByUsername, transaction.CreatedAt,
            transaction.UpdatedByUsername, transaction.UpdatedAt
        ));
    }
}
