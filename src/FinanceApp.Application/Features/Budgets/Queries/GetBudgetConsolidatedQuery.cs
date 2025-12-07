using MediatR;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;

namespace FinanceApp.Application.Features.Budgets.Queries;

public record GetBudgetConsolidatedQuery(Guid UserId, int Month, int Year) : IRequest<BudgetConsolidatedDto>;

public class GetBudgetConsolidatedQueryHandler : IRequestHandler<GetBudgetConsolidatedQuery, BudgetConsolidatedDto>
{
    private readonly IRepository<Budget> _budgetRepository;
    private readonly IRepository<Transaction> _transactionRepository;

    public GetBudgetConsolidatedQueryHandler(
        IRepository<Budget> budgetRepository,
        IRepository<Transaction> transactionRepository)
    {
        _budgetRepository = budgetRepository;
        _transactionRepository = transactionRepository;
    }

    public async Task<BudgetConsolidatedDto> Handle(GetBudgetConsolidatedQuery request, CancellationToken cancellationToken)
    {
        var budgets = await _budgetRepository.FindAsync(b =>
            b.UserId == request.UserId &&
            b.Month == request.Month &&
            b.Year == request.Year);

        var transactions = await _transactionRepository.FindAsync(t =>
            t.UserId == request.UserId &&
            t.Date.Month == request.Month &&
            t.Date.Year == request.Year &&
            t.Type == Domain.Enums.TransactionType.Expense);

        var budgetDtos = new List<BudgetDto>();
        decimal totalLimit = 0;
        decimal totalSpent = 0;

        foreach (var budget in budgets)
        {
            var spent = transactions
                .Where(t => t.CategoryId == budget.CategoryId)
                .Sum(t => t.Amount);

            budget.Spent = spent;
            await _budgetRepository.UpdateAsync(budget);

            totalLimit += budget.Limit;
            totalSpent += spent;

            budgetDtos.Add(new BudgetDto(
                budget.Id,
                budget.CategoryId,
                budget.Category?.Name ?? "Unknown",
                budget.Limit,
                spent,
                budget.Limit - spent,
                budget.PercentageUsed,
                budget.Month,
                budget.Year,
                budget.ShouldAlert
            ));
        }

        await _budgetRepository.SaveChangesAsync();

        return new BudgetConsolidatedDto(
            request.Month,
            request.Year,
            totalLimit,
            totalSpent,
            budgetDtos
        );
    }
}
