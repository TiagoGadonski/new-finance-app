using MediatR;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;
using Orbit.Domain.Exceptions;

namespace Orbit.Application.Features.Transactions.Commands;

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
    private readonly IRepository<User> _userRepository;
    private readonly IClassificationService _classificationService;
    private readonly ITelegramService _telegramService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTransactionCommandHandler(
        IRepository<Transaction> transactionRepository,
        IRepository<Account> accountRepository,
        IRepository<Category> categoryRepository,
        IRepository<User> userRepository,
        IClassificationService classificationService,
        ITelegramService telegramService,
        IUnitOfWork unitOfWork)
    {
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
        _categoryRepository = categoryRepository;
        _userRepository = userRepository;
        _classificationService = classificationService;
        _telegramService = telegramService;
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

                // Notificar demais membros da família
                await NotifyFamilyMembersAsync(request.FamilyId, request.Username, request.Request.Amount, request.Request.Type, request.Request.Description, category.Name, request.Request.InstallmentCount);

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

                // Notificar demais membros da família
                await NotifyFamilyMembersAsync(request.FamilyId, request.Username, transaction.Amount, transaction.Type, transaction.Description, category.Name, null);

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

    private async Task NotifyFamilyMembersAsync(Guid familyId, string creatorUsername, decimal amount, TransactionType type, string description, string categoryName, int? installmentCount)
    {
        try
        {
            var familyMembers = await _userRepository.FindAsync(
                u => u.FamilyId == familyId && u.Username != creatorUsername && u.TelegramChatId != null);

            if (!familyMembers.Any()) return;

            var typeLabel = type == TransactionType.Income ? "💰 Receita" : "💸 Despesa";
            var amountStr = $"R$ {amount:N2}";
            var installmentInfo = installmentCount.HasValue && installmentCount.Value > 1
                ? $" (parcelado em {installmentCount}x)"
                : "";

            var message = $"{typeLabel} registrada por <b>@{creatorUsername}</b>\n" +
                          $"📋 {description}\n" +
                          $"🏷️ {categoryName}\n" +
                          $"💵 {amountStr}{installmentInfo}";

            foreach (var member in familyMembers)
            {
                await _telegramService.SendToAsync(message, member.TelegramChatId!);
            }
        }
        catch
        {
            // Notificação é best-effort — não falha a transação
        }
    }
}
