using MediatR;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;
using Orbit.Domain.Exceptions;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

namespace Orbit.Application.Features.Transactions.Commands;

public record ImportCsvCommand(Guid FamilyId, string Username, ImportCsvRequest Request) : IRequest<ImportCsvResponse>;

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

public class ImportCsvCommandHandler : IRequestHandler<ImportCsvCommand, ImportCsvResponse>
{
    private const int MaxRecords = 10_000;

    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Account> _accountRepository;
    private readonly IRepository<Category> _categoryRepository;
    private readonly IClassificationService _classificationService;
    private readonly IUnitOfWork _unitOfWork;

    public ImportCsvCommandHandler(
        IRepository<Transaction> transactionRepository,
        IRepository<Account> accountRepository,
        IRepository<Category> categoryRepository,
        IClassificationService classificationService,
        IUnitOfWork unitOfWork)
    {
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
        _categoryRepository = categoryRepository;
        _classificationService = classificationService;
        _unitOfWork = unitOfWork;
    }

    public async Task<ImportCsvResponse> Handle(ImportCsvCommand request, CancellationToken cancellationToken)
    {
        var account = await _accountRepository.GetByIdAsync(request.Request.AccountId);
        if (account == null || account.FamilyId != request.FamilyId)
            throw new NotFoundException("Account", request.Request.AccountId);

        using var reader = new StringReader(request.Request.CsvContent);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true
        });

        csv.Context.RegisterClassMap<CsvTransactionMap>();

        List<CsvTransaction> records;
        try
        {
            records = csv.GetRecords<CsvTransaction>().ToList();
        }
        catch (CsvHelperException ex)
        {
            throw new DomainException($"Erro ao processar CSV: {ex.Message}");
        }

        if (records.Count > MaxRecords)
            throw new DomainException($"CSV excede o limite de {MaxRecords:N0} registros ({records.Count:N0} encontrados)");

        var imported = new List<TransactionDto>();
        var errors = new List<ImportCsvLineError>();
        var balanceAdjustment = 0m;

        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            for (var i = 0; i < records.Count; i++)
            {
                var lineNumber = i + 2; // +2: 1-indexed + header row
                var record = records[i];

                if (!DateTime.TryParse(record.Date, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                {
                    errors.Add(new ImportCsvLineError(lineNumber, $"Data inválida: '{record.Date}'"));
                    continue;
                }

                var cleanAmount = record.Amount.Replace("R$", "").Replace(" ", "").Trim();
                if (!decimal.TryParse(cleanAmount, NumberStyles.Any, CultureInfo.InvariantCulture, out var amount) || amount <= 0)
                {
                    errors.Add(new ImportCsvLineError(lineNumber, $"Valor inválido: '{record.Amount}'"));
                    continue;
                }

                if (string.IsNullOrWhiteSpace(record.Description))
                {
                    errors.Add(new ImportCsvLineError(lineNumber, "Descrição vazia"));
                    continue;
                }

                var type = record.Type.ToLower() switch
                {
                    "income" or "receita" => TransactionType.Income,
                    _ => TransactionType.Expense
                };

                var suggestedCategoryId = await _classificationService.SuggestCategoryAsync(
                    request.FamilyId,
                    record.Description);

                if (suggestedCategoryId == null)
                {
                    var defaultCategory = (await _categoryRepository.FindAsync(c =>
                        c.FamilyId == request.FamilyId && c.IsDefault && c.Type == type)).FirstOrDefault();
                    suggestedCategoryId = defaultCategory?.Id ?? Guid.Empty;
                }

                var category = await _categoryRepository.GetByIdAsync(suggestedCategoryId.Value);

                var transaction = new Transaction
                {
                    Id = Guid.NewGuid(),
                    FamilyId = request.FamilyId,
                    AccountId = request.Request.AccountId,
                    CategoryId = suggestedCategoryId.Value,
                    Amount = amount,
                    Type = type,
                    Description = record.Description,
                    Date = date,
                    IsRecurring = false,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUsername = request.Username
                };

                if (type == TransactionType.Income)
                    balanceAdjustment += amount;
                else
                    balanceAdjustment -= amount;

                await _transactionRepository.AddAsync(transaction);

                imported.Add(new TransactionDto(
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
                    null, null, null,
                    transaction.CreatedByUsername,
                    transaction.CreatedAt,
                    transaction.UpdatedByUsername,
                    transaction.UpdatedAt
                ));
            }

            if (imported.Count == 0 && errors.Count > 0)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return new ImportCsvResponse(imported, errors, records.Count, 0, errors.Count);
            }

            account.Balance += balanceAdjustment;
            await _accountRepository.UpdateAsync(account);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await _unitOfWork.CommitTransactionAsync(cancellationToken);
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }

        return new ImportCsvResponse(imported, errors, records.Count, imported.Count, errors.Count);
    }
}
