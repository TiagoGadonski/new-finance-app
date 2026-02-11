using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Exceptions;

namespace FinanceApp.Application.Features.Transactions.Commands;

public record CreateTransactionCommand(
    Guid FamilyId,
    string Username,
    CreateTransactionRequest Request
) : IRequest<TransactionDto>;

public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, TransactionDto>
{
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Account> _accountRepository;
    private readonly IRepository<Category> _categoryRepository;
    private readonly IClassificationService _classificationService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTransactionCommandHandler(
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

    public async Task<TransactionDto> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
    {
        await _unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            var account = await _accountRepository.GetByIdAsync(request.Request.AccountId);
            if (account == null || account.FamilyId != request.FamilyId)
                throw new NotFoundException("Account", request.Request.AccountId);

            var category = await _categoryRepository.GetByIdAsync(request.Request.CategoryId);
            if (category == null || (category.FamilyId != request.FamilyId && !category.IsDefault))
                throw new NotFoundException("Category", request.Request.CategoryId);

            // Se for compra parcelada, criar múltiplas transações
            if (request.Request.InstallmentCount.HasValue && request.Request.InstallmentCount.Value > 1)
            {
                var parentId = Guid.NewGuid();
                var installmentAmount = request.Request.Amount / request.Request.InstallmentCount.Value;

                for (int i = 1; i <= request.Request.InstallmentCount.Value; i++)
                {
                    var installmentDate = request.Request.Date.AddMonths(i - 1);
                    var installment = new Transaction
                    {
                        Id = Guid.NewGuid(),
                        FamilyId = request.FamilyId,
                        AccountId = request.Request.AccountId,
                        CategoryId = request.Request.CategoryId,
                        Amount = installmentAmount,
                        Type = request.Request.Type,
                        Description = $"{request.Request.Description} ({i}/{request.Request.InstallmentCount.Value})",
                        Date = installmentDate,
                        IsRecurring = false,
                        Tags = request.Request.Tags,
                        InstallmentCount = request.Request.InstallmentCount.Value,
                        CurrentInstallment = i,
                        ParentTransactionId = parentId,
                        CreatedAt = DateTime.UtcNow,
                        CreatedByUsername = request.Username
                    };

                    // Atualizar saldo apenas para a primeira parcela (total)
                    if (i == 1)
                    {
                        if (request.Request.Type == Domain.Enums.TransactionType.Income)
                            account.Balance += request.Request.Amount;
                        else
                            account.Balance -= request.Request.Amount;
                    }

                    await _transactionRepository.AddAsync(installment);
                }

                await _accountRepository.UpdateAsync(account);
                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await _unitOfWork.CommitTransactionAsync(cancellationToken);

                // Aprender com a escolha do usuário
                await _classificationService.LearnFromUserChoiceAsync(
                    request.FamilyId,
                    request.Request.Description,
                    request.Request.CategoryId);

                // Retornar a primeira parcela
                return new TransactionDto(
                    parentId,
                    request.Request.AccountId,
                    request.Request.CategoryId,
                    request.Request.Amount,
                    request.Request.Type,
                    request.Request.Description,
                    request.Request.Date,
                    false,
                    request.Request.Tags,
                    account.Name,
                    category.Name,
                    request.Request.InstallmentCount.Value,
                    1,
                    parentId,
                    request.Username,
                    DateTime.UtcNow,
                    null,
                    null
                );
            }
            else
            {
                // Transação normal (não parcelada)
                var transaction = new Transaction
                {
                    Id = Guid.NewGuid(),
                    FamilyId = request.FamilyId,
                    AccountId = request.Request.AccountId,
                    CategoryId = request.Request.CategoryId,
                    Amount = request.Request.Amount,
                    Type = request.Request.Type,
                    Description = request.Request.Description,
                    Date = request.Request.Date,
                    IsRecurring = request.Request.IsRecurring,
                    Tags = request.Request.Tags,
                    InstallmentCount = null,
                    CurrentInstallment = null,
                    ParentTransactionId = null,
                    CreatedAt = DateTime.UtcNow,
                    CreatedByUsername = request.Username
                };

                // Atualizar saldo da conta
                if (request.Request.Type == Domain.Enums.TransactionType.Income)
                    account.Balance += request.Request.Amount;
                else
                    account.Balance -= request.Request.Amount;

                await _accountRepository.UpdateAsync(account);
                await _transactionRepository.AddAsync(transaction);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                await _unitOfWork.CommitTransactionAsync(cancellationToken);

                // Aprender com a escolha do usuário (fora da transação)
                await _classificationService.LearnFromUserChoiceAsync(
                    request.FamilyId,
                    request.Request.Description,
                    request.Request.CategoryId);

                return new TransactionDto(
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
                    category.Name,
                    transaction.InstallmentCount,
                    transaction.CurrentInstallment,
                    transaction.ParentTransactionId,
                    transaction.CreatedByUsername,
                    transaction.CreatedAt,
                    transaction.UpdatedByUsername,
                    transaction.UpdatedAt
                );
            }
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
