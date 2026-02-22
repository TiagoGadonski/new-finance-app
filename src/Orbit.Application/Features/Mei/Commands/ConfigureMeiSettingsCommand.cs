using Orbit.Application.Common.DTOs;
using Orbit.Domain.Entities;
using Orbit.Domain.Interfaces;
using MediatR;

namespace Orbit.Application.Features.Mei.Commands;

public record ConfigureMeiSettingsCommand(
    Guid FamilyId,
    string Username,
    CreateMeiSettingsRequest Request
) : IRequest<MeiSettingsDto>;

public class ConfigureMeiSettingsCommandHandler : IRequestHandler<ConfigureMeiSettingsCommand, MeiSettingsDto>
{
    private readonly IRepository<MeiSettings> _repository;

    public ConfigureMeiSettingsCommandHandler(IRepository<MeiSettings> repository)
    {
        _repository = repository;
    }

    public async Task<MeiSettingsDto> Handle(ConfigureMeiSettingsCommand command, CancellationToken cancellationToken)
    {
        // Verificar se já existe configuração para este ano
        var existing = (await _repository.FindAsync(m =>
            m.FamilyId == command.FamilyId && m.Year == command.Request.Year))
            .FirstOrDefault();

        if (existing != null)
        {
            // Atualizar existente
            existing.AnnualRevenueLimit = command.Request.AnnualRevenueLimit;
            existing.StartMonth = command.Request.StartMonth;
            existing.MainCategoryId = command.Request.MainCategoryId;
            existing.AlertThreshold1 = command.Request.AlertThreshold1;
            existing.AlertThreshold2 = command.Request.AlertThreshold2;
            existing.AlertThreshold3 = command.Request.AlertThreshold3;
            existing.UpdatedAt = DateTime.UtcNow;
            existing.UpdatedByUsername = command.Username;

            await _repository.UpdateAsync(existing);

            return new MeiSettingsDto(
                existing.Id,
                existing.AnnualRevenueLimit,
                existing.Year,
                existing.StartMonth,
                existing.MainCategoryId,
                existing.AlertThreshold1,
                existing.AlertThreshold2,
                existing.AlertThreshold3,
                existing.GetProportionalLimit(),
                existing.GetMonthlyAverageLimit()
            );
        }

        // Criar novo
        var meiSettings = new MeiSettings
        {
            Id = Guid.NewGuid(),
            FamilyId = command.FamilyId,
            Year = command.Request.Year,
            AnnualRevenueLimit = command.Request.AnnualRevenueLimit,
            StartMonth = command.Request.StartMonth,
            MainCategoryId = command.Request.MainCategoryId,
            AlertThreshold1 = command.Request.AlertThreshold1,
            AlertThreshold2 = command.Request.AlertThreshold2,
            AlertThreshold3 = command.Request.AlertThreshold3,
            CreatedAt = DateTime.UtcNow,
            CreatedByUsername = command.Username
        };

        await _repository.AddAsync(meiSettings);

        return new MeiSettingsDto(
            meiSettings.Id,
            meiSettings.AnnualRevenueLimit,
            meiSettings.Year,
            meiSettings.StartMonth,
            meiSettings.MainCategoryId,
            meiSettings.AlertThreshold1,
            meiSettings.AlertThreshold2,
            meiSettings.AlertThreshold3,
            meiSettings.GetProportionalLimit(),
            meiSettings.GetMonthlyAverageLimit()
        );
    }
}
