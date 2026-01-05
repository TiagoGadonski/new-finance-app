using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Enums;
using FinanceApp.Domain.Exceptions;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

namespace FinanceApp.Application.Features.Transactions.Commands;

public record ImportCsvCommand(Guid UserId, ImportCsvRequest Request) : IRequest<List<TransactionDto>>;

public class CsvTransactionMap : ClassMap<CsvTransaction>
{
    public CsvTransactionMap()
    {
        Map(m => m.Date).Name("Date", "Data");
        Map(m => m.Description).Name("Description", "Descrição", "Descricao");
        Map(m => m.Amount).Name("Amount", "Valor");
        Map(m => m.Type).Name("Type", "Tipo");
    }
}

public class CsvTransaction
{
    public string Date { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Amount { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}

public class ImportCsvCommandHandler : IRequestHandler<ImportCsvCommand, List<TransactionDto>>
{
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Account> _accountRepository;
    private readonly IRepository<Category> _categoryRepository;
    private readonly IClassificationService _classificationService;

    public ImportCsvCommandHandler(
        IRepository<Transaction> transactionRepository,
        IRepository<Account> accountRepository,
        IRepository<Category> categoryRepository,
        IClassificationService classificationService)
    {
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
        _categoryRepository = categoryRepository;
        _classificationService = classificationService;
    }

    public async Task<List<TransactionDto>> Handle(ImportCsvCommand request, CancellationToken cancellationToken)
    {
        var account = await _accountRepository.GetByIdAsync(request.Request.AccountId);
        if (account == null || account.UserId != request.UserId)
            throw new NotFoundException("Account", request.Request.AccountId);

        using var reader = new StringReader(request.Request.CsvContent);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            MissingFieldFound = null
        });

        csv.Context.RegisterClassMap<CsvTransactionMap>();
        var records = csv.GetRecords<CsvTransaction>().ToList();
        var results = new List<TransactionDto>();

        foreach (var record in records)
        {
            var date = DateTime.Parse(record.Date);
            var amount = decimal.Parse(record.Amount.Replace("R$", "").Trim());
            var type = record.Type.ToLower() == "income" || record.Type.ToLower() == "receita"
                ? TransactionType.Income
                : TransactionType.Expense;

            // Sugerir categoria usando classificação automática
            var suggestedCategoryId = await _classificationService.SuggestCategoryAsync(
                request.UserId,
                record.Description);

            if (suggestedCategoryId == null)
            {
                // Usar categoria padrão se não houver sugestão
                var defaultCategory = (await _categoryRepository.FindAsync(c =>
                    c.UserId == request.UserId && c.IsDefault && c.Type == type)).FirstOrDefault();
                suggestedCategoryId = defaultCategory?.Id ?? Guid.Empty;
            }

            var category = await _categoryRepository.GetByIdAsync(suggestedCategoryId.Value);

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                AccountId = request.Request.AccountId,
                CategoryId = suggestedCategoryId.Value,
                Amount = amount,
                Type = type,
                Description = record.Description,
                Date = date,
                IsRecurring = false,
                CreatedAt = DateTime.UtcNow
            };

            // Atualizar saldo
            if (type == TransactionType.Income)
                account.Balance += amount;
            else
                account.Balance -= amount;

            await _transactionRepository.AddAsync(transaction);

            results.Add(new TransactionDto(
                transaction.Id,
                transaction.AccountId,
                transaction.CategoryId,
                transaction.Amount,
                transaction.Type,
                transaction.Description,
                transaction.Date,
                transaction.IsRecurring,
                transaction.Tags,
                account.Name,
                category?.Name ?? "Unknown",
                null,
                null,
                null
            ));
        }

        await _accountRepository.UpdateAsync(account);
        await _transactionRepository.SaveChangesAsync();

        return results;
    }
}
