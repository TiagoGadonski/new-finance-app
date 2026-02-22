using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;

namespace Orbit.Api.Controllers;

[Route("api/[controller]")]
public class CategoriesController : BaseAuthenticatedController
{
    private readonly IRepository<Category> _categoryRepository;

    public CategoriesController(IRepository<Category> categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create([FromBody] CreateCategoryRequest request)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Name = request.Name,
            Type = request.Type,
            Icon = request.Icon,
            Color = request.Color,
            IsDefault = false,
            CreatedAt = DateTime.UtcNow
        };

        await _categoryRepository.AddAsync(category);
        await _categoryRepository.SaveChangesAsync();

        return Ok(new CategoryDto(
            category.Id,
            category.Name,
            category.Type,
            category.Icon,
            category.Color,
            category.IsDefault
        ));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll([FromQuery] string? type = null)
    {
        // Get both default categories and family's custom categories
        var categories = await _categoryRepository.FindAsync(c =>
            c.FamilyId == FamilyId || c.IsDefault);

        if (!string.IsNullOrEmpty(type) && Enum.TryParse<Domain.Enums.TransactionType>(type, true, out var transactionType))
        {
            categories = categories.Where(c => c.Type == transactionType);
        }

        var categoryDtos = categories.Select(c => new CategoryDto(
            c.Id,
            c.Name,
            c.Type,
            c.Icon,
            c.Color,
            c.IsDefault
        ));

        return Ok(categoryDtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetById(Guid id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null || (category.FamilyId != FamilyId && !category.IsDefault))
            return NotFound();

        return Ok(new CategoryDto(
            category.Id,
            category.Name,
            category.Type,
            category.Icon,
            category.Color,
            category.IsDefault
        ));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> Update(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null || (category.FamilyId != FamilyId && !category.IsDefault))
            return NotFound();

        if (category.IsDefault)
            return BadRequest("Cannot modify default categories");

        category.Name = request.Name;
        category.Icon = request.Icon;
        category.Color = request.Color;
        category.UpdatedAt = DateTime.UtcNow;

        await _categoryRepository.UpdateAsync(category);
        await _categoryRepository.SaveChangesAsync();

        return Ok(new CategoryDto(
            category.Id,
            category.Name,
            category.Type,
            category.Icon,
            category.Color,
            category.IsDefault
        ));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        if (category == null || (category.FamilyId != FamilyId && !category.IsDefault))
            return NotFound();

        if (category.IsDefault)
            return BadRequest("Cannot delete default categories");

        await _categoryRepository.DeleteAsync(category);
        await _categoryRepository.SaveChangesAsync();

        return NoContent();
    }
}
