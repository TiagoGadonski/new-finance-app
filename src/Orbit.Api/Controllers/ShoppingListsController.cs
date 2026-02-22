using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;

namespace Orbit.Api.Controllers;

[Route("api/[controller]")]
public class ShoppingListsController : BaseAuthenticatedController
{
    private readonly IRepository<ShoppingList> _shoppingListRepository;
    private readonly IRepository<ShoppingItem> _shoppingItemRepository;
    private readonly IRepository<Transaction> _transactionRepository;
    private readonly IRepository<Account> _accountRepository;

    public ShoppingListsController(
        IRepository<ShoppingList> shoppingListRepository,
        IRepository<ShoppingItem> shoppingItemRepository,
        IRepository<Transaction> transactionRepository,
        IRepository<Account> accountRepository)
    {
        _shoppingListRepository = shoppingListRepository;
        _shoppingItemRepository = shoppingItemRepository;
        _transactionRepository = transactionRepository;
        _accountRepository = accountRepository;
    }

    // ==================== SHOPPING LISTS ====================

    [HttpPost]
    public async Task<ActionResult<ShoppingListDto>> CreateList([FromBody] CreateShoppingListRequest request)
    {
        var shoppingList = new ShoppingList
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Name = request.Name,
            Description = request.Description,
            TargetDate = request.TargetDate,
            Status = ShoppingListStatus.Planning,
            CreatedAt = DateTime.UtcNow
        };

        await _shoppingListRepository.AddAsync(shoppingList);
        await _shoppingListRepository.SaveChangesAsync();

