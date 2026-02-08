using Microsoft.AspNetCore.Mvc;
using FinanceApp.Application.Common.DTOs;
using FinanceApp.Domain.Interfaces;
using FinanceApp.Domain.Entities;

namespace FinanceApp.Api.Controllers;

[Route("api/[controller]")]
public class WorkCalendarController : BaseAuthenticatedController
{
    private readonly IRepository<WorkCalendarSettings> _settingsRepository;
    private readonly IRepository<WorkDay> _workDayRepository;
    private readonly IRepository<Holiday> _holidayRepository;

    public WorkCalendarController(
        IRepository<WorkCalendarSettings> settingsRepository,
        IRepository<WorkDay> workDayRepository,
        IRepository<Holiday> holidayRepository)
    {
        _settingsRepository = settingsRepository;
        _workDayRepository = workDayRepository;
        _holidayRepository = holidayRepository;
    }

    // ==================== Settings ====================

    [HttpGet("settings")]
    public async Task<ActionResult<WorkCalendarSettingsDto>> GetSettings()
    {
        var settings = (await _settingsRepository.FindAsync(s => s.FamilyId == FamilyId)).FirstOrDefault();
        if (settings == null)
            return Ok(new WorkCalendarSettingsDto(Guid.Empty, 0, 8));

        return Ok(new WorkCalendarSettingsDto(settings.Id, settings.HourlyRate, settings.HoursPerDay));
    }

    [HttpPut("settings")]
    public async Task<ActionResult<WorkCalendarSettingsDto>> UpdateSettings([FromBody] CreateOrUpdateSettingsRequest request)
    {
        var settings = (await _settingsRepository.FindAsync(s => s.FamilyId == FamilyId)).FirstOrDefault();

        if (settings == null)
        {
            settings = new WorkCalendarSettings
            {
                Id = Guid.NewGuid(),
                FamilyId = FamilyId,
                HourlyRate = request.HourlyRate,
                HoursPerDay = request.HoursPerDay,
                CreatedAt = DateTime.UtcNow,
                CreatedByUsername = Username
            };
            await _settingsRepository.AddAsync(settings);
        }
        else
        {
            settings.HourlyRate = request.HourlyRate;
            settings.HoursPerDay = request.HoursPerDay;
            settings.UpdatedAt = DateTime.UtcNow;
            settings.UpdatedByUsername = Username;
            await _settingsRepository.UpdateAsync(settings);
        }

        await _settingsRepository.SaveChangesAsync();

        return Ok(new WorkCalendarSettingsDto(settings.Id, settings.HourlyRate, settings.HoursPerDay));
    }

    // ==================== Month Summary ====================

    [HttpGet("month")]
    public async Task<ActionResult<MonthSummaryDto>> GetMonthSummary([FromQuery] int year, [FromQuery] int month)
    {
        var settings = (await _settingsRepository.FindAsync(s => s.FamilyId == FamilyId)).FirstOrDefault();
        var hoursPerDay = settings?.HoursPerDay ?? 8m;
        var hourlyRate = settings?.HourlyRate ?? 0m;

        // Get holidays for this family
        var holidays = await _holidayRepository.FindAsync(h => h.FamilyId == FamilyId);
        var holidayList = holidays.ToList();

        // Resolve holiday dates for this year/month
        var holidayDates = ResolveHolidaysForMonth(holidayList, year, month);

        // Calculate business days (weekdays that are not holidays)
        var businessDays = 0;
        var daysInMonth = DateTime.DaysInMonth(year, month);
        for (var day = 1; day <= daysInMonth; day++)
        {
            var date = new DateTime(year, month, day);
            if (date.DayOfWeek != DayOfWeek.Saturday &&
                date.DayOfWeek != DayOfWeek.Sunday &&
                !holidayDates.Any(h => h.Date.Date == date.Date))
            {
                businessDays++;
            }
        }

        // Get worked days for this month
        var startDate = new DateTime(year, month, 1);
        var endDate = startDate.AddMonths(1);
        var workDays = (await _workDayRepository.FindAsync(w =>
            w.FamilyId == FamilyId &&
            w.Date >= startDate &&
            w.Date < endDate))
            .OrderBy(w => w.Date)
            .ToList();

        var totalHours = workDays.Sum(w => w.HoursWorked);
        var estimatedValue = totalHours * hourlyRate;

        // Payment date: day 20 of the next month
        var paymentDate = month == 12
            ? new DateTime(year + 1, 1, 20)
            : new DateTime(year, month + 1, 20);

        var workDayDtos = workDays.Select(w => new WorkDayDto(w.Id, w.Date, w.HoursWorked)).ToList();
        var holidayDtos = holidayDates
            .Where(h => h.Date.Month == month)
            .Select(h => new MonthHolidayDto(h.Date, h.Name))
            .OrderBy(h => h.Date)
            .ToList();

        return Ok(new MonthSummaryDto(
            year, month, businessDays, workDays.Count, totalHours,
            estimatedValue, paymentDate, workDayDtos, holidayDtos
        ));
    }

