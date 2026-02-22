using MediatR;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;

namespace Orbit.Application.Features.Subscriptions.Commands;

public record ProcessSubscriptionBillingsCommand(Guid FamilyId, string Username) : IRequest<int>;

public class ProcessSubscriptionBillingsCommandHandler : IRequestHandler<ProcessSubscriptionBillingsCommand, int>
{
    private readonly IRepository<Subscription> _subscriptionRepository;
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Account> _accountRepository;

    public ProcessSubscriptionBillingsCommandHandler(
        IRepository<Subscription> subscriptionRepository,
        IRepository<Transaction> transactionRepository,
        IRepository<Account> accountRepository)
    {
        _subscriptionRepository = subscriptionRepository;
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
    }

    public async Task<int> Handle(ProcessSubscriptionBillingsCommand request, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow.Date;
        var processedCount = 0;

        // Get all active subscriptions for user
        var subscriptions = await _subscriptionRepository.FindAsync(
            s => s.FamilyId == request.FamilyId && s.Status == SubscriptionStatus.Active
        );

        // Get user's default account (first active account)
        var defaultAccount = (await _accountRepository.FindAsync(
            a => a.FamilyId == request.FamilyId && a.IsActive
        )).FirstOrDefault();

        if (defaultAccount == null)
            return 0;

        foreach (var subscription in subscriptions)
        {
            // Check if billing is due
            if (subscription.NextBillingDate == null || subscription.NextBillingDate.Value.Date > today)
                continue;

            // Create transaction for this subscription
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                FamilyId = request.FamilyId,
                AccountId = defaultAccount.Id,
                CategoryId = subscription.CategoryId,
                Amount = subscription.Amount,
                Description = $"Assinatura: {subscription.Name}",
                Type = TransactionType.Expense,
                Date = subscription.NextBillingDate.Value,
                CreatedAt = DateTime.UtcNow,
                CreatedByUsername = request.Username
            };

            await _transactionRepository.AddAsync(transaction);

            // Update account balance
            defaultAccount.Balance -= subscription.Amount;
            await _accountRepository.UpdateAsync(defaultAccount);

            // Update subscription
            subscription.NextBillingDate = CalculateNextBillingDate(subscription.BillingDay);
            subscription.UsageCount++;
            subscription.LastUsedAt = DateTime.UtcNow;
            await _subscriptionRepository.UpdateAsync(subscription);

            processedCount++;
        }

        await _subscriptionRepository.SaveChangesAsync();
        await _transactionRepository.SaveChangesAsync();
        await _accountRepository.SaveChangesAsync();

        return processedCount;
    }

    private DateTime CalculateNextBillingDate(int billingDay)
    {
        var now = DateTime.UtcNow;
        var nextMonth = now.AddMonths(1);
        var daysInMonth = DateTime.DaysInMonth(nextMonth.Year, nextMonth.Month);
        var day = Math.Min(billingDay, daysInMonth);

        return new DateTime(nextMonth.Year, nextMonth.Month, day);
    }
}
