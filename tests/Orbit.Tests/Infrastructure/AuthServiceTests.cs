using Xunit;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using Orbit.Infrastructure.Services;
using Orbit.Domain.Entities;

namespace Orbit.Tests.Infrastructure;

public class AuthServiceTests
{
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                {"JwtSettings:SecretKey", "your-super-secret-key-for-testing-purposes-minimum-32-characters"},
                {"JwtSettings:Issuer", "OrbitTest"},
                {"JwtSettings:Audience", "OrbitUsersTest"}
            })
            .Build();

        _authService = new AuthService(configuration);
    }

    [Fact]
    public void HashPassword_ReturnsHashedPassword()
    {
        // Arrange
        var password = "TestPassword123!";

        // Act
        var hash = _authService.HashPassword(password);

        // Assert
        hash.Should().NotBeNullOrEmpty();
        hash.Should().NotBe(password);
    }

    [Fact]
    public void VerifyPassword_WithCorrectPassword_ReturnsTrue()
    {
        // Arrange
        var password = "TestPassword123!";
        var hash = _authService.HashPassword(password);

        // Act
        var result = _authService.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_WithIncorrectPassword_ReturnsFalse()
    {
        // Arrange
        var password = "TestPassword123!";
        var wrongPassword = "WrongPassword456!";
        var hash = _authService.HashPassword(password);

        // Act
        var result = _authService.VerifyPassword(wrongPassword, hash);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void GenerateJwtToken_ReturnsValidToken()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            FamilyId = Guid.NewGuid(),
            Name = "Test User",
            Username = "testuser"
        };

        // Act
        var token = _authService.GenerateJwtToken(user);

        // Assert
        token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void GenerateRefreshToken_ReturnsUniqueToken()
    {
        // Act
        var token1 = _authService.GenerateRefreshToken();
        var token2 = _authService.GenerateRefreshToken();

        // Assert
        token1.Should().NotBeNullOrEmpty();
        token2.Should().NotBeNullOrEmpty();
        token1.Should().NotBe(token2);
    }
}