    // ==================== Toggle WorkDay ====================

    [HttpPost("toggle")]
    public async Task<ActionResult<WorkDayDto?>> ToggleWorkDay([FromBody] ToggleWorkDayRequest request)
    {
        var date = request.Date.Date;

        var existing = (await _workDayRepository.FindAsync(w =>
            w.FamilyId == FamilyId && w.Date == date)).FirstOrDefault();

        if (existing != null)
        {
            // Unmark: delete the work day
            await _workDayRepository.DeleteAsync(existing);
            await _workDayRepository.SaveChangesAsync();
            return Ok((WorkDayDto?)null);
        }

        // Mark: create a new work day
        var settings = (await _settingsRepository.FindAsync(s => s.FamilyId == FamilyId)).FirstOrDefault();
        var hoursPerDay = settings?.HoursPerDay ?? 8m;

        var workDay = new WorkDay
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Date = date,
            HoursWorked = hoursPerDay,
            CreatedAt = DateTime.UtcNow
        };

        await _workDayRepository.AddAsync(workDay);
        await _workDayRepository.SaveChangesAsync();

        return Ok(new WorkDayDto(workDay.Id, workDay.Date, workDay.HoursWorked));
    }

    // ==================== Holidays CRUD ====================

    [HttpGet("holidays")]
    public async Task<ActionResult<IEnumerable<HolidayDto>>> GetHolidays()
    {
        var holidays = await _holidayRepository.FindAsync(h => h.FamilyId == FamilyId);

        // Seed default holidays if none exist
        if (!holidays.Any())
        {
            await SeedDefaultHolidays();
            holidays = await _holidayRepository.FindAsync(h => h.FamilyId == FamilyId);
        }

        var holidayDtos = holidays
            .OrderBy(h => h.IsFixed ? 0 : 1)
            .ThenBy(h => h.Month)
            .ThenBy(h => h.Day)
            .Select(h => new HolidayDto(h.Id, h.Name, h.Month, h.Day, h.IsFixed, h.EasterOffset));

        return Ok(holidayDtos);
    }

    [HttpPost("holidays")]
    public async Task<ActionResult<HolidayDto>> CreateHoliday([FromBody] CreateHolidayRequest request)
    {
        var holiday = new Holiday
        {
            Id = Guid.NewGuid(),
            FamilyId = FamilyId,
            Name = request.Name,
            Month = request.Month,
            Day = request.Day,
            IsFixed = request.IsFixed,
            EasterOffset = request.EasterOffset,
            CreatedAt = DateTime.UtcNow
        };

        await _holidayRepository.AddAsync(holiday);
        await _holidayRepository.SaveChangesAsync();

        return Ok(new HolidayDto(holiday.Id, holiday.Name, holiday.Month, holiday.Day, holiday.IsFixed, holiday.EasterOffset));
    }

    [HttpPut("holidays/{id}")]
    public async Task<ActionResult<HolidayDto>> UpdateHoliday(Guid id, [FromBody] UpdateHolidayRequest request)
    {
        var holiday = await _holidayRepository.GetByIdAsync(id);
        if (holiday == null || holiday.FamilyId != FamilyId)
            return NotFound();

        holiday.Name = request.Name;
        holiday.Month = request.Month;
        holiday.Day = request.Day;
        holiday.IsFixed = request.IsFixed;
        holiday.EasterOffset = request.EasterOffset;
        holiday.UpdatedAt = DateTime.UtcNow;

        await _holidayRepository.UpdateAsync(holiday);
        await _holidayRepository.SaveChangesAsync();

        return Ok(new HolidayDto(holiday.Id, holiday.Name, holiday.Month, holiday.Day, holiday.IsFixed, holiday.EasterOffset));
    }

    [HttpDelete("holidays/{id}")]
    public async Task<ActionResult> DeleteHoliday(Guid id)
    {
        var holiday = await _holidayRepository.GetByIdAsync(id);
        if (holiday == null || holiday.FamilyId != FamilyId)
            return NotFound();

        await _holidayRepository.DeleteAsync(holiday);
        await _holidayRepository.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("holidays/reset")]
    public async Task<ActionResult<IEnumerable<HolidayDto>>> ResetHolidays()
    {
        // Delete all existing holidays for this family
        var existing = await _holidayRepository.FindAsync(h => h.FamilyId == FamilyId);
        foreach (var holiday in existing)
        {
            await _holidayRepository.DeleteAsync(holiday);
        }
        await _holidayRepository.SaveChangesAsync();

        // Re-seed defaults
        await SeedDefaultHolidays();

        var holidays = await _holidayRepository.FindAsync(h => h.FamilyId == FamilyId);
        var holidayDtos = holidays
            .OrderBy(h => h.IsFixed ? 0 : 1)
            .ThenBy(h => h.Month)
            .ThenBy(h => h.Day)
            .Select(h => new HolidayDto(h.Id, h.Name, h.Month, h.Day, h.IsFixed, h.EasterOffset));

        return Ok(holidayDtos);
    }

    // ==================== Helper Methods ====================

    /// <summary>
    /// Calcula a data da Páscoa para um ano usando o algoritmo de Meeus/Jones/Butcher
    /// </summary>
    private static DateTime CalculateEaster(int year)
    {
        var a = year % 19;
        var b = year / 100;
        var c = year % 100;
        var d = b / 4;
        var e = b % 4;
        var f = (b + 8) / 25;
        var g = (b - f + 1) / 3;
        var h = (19 * a + b - d - g + 15) % 30;
        var i = c / 4;
        var k = c % 4;
        var l = (32 + 2 * e + 2 * i - h - k) % 7;
        var m = (a + 11 * h + 22 * l) / 451;
        var month = (h + l - 7 * m + 114) / 31;
        var day = ((h + l - 7 * m + 114) % 31) + 1;
        return new DateTime(year, month, day);
    }

    /// <summary>
    /// Resolve feriados para um mês específico, incluindo feriados baseados na Páscoa
    /// </summary>
    private List<(DateTime Date, string Name)> ResolveHolidaysForMonth(List<Holiday> holidays, int year, int month)
    {
        var easter = CalculateEaster(year);
        var resolved = new List<(DateTime Date, string Name)>();

        foreach (var holiday in holidays)
        {
            if (holiday.IsFixed && holiday.Month.HasValue && holiday.Day.HasValue)
            {
                var date = new DateTime(year, holiday.Month.Value, holiday.Day.Value);
                if (date.Month == month)
                    resolved.Add((date, holiday.Name));
            }
            else if (!holiday.IsFixed && holiday.EasterOffset.HasValue)
            {
                var date = easter.AddDays(holiday.EasterOffset.Value);
                if (date.Month == month)
                    resolved.Add((date, holiday.Name));
            }
        }

        return resolved;
    }

    /// <summary>
    /// Seed dos feriados padrão de Araucária/PR
    /// </summary>
    private async Task SeedDefaultHolidays()
    {
        var defaults = new List<Holiday>
        {
            // Feriados fixos
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Confraternização Universal", Month = 1, Day = 1, IsFixed = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Aniversário de Araucária", Month = 2, Day = 11, IsFixed = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Tiradentes", Month = 4, Day = 21, IsFixed = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Dia do Trabalho", Month = 5, Day = 1, IsFixed = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Independência do Brasil", Month = 9, Day = 7, IsFixed = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Nossa Senhora Aparecida", Month = 10, Day = 12, IsFixed = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Nossa Senhora dos Remédios", Month = 10, Day = 30, IsFixed = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Finados", Month = 11, Day = 2, IsFixed = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Proclamação da República", Month = 11, Day = 15, IsFixed = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Consciência Negra", Month = 11, Day = 20, IsFixed = true, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Natal", Month = 12, Day = 25, IsFixed = true, CreatedAt = DateTime.UtcNow },

            // Feriados variáveis (baseados na Páscoa)
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Carnaval (segunda)", IsFixed = false, EasterOffset = -48, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Carnaval (terça)", IsFixed = false, EasterOffset = -47, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Sexta-feira Santa", IsFixed = false, EasterOffset = -2, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), FamilyId = FamilyId, Name = "Corpus Christi", IsFixed = false, EasterOffset = 60, CreatedAt = DateTime.UtcNow },
        };

        foreach (var holiday in defaults)
        {
            await _holidayRepository.AddAsync(holiday);
        }
        await _holidayRepository.SaveChangesAsync();
    }
}
