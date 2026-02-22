using Microsoft.AspNetCore.Mvc;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;

namespace Orbit.Api.Controllers;

[Route("api/[controller]")]
public class InvestmentsController : BaseAuthenticatedController
{
    private readonly IRepository<Investment> _investmentRepository;
    private readonly IRepository<InvestmentTransaction> _investmentTransactionRepository;

    public InvestmentsController(
        IRepository<Investment> investmentRepository,
        IRepository<InvestmentTransaction> investmentTransactionRepository)
    {
        _investmentRepository = investmentRepository;
        _investmentTransactionRepository = investmentTransactionRepository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InvestmentDto>>> GetAll()
    {
        var investments = await _investmentRepository.FindAsync(
            i => i.FamilyId == FamilyId,
            i => i.Account);

        var dtos = investments.Select(MapToDto);
        return Ok(dtos);
    }

    [HttpPost]
    public async Task<ActionResult<InvestmentDto>> Create([FromBody] CreateInvestmentRequest request)
    {
        var investment = new Investment
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Name = request.Name,
            Type = request.Type,
            Symbol = request.Symbol,
            Quantity = request.Quantity,
            AveragePrice = request.AveragePrice,
            CurrentPrice = request.CurrentPrice,
            Currency = request.Currency,
            AccountId = request.AccountId,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = Username
        };

        await _investmentRepository.AddAsync(investment);
        await _investmentRepository.SaveChangesAsync();

        var saved = await _investmentRepository.GetByIdAsync(investment.Id, i => i.Account);
        return Ok(MapToDto(saved!));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InvestmentDto>> Update(Guid id, [FromBody] UpdateInvestmentRequest request)
    {
        var investment = await _investmentRepository.GetByIdAsync(id);
        if (investment == null || investment.FamilyId != FamilyId)
            return NotFound();

        investment.Name = request.Name;
        investment.Type = request.Type;
        investment.Symbol = request.Symbol;
        investment.CurrentPrice = request.CurrentPrice;
        investment.Currency = request.Currency;
        investment.AccountId = request.AccountId;
        investment.UpdatedAt = DateTime.UtcNow;
        investment.UpdatedByUsername = Username;

        await _investmentRepository.UpdateAsync(investment);
        await _investmentRepository.SaveChangesAsync();

        var saved = await _investmentRepository.GetByIdAsync(investment.Id, i => i.Account);
        return Ok(MapToDto(saved!));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var investment = await _investmentRepository.GetByIdAsync(id);
        if (investment == null || investment.FamilyId != FamilyId)
            return NotFound();

        await _investmentRepository.DeleteAsync(investment);
        await _investmentRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/transactions")]
    public async Task<ActionResult<InvestmentTransactionDto>> AddTransaction(
        Guid id, [FromBody] CreateInvestmentTransactionRequest request)
    {
        var investment = await _investmentRepository.GetByIdAsync(id);
        if (investment == null || investment.FamilyId != FamilyId)
            return NotFound();

        var investmentTx = new InvestmentTransaction
        {
            Id = Guid.NewGuid(),
            InvestmentId = id,
            Type = request.Type,
            Quantity = request.Quantity,
            Price = request.Price,
            Date = request.Date,
            Fees = request.Fees,
            CreatedAt = DateTime.UtcNow
        };

        // Update investment quantities and average price
        if (request.Type == InvestmentTransactionType.Buy)
        {
            var totalCost = investment.Quantity * investment.AveragePrice + request.Quantity * request.Price;
            investment.Quantity += request.Quantity;
            investment.AveragePrice = investment.Quantity > 0 ? totalCost / investment.Quantity : 0;
        }
        else if (request.Type == InvestmentTransactionType.Sell)
        {
            investment.Quantity -= request.Quantity;
            if (investment.Quantity < 0) investment.Quantity = 0;
        }

        investment.CurrentPrice = request.Price;
        investment.UpdatedAt = DateTime.UtcNow;
        investment.UpdatedByUsername = Username;

        await _investmentTransactionRepository.AddAsync(investmentTx);
        await _investmentRepository.UpdateAsync(investment);
        await _investmentRepository.SaveChangesAsync();

        return Ok(new InvestmentTransactionDto(
            investmentTx.Id, investmentTx.InvestmentId, investmentTx.Type,
            investmentTx.Quantity, investmentTx.Price, investmentTx.Date, investmentTx.Fees
        ));
    }

    [HttpGet("{id}/transactions")]
    public async Task<ActionResult<IEnumerable<InvestmentTransactionDto>>> GetTransactions(Guid id)
    {
        var investment = await _investmentRepository.GetByIdAsync(id);
        if (investment == null || investment.FamilyId != FamilyId)
            return NotFound();

        var transactions = await _investmentTransactionRepository.FindAsync(
            t => t.InvestmentId == id);

        var dtos = transactions
            .OrderByDescending(t => t.Date)
            .Select(t => new InvestmentTransactionDto(
                t.Id, t.InvestmentId, t.Type, t.Quantity, t.Price, t.Date, t.Fees
            ));

        return Ok(dtos);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<InvestmentSummaryDto>> GetSummary()
    {
        var investments = await _investmentRepository.FindAsync(i => i.FamilyId == FamilyId);
        var allTransactions = new List<InvestmentTransaction>();

        foreach (var inv in investments)
        {
            var txs = await _investmentTransactionRepository.FindAsync(t => t.InvestmentId == inv.Id);
            allTransactions.AddRange(txs);
        }

        var totalInvested = investments.Sum(i => i.Quantity * i.AveragePrice);
        var totalCurrentValue = investments.Sum(i => i.Quantity * i.CurrentPrice);
        var totalGainLoss = totalCurrentValue - totalInvested;
        var totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
        var totalDividends = allTransactions
            .Where(t => t.Type == InvestmentTransactionType.Dividend)
            .Sum(t => t.Quantity * t.Price);

        var allocation = investments
            .GroupBy(i => i.Type)
            .Select(g =>
            {
                var value = g.Sum(i => i.Quantity * i.CurrentPrice);
                var percentage = totalCurrentValue > 0 ? (value / totalCurrentValue) * 100 : 0;
                return new InvestmentAllocationDto(g.Key, value, percentage);
            })
            .OrderByDescending(a => a.Value)
            .ToList();

        return Ok(new InvestmentSummaryDto(
            totalInvested, totalCurrentValue, totalGainLoss, totalGainLossPercentage,
            totalDividends, investments.Count(), allocation
        ));
    }

    private static InvestmentDto MapToDto(Investment i)
    {
        var totalValue = i.Quantity * i.CurrentPrice;
        var totalCost = i.Quantity * i.AveragePrice;
        var gainLoss = totalValue - totalCost;
        var gainLossPercentage = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;

        return new InvestmentDto(
            i.Id, i.Name, i.Type, i.Symbol, i.Quantity, i.AveragePrice, i.CurrentPrice,
            i.Currency, i.AccountId, i.Account?.Name,
            totalValue, gainLoss, gainLossPercentage
        );
    }
}
