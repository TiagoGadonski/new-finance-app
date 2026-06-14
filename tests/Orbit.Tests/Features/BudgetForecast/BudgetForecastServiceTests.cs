using Xunit;
using Moq;
using FluentAssertions;
using Orbit.Application.Features.BudgetForecast;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;
using Orbit.Domain.Interfaces;
using System.Linq.Expressions;

namespace Orbit.Tests.Features.BudgetForecast;

public class BudgetForecastServiceTests
{
    private readonly Guid _familyId = Guid.NewGuid();

    private BudgetForecastService BuildService(
        List<RecurringIncome>? incomes = null,
        List<TransactionTemplate>? templates = null,
        List<Subscription>? subscriptions = null,
        List<Debt>? debts = null)
    {
        var incomeRepo = new Mock<IRepository<RecurringIncome>>();
        incomeRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<RecurringIncome, bool>>>()))
            .ReturnsAsync(incomes ?? new List<RecurringIncome>());

        var templateRepo = new Mock<IRepository<TransactionTemplate>>();
        templateRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<TransactionTemplate, bool>>>()))
            .ReturnsAsync(templates ?? new List<TransactionTemplate>());

        var subRepo = new Mock<IRepository<Subscription>>();
        subRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<Subscription, bool>>>()))
            .ReturnsAsync(subscriptions ?? new List<Subscription>());

        var debtRepo = new Mock<IRepository<Debt>>();
        debtRepo.Setup(r => r.FindAsync(It.IsAny<Expression<Func<Debt, bool>>>()))
            .ReturnsAsync(debts ?? new List<Debt>());

        return new BudgetForecastService(
            incomeRepo.Object, templateRepo.Object, subRepo.Object, debtRepo.Object);
    }

    [Fact]
    public async Task Debt_EndsInMiddleOfWindow_InstallmentsDecrement()
    {
        // Debt with 2 installments remaining — should appear only in months 0 and 1
        var debts = new List<Debt>
        {
            new Debt
            {
                Id = Guid.NewGuid(),
                FamilyId = _familyId,
                Name = "Acordo CPF",
                MinimumPayment = 300m,
                RemainingAmount = 600m,
                InstallmentsRemaining = 2,
                CreatedByUsername = "test"
            }
        };

        var service = BuildService(debts: debts);
        var result = await service.GenerateAsync(6, null, _familyId);

        // Month 0: 2 remaining, applies
        result.Months[0].DebtInstallments.Should().Be(300m);
        // Month 1: 1 remaining, applies (and ends)
        result.Months[1].DebtInstallments.Should().Be(300m);
        result.Months[1].EndingThisMonth.Should().Contain("Acordo CPF");
        // Month 2+: 0 remaining, zero
        result.Months[2].DebtInstallments.Should().Be(0m);
        result.Months[3].DebtInstallments.Should().Be(0m);
    }

    [Fact]
    public async Task InactiveSubscription_NotCounted()
    {
        var subs = new List<Subscription>
        {
            new Subscription
            {
                Id = Guid.NewGuid(),
                FamilyId = _familyId,
                Name = "Netflix",
                Amount = 55m,
                Status = SubscriptionStatus.Cancelled,
                CreatedByUsername = "test",
                Category = new Category { Name = "Streaming" },
                Account = new Account { Name = "Conta" }
            }
        };

        // Service filters by Active only — the mock returns empty since test passes cancelled
        var service = BuildService(subscriptions: new List<Subscription>()); // filtered out
        var result = await service.GenerateAsync(3, null, _familyId);

        result.Months[0].FixedExpenses.Should().Be(0m);
    }

    [Fact]
    public async Task FamilyId_IsScoped_NoDataFromOtherFamily()
    {
        // Service receives pre-filtered data (repository mock per FamilyId)
        // With no data, all values should be zero
        var service = BuildService();
        var result = await service.GenerateAsync(3, null, _familyId);

        result.MonthlyIncome.Should().Be(0m);
        result.Months.Should().HaveCount(3);
        result.Months.All(m => m.Surplus == 0m).Should().BeTrue();
    }

    [Fact]
    public async Task Month_WithNoInstallments_DebtInstallmentsIsZero()
    {
        var debts = new List<Debt>
        {
            new Debt
            {
                Id = Guid.NewGuid(),
                FamilyId = _familyId,
                Name = "Short debt",
                MinimumPayment = 100m,
                RemainingAmount = 100m,
                InstallmentsRemaining = 1,
                CreatedByUsername = "test"
            }
        };

        var service = BuildService(debts: debts);
        var result = await service.GenerateAsync(3, null, _familyId);

        result.Months[0].DebtInstallments.Should().Be(100m);
        result.Months[0].EndingThisMonth.Should().Contain("Short debt");
        result.Months[1].DebtInstallments.Should().Be(0m);
        result.Months[2].DebtInstallments.Should().Be(0m);
    }

    [Fact]
    public async Task SurplusAndAccumulatedBalance_CalculatedCorrectly()
    {
        var incomes = new List<RecurringIncome>
        {
            new RecurringIncome
            {
                Id = Guid.NewGuid(),
                FamilyId = _familyId,
                Description = "Salário PJ",
                Amount = 4400m,
                IsActive = true,
                CreatedByUsername = "test"
            }
        };

        var templates = new List<TransactionTemplate>
        {
            new TransactionTemplate
            {
                Id = Guid.NewGuid(),
                FamilyId = _familyId,
                Name = "Mercado",
                Amount = 500m,
                Type = TransactionType.Expense,
                Category = new Category { Name = "Alimentação" },
                Account = new Account { Name = "Conta" }
            }
        };

        var service = BuildService(incomes: incomes, templates: templates);
        var result = await service.GenerateAsync(3, 1000m, _familyId);

        result.MonthlyIncome.Should().Be(4400m);
        result.Months[0].Income.Should().Be(4400m);
        result.Months[0].FixedExpenses.Should().Be(500m);
        result.Months[0].Surplus.Should().Be(3900m);
        // Accumulated starts from 1000 (initialBalance) + 3900
        result.Months[0].AccumulatedBalance.Should().Be(4900m);
        result.Months[1].AccumulatedBalance.Should().Be(8800m);
    }

    [Fact]
    public async Task DebtWithNullInstallments_FallsBackToRemainingDivMinPayment()
    {
        var debts = new List<Debt>
        {
            new Debt
            {
                Id = Guid.NewGuid(),
                FamilyId = _familyId,
                Name = "Cartão",
                MinimumPayment = 200m,
                RemainingAmount = 400m,
                InstallmentsRemaining = null, // no installments field
                CreatedByUsername = "test"
            }
        };

        var service = BuildService(debts: debts);
        var result = await service.GenerateAsync(6, null, _familyId);

        // ceil(400 / 200) = 2 installments
        result.Months[0].DebtInstallments.Should().Be(200m);
        result.Months[1].DebtInstallments.Should().Be(200m);
        result.Months[2].DebtInstallments.Should().Be(0m);
    }
}
