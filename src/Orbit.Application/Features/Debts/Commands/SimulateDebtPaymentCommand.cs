using MediatR;
using Orbit.Application.Common.DTOs;
using Orbit.Domain.Interfaces;
using Orbit.Domain.Entities;
using Orbit.Domain.Enums;

namespace Orbit.Application.Features.Debts.Commands;

public record SimulateDebtPaymentCommand(
    Guid FamilyId,
    DebtSimulationRequest Request
) : IRequest<DebtSimulationDto>;

public class SimulateDebtPaymentCommandHandler : IRequestHandler<SimulateDebtPaymentCommand, DebtSimulationDto>
{
    private readonly IRepository<Debt> _debtRepository;

    public SimulateDebtPaymentCommandHandler(IRepository<Debt> debtRepository)
    {
        _debtRepository = debtRepository;
    }

    public async Task<DebtSimulationDto> Handle(SimulateDebtPaymentCommand request, CancellationToken cancellationToken)
    {
        var debts = (await _debtRepository.FindAsync(d => d.FamilyId == request.FamilyId))
            .Where(d => d.RemainingAmount > 0)
            .ToList();

        if (!debts.Any())
            return new DebtSimulationDto(request.Request.Strategy, new List<DebtPaymentPlanDto>(), 0, 0, 0);

        var paymentPlan = request.Request.Strategy == DebtPaymentStrategy.Snowball
            ? CalculateSnowball(debts, request.Request.MonthlyPayment)
            : CalculateAvalanche(debts, request.Request.MonthlyPayment);

        var totalInterest = paymentPlan.Sum(p => p.TotalInterest);
        var monthsToPayoff = paymentPlan.Max(p => p.MonthsToPayoff);

        // Calcular economia comparada com pagamento mÃ­nimo
        var minPaymentTotal = debts.Sum(d => CalculateInterestWithMinPayment(d));
        var savings = minPaymentTotal - totalInterest;

        return new DebtSimulationDto(
            request.Request.Strategy,
            paymentPlan,
            totalInterest,
            monthsToPayoff,
            savings
        );
    }

    private List<DebtPaymentPlanDto> CalculateSnowball(List<Debt> debts, decimal monthlyPayment)
    {
        // Ordena por menor saldo primeiro
        var orderedDebts = debts.OrderBy(d => d.RemainingAmount).ToList();
        return CalculatePaymentPlan(orderedDebts, monthlyPayment);
    }

    private List<DebtPaymentPlanDto> CalculateAvalanche(List<Debt> debts, decimal monthlyPayment)
    {
        // Ordena por maior taxa de juros primeiro
        var orderedDebts = debts.OrderByDescending(d => d.InterestRate).ToList();
        return CalculatePaymentPlan(orderedDebts, monthlyPayment);
    }

    private List<DebtPaymentPlanDto> CalculatePaymentPlan(List<Debt> orderedDebts, decimal monthlyPayment)
    {
        var plan = new List<DebtPaymentPlanDto>();
        var availablePayment = monthlyPayment;
        var paymentOrder = 1;

        foreach (var debt in orderedDebts)
        {
            var payment = Math.Max(debt.MinimumPayment, availablePayment);
            var monthlyInterestRate = debt.InterestRate / 100 / 12;

            var months = CalculateMonthsToPayoff(debt.RemainingAmount, payment, monthlyInterestRate);
            var totalInterest = (payment * months) - debt.RemainingAmount;

            plan.Add(new DebtPaymentPlanDto(
                debt.Id,
                debt.Name,
                paymentOrder++,
                payment,
                months,
                totalInterest
            ));

            availablePayment -= debt.MinimumPayment;
            if (availablePayment < 0) availablePayment = 0;
        }

        return plan;
    }

    private int CalculateMonthsToPayoff(decimal principal, decimal payment, decimal monthlyRate)
    {
        if (monthlyRate == 0)
            return (int)Math.Ceiling(principal / payment);

        var months = Math.Log((double)(payment / (payment - principal * monthlyRate))) / Math.Log(1 + (double)monthlyRate);
        return (int)Math.Ceiling(months);
    }

    private decimal CalculateInterestWithMinPayment(Debt debt)
    {
        var monthlyRate = debt.InterestRate / 100 / 12;
        var months = CalculateMonthsToPayoff(debt.RemainingAmount, debt.MinimumPayment, monthlyRate);
        return (debt.MinimumPayment * months) - debt.RemainingAmount;
    }
}
