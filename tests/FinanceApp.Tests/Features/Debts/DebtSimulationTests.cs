using Xunit;
using Moq;
using FluentAssertions;
using FinanceApp.Application.Features.Debts.Commands;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Enums;
using FinanceApp.Domain.Interfaces;
using System.Linq.Expressions;

namespace FinanceApp.Tests.Features.Debts;

public class DebtSimulationTests
{
    private readonly Mock<IRepository<Debt>> _mockDebtRepository;
    private readonly SimulateDebtPaymentCommandHandler _handler;

    public DebtSimulationTests()
    {
        _mockDebtRepository = new Mock<IRepository<Debt>>();
        _handler = new SimulateDebtPaymentCommandHandler(_mockDebtRepository.Object);
    }

    [Fact]
    public async Task SimulateDebtPayment_Snowball_OrdersBySmallestBalance()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var debts = new List<Debt>
        {
            new Debt { Id = Guid.NewGuid(), UserId = userId, Name = "Debt 1", RemainingAmount = 5000m, InterestRate = 15m, MinimumPayment = 200m },
            new Debt { Id = Guid.NewGuid(), UserId = userId, Name = "Debt 2", RemainingAmount = 2000m, InterestRate = 20m, MinimumPayment = 100m },
            new Debt { Id = Guid.NewGuid(), UserId = userId, Name = "Debt 3", RemainingAmount = 8000m, InterestRate = 10m, MinimumPayment = 300m }
        };

        _mockDebtRepository
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<Debt, bool>>>()))
            .ReturnsAsync(debts);

        var request = new DebtSimulationRequest(1000m, DebtPaymentStrategy.Snowball);
        var command = new SimulateDebtPaymentCommand(userId, request);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Strategy.Should().Be(DebtPaymentStrategy.Snowball);
        result.PaymentPlan.Should().HaveCount(3);
        result.PaymentPlan.First().PaymentOrder.Should().Be(1);
        result.PaymentPlan.First().DebtName.Should().Be("Debt 2"); // Menor saldo
    }

    [Fact]
    public async Task SimulateDebtPayment_Avalanche_OrdersByHighestInterestRate()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var debts = new List<Debt>
        {
            new Debt { Id = Guid.NewGuid(), UserId = userId, Name = "Debt 1", RemainingAmount = 5000m, InterestRate = 15m, MinimumPayment = 200m },
            new Debt { Id = Guid.NewGuid(), UserId = userId, Name = "Debt 2", RemainingAmount = 2000m, InterestRate = 20m, MinimumPayment = 100m },
            new Debt { Id = Guid.NewGuid(), UserId = userId, Name = "Debt 3", RemainingAmount = 8000m, InterestRate = 10m, MinimumPayment = 300m }
        };

        _mockDebtRepository
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<Debt, bool>>>()))
            .ReturnsAsync(debts);

        var request = new DebtSimulationRequest(1000m, DebtPaymentStrategy.Avalanche);
        var command = new SimulateDebtPaymentCommand(userId, request);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Strategy.Should().Be(DebtPaymentStrategy.Avalanche);
        result.PaymentPlan.Should().HaveCount(3);
        result.PaymentPlan.First().PaymentOrder.Should().Be(1);
        result.PaymentPlan.First().DebtName.Should().Be("Debt 2"); // Maior taxa
    }

    [Fact]
    public async Task SimulateDebtPayment_WithNoDebts_ReturnsEmptyPlan()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _mockDebtRepository
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<Debt, bool>>>()))
            .ReturnsAsync(new List<Debt>());

        var request = new DebtSimulationRequest(1000m, DebtPaymentStrategy.Snowball);
        var command = new SimulateDebtPaymentCommand(userId, request);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.PaymentPlan.Should().BeEmpty();
        result.TotalInterestPaid.Should().Be(0);
        result.MonthsToPayoff.Should().Be(0);
    }
}
