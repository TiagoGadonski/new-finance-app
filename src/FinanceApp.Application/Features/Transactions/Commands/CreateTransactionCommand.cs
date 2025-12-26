using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Exceptions;

namespace FinanceApp.Application.Features.Transactions.Commands;

public record CreateTransactionCommand(
    Guid UserId,
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
            if (account == null || account.UserId != request.UserId)
                throw new NotFoundException("Account", request.Request.AccountId);

            var category = await _categoryRepository.GetByIdAsync(request.Request.CategoryId);
            if (category == null || (category.UserId != request.UserId && !category.IsDefault))
                throw new NotFoundException("Category", request.Request.CategoryId);

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                AccountId = request.Request.AccountId,
                CategoryId = request.Request.CategoryId,
                Amount = request.Request.Amount,
                Type = request.Request.Type,
                Description = request.Request.Description,
                Date = request.Request.Date,
                IsRecurring = request.Request.IsRecurring,
                Tags = request.Request.Tags,
                CreatedAt = DateTime.UtcNow
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
                request.UserId,
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
                category.Name
            );
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
