using Xunit;
using FluentAssertions;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;

namespace Orbit.Tests.Features.Subscriptions;

public class SubscriptionTests
{
    [Fact]
    public void IsLowUsage_ReturnsTrue_WhenUsageCountIsLow()
    {
        // Arrange
        var subscription = new Subscription
        {
            UsageCount = 1
        };

        // Act
        var isLowUsage = subscription.IsLowUsage;

        // Assert
        isLowUsage.Should().BeTrue();
    }

    [Fact]
    public void IsLowUsage_ReturnsFalse_WhenUsageCountIsHigh()
    {
        // Arrange
        var subscription = new Subscription
        {
            UsageCount = 5
        };

        // Act
        var isLowUsage = subscription.IsLowUsage;

        // Assert
        isLowUsage.Should().BeFalse();
    }

    [Fact]
    public void ShouldNotifyRenewal_ReturnsTrue_WhenWithinThreeDays()
    {
        // Arrange
        var currentDate = DateTime.UtcNow;
        var subscription = new Subscription
        {
            NextBillingDate = currentDate.AddDays(2)
        };

        // Act
        var shouldNotify = subscription.ShouldNotifyRenewal(currentDate);

        // Assert
        shouldNotify.Should().BeTrue();
    }

    [Fact]
    public void ShouldNotifyRenewal_ReturnsFalse_WhenMoreThanThreeDays()
    {
        // Arrange
        var currentDate = DateTime.UtcNow;
        var subscription = new Subscription
        {
            NextBillingDate = currentDate.AddDays(5)
        };

        // Act
        var shouldNotify = subscription.ShouldNotifyRenewal(currentDate);

        // Assert
        shouldNotify.Should().BeFalse();
    }

    [Fact]
    public void ShouldNotifyRenewal_ReturnsFalse_WhenAlreadyPassed()
    {
        // Arrange
        var currentDate = DateTime.UtcNow;
        var subscription = new Subscription
        {
            NextBillingDate = currentDate.AddDays(-1)
        };

        // Act
        var shouldNotify = subscription.ShouldNotifyRenewal(currentDate);

        // Assert
        shouldNotify.Should().BeFalse();
    }
}
