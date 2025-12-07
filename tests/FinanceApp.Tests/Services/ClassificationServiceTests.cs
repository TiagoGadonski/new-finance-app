using Xunit;
using Moq;
using FluentAssertions;
using FinanceApp.Application.Services;
using FinanceApp.Domain.Entities;
using FinanceApp.Domain.Interfaces;
using System.Linq.Expressions;

namespace FinanceApp.Tests.Services;

public class ClassificationServiceTests
{
    private readonly Mock<IRepository<ClassificationRule>> _mockRuleRepository;
    private readonly ClassificationService _service;

    public ClassificationServiceTests()
    {
        _mockRuleRepository = new Mock<IRepository<ClassificationRule>>();
        _service = new ClassificationService(_mockRuleRepository.Object);
    }

    [Fact]
    public async Task SuggestCategoryAsync_WithMatchingRule_ReturnsCategoryId()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var description = "Compra no Uber Eats";

        var rules = new List<ClassificationRule>
        {
            new ClassificationRule
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Keyword = "uber",
                CategoryId = categoryId,
                Priority = 5,
                IsLearned = true
            }
        };

        _mockRuleRepository
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<ClassificationRule, bool>>>()))
            .ReturnsAsync(rules);

        // Act
        var result = await _service.SuggestCategoryAsync(userId, description);

        // Assert
        result.Should().Be(categoryId);
    }

    [Fact]
    public async Task SuggestCategoryAsync_WithNoMatchingRule_ReturnsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var description = "Random transaction";

        _mockRuleRepository
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<ClassificationRule, bool>>>()))
            .ReturnsAsync(new List<ClassificationRule>());

        // Act
        var result = await _service.SuggestCategoryAsync(userId, description);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task LearnFromUserChoiceAsync_CreatesNewRule_WhenNoExistingRule()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var description = "Pagamento Netflix";

        _mockRuleRepository
            .Setup(r => r.FindAsync(It.IsAny<Expression<Func<ClassificationRule, bool>>>()))
            .ReturnsAsync(new List<ClassificationRule>());

        // Act
        await _service.LearnFromUserChoiceAsync(userId, description, categoryId);

        // Assert
        _mockRuleRepository.Verify(r => r.AddAsync(It.Is<ClassificationRule>(
            rule => rule.Keyword == "netflix" && rule.CategoryId == categoryId && rule.IsLearned
        )), Times.Once);

        _mockRuleRepository.Verify(r => r.SaveChangesAsync(), Times.Once);
    }
}