        return Ok(await MapToDetailedDtoAsync(shoppingList));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShoppingListDto>>> GetAllLists()
    {
        var lists = await _shoppingListRepository.FindAsync(sl => sl.FamilyId == FamilyId);
        var result = new List<ShoppingListDto>();

        foreach (var list in lists)
        {
            result.Add(await MapToDetailedDtoAsync(list));
        }

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ShoppingListDto>> GetListById(Guid id)
    {
        var shoppingList = await _shoppingListRepository.GetByIdAsync(id);
        if (shoppingList == null || shoppingList.FamilyId != FamilyId)
            return NotFound();

        return Ok(await MapToDetailedDtoAsync(shoppingList));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ShoppingListDto>> UpdateList(Guid id, [FromBody] UpdateShoppingListRequest request)
    {
        var shoppingList = await _shoppingListRepository.GetByIdAsync(id);
        if (shoppingList == null || shoppingList.FamilyId != FamilyId)
            return NotFound();

        shoppingList.Name = request.Name;
        shoppingList.Description = request.Description;
        shoppingList.TargetDate = request.TargetDate;
        shoppingList.Status = request.Status;
        shoppingList.UpdatedAt = DateTime.UtcNow;

        await _shoppingListRepository.UpdateAsync(shoppingList);
        await _shoppingListRepository.SaveChangesAsync();

        return Ok(await MapToDetailedDtoAsync(shoppingList));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteList(Guid id)
    {
        var shoppingList = await _shoppingListRepository.GetByIdAsync(id);
        if (shoppingList == null || shoppingList.FamilyId != FamilyId)
            return NotFound();

        await _shoppingListRepository.DeleteAsync(shoppingList);
        await _shoppingListRepository.SaveChangesAsync();

        return NoContent();
    }

    // ==================== SHOPPING ITEMS ====================

    [HttpPost("{listId}/items")]
    public async Task<ActionResult<ShoppingItemDto>> CreateItem(Guid listId, [FromBody] CreateShoppingItemRequest request)
    {
        var shoppingList = await _shoppingListRepository.GetByIdAsync(listId);
        if (shoppingList == null || shoppingList.FamilyId != FamilyId)
            return NotFound("Shopping list not found");

        var item = new ShoppingItem
        {
            Id = Guid.NewGuid(),
            ShoppingListId = listId,
            Name = request.Name,
            Quantity = request.Quantity,
            EstimatedPrice = request.EstimatedPrice,
            Category = request.Category,
            Priority = request.Priority,
            IsPurchased = false,
            CreatedAt = DateTime.UtcNow
        };

        await _shoppingItemRepository.AddAsync(item);
        await _shoppingItemRepository.SaveChangesAsync();

        return Ok(MapItemToDto(item));
    }

    [HttpPut("{listId}/items/{itemId}")]
    public async Task<ActionResult<ShoppingItemDto>> UpdateItem(Guid listId, Guid itemId, [FromBody] UpdateShoppingItemRequest request)
    {
        var shoppingList = await _shoppingListRepository.GetByIdAsync(listId);
        if (shoppingList == null || shoppingList.FamilyId != FamilyId)
            return NotFound("Shopping list not found");

        var item = await _shoppingItemRepository.GetByIdAsync(itemId);
        if (item == null || item.ShoppingListId != listId)
            return NotFound("Item not found");

        item.Name = request.Name;
        item.Quantity = request.Quantity;
        item.EstimatedPrice = request.EstimatedPrice;
        item.ActualPrice = request.ActualPrice;
        item.Category = request.Category;
        item.Priority = request.Priority;
        item.IsPurchased = request.IsPurchased;
        item.UpdatedAt = DateTime.UtcNow;

        if (request.IsPurchased && item.PurchasedDate == null)
        {
            item.PurchasedDate = DateTime.UtcNow;
        }

        await _shoppingItemRepository.UpdateAsync(item);
        await _shoppingItemRepository.SaveChangesAsync();

        return Ok(MapItemToDto(item));
    }

    [HttpDelete("{listId}/items/{itemId}")]
    public async Task<ActionResult> DeleteItem(Guid listId, Guid itemId)
    {
        var shoppingList = await _shoppingListRepository.GetByIdAsync(listId);
        if (shoppingList == null || shoppingList.FamilyId != FamilyId)
            return NotFound("Shopping list not found");

        var item = await _shoppingItemRepository.GetByIdAsync(itemId);
        if (item == null || item.ShoppingListId != listId)
            return NotFound("Item not found");

        await _shoppingItemRepository.DeleteAsync(item);
        await _shoppingItemRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{listId}/items/{itemId}/purchase")]
    public async Task<ActionResult<ShoppingItemDto>> MarkItemPurchased(Guid listId, Guid itemId, [FromBody] MarkItemPurchasedRequest request)
    {
        var shoppingList = await _shoppingListRepository.GetByIdAsync(listId);
        if (shoppingList == null || shoppingList.FamilyId != FamilyId)
            return NotFound("Shopping list not found");

        var item = await _shoppingItemRepository.GetByIdAsync(itemId);
        if (item == null || item.ShoppingListId != listId)
            return NotFound("Item not found");

        // Atualizar item
        item.IsPurchased = true;
        item.PurchasedDate = DateTime.UtcNow;
        item.ActualPrice = request.ActualPrice ?? item.EstimatedPrice;
        item.UpdatedAt = DateTime.UtcNow;

        // Criar transação se solicitado
        if (request.CreateTransaction && request.AccountId.HasValue && request.CategoryId.HasValue)
        {
            var account = await _accountRepository.GetByIdAsync(request.AccountId.Value);
            if (account == null || account.FamilyId != FamilyId)
                return BadRequest("Invalid account");

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                FamilyId = FamilyId,
                AccountId = request.AccountId.Value,
                CategoryId = request.CategoryId.Value,
                Amount = item.ActualPrice.Value * item.Quantity,
                Description = $"{item.Name} (Lista: {shoppingList.Name})",
                Type = TransactionType.Expense,
                Date = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                CreatedByUsername = Username
            };

            await _transactionRepository.AddAsync(transaction);
            item.TransactionId = transaction.Id;

            // Atualizar saldo da conta
            account.Balance -= transaction.Amount;
            await _accountRepository.UpdateAsync(account);
        }

        await _shoppingItemRepository.UpdateAsync(item);
        await _shoppingItemRepository.SaveChangesAsync();

        return Ok(MapItemToDto(item));
    }

    // ==================== MAPPING ====================

    private async Task<ShoppingListDto> MapToDetailedDtoAsync(ShoppingList list)
    {
        // Carregar items da lista
        var items = await _shoppingItemRepository.FindAsync(i => i.ShoppingListId == list.Id);
        list.Items = items.ToList();

        return new ShoppingListDto(
            list.Id,
            list.Name,
            list.Description,
            list.TargetDate,
            list.Status,
            list.TotalItems,
            list.PurchasedItems,
            list.CompletionPercentage,
            list.TotalEstimatedCost,
            list.TotalSpent,
            list.RemainingBudget,
            list.Items.Select(MapItemToDto).ToList(),
            list.CreatedAt
        );
    }

    private static ShoppingItemDto MapItemToDto(ShoppingItem item) => new(
        item.Id,
        item.Name,
        item.Quantity,
        item.EstimatedPrice,
        item.ActualPrice,
        item.TotalEstimated,
        item.TotalActual,
        item.Category,
        item.Priority,
        item.IsPurchased,
        item.TransactionId,
        item.PurchasedDate
    );
}
