using Xunit;
using FluentAssertions;
using FinanceApp.Domain.Entities;

namespace FinanceApp.Tests.Features.Budgets;

public class BudgetTests
{
    [Fact]
    public void PercentageUsed_CalculatesCorrectly()
    {
        // Arrange
        var budget = new Budget
        {
            Limit = 1000m,
            Spent = 500m
        };

        // Act
        var percentage = budget.PercentageUsed;

        // Assert
        percentage.Should().Be(50m);
    }

    [Fact]
    public void ShouldAlert_ReturnsFalse_WhenBelowThreshold()
    {
        // Arrange
        var budget = new Budget
        {
            Limit = 1000m,
            Spent = 700m,
            AlertSent = false
        };

        // Act
        var shouldAlert = budget.ShouldAlert;

        // Assert
        shouldAlert.Should().BeFalse();
    }

    [Fact]
    public void ShouldAlert_ReturnsTrue_WhenAboveThresholdAndNotSent()
    {
        // Arrange
        var budget = new Budget
        {
            Limit = 1000m,
            Spent = 850m,
            AlertSent = false
        };

        // Act
        var shouldAlert = budget.ShouldAlert;

        // Assert
        shouldAlert.Should().BeTrue();
    }

    [Fact]
    public void ShouldAlert_ReturnsFalse_WhenAlreadySent()
    {
        // Arrange
        var budget = new Budget
        {
            Limit = 1000m,
            Spent = 850m,
            AlertSent = true
        };

        // Act
        var shouldAlert = budget.ShouldAlert;

        // Assert
        shouldAlert.Should().BeFalse();
    }
}
