namespace Orbit.Application.Common.DTOs;

// Settings
public record WorkCalendarSettingsDto(
    Guid Id,
    decimal HourlyRate,
    decimal HoursPerDay
);

public record CreateOrUpdateSettingsRequest(
    decimal HourlyRate,
    decimal HoursPerDay
);

// WorkDay
public record WorkDayDto(
    Guid Id,
    DateTime Date,
    decimal HoursWorked
);

public record ToggleWorkDayRequest(
    DateTime Date
);

// Holiday
public record HolidayDto(
    Guid Id,
    string Name,
    int? Month,
    int? Day,
    bool IsFixed,
    int? EasterOffset
);

public record CreateHolidayRequest(
    string Name,
    int? Month,
    int? Day,
    bool IsFixed,
    int? EasterOffset
);

public record UpdateHolidayRequest(
    string Name,
    int? Month,
    int? Day,
    bool IsFixed,
    int? EasterOffset
);

// Month Summary
public record MonthSummaryDto(
    int Year,
    int Month,
    int BusinessDays,
    int WorkedDays,
    decimal TotalHours,
    decimal EstimatedValue,
    DateTime PaymentDate,
    List<WorkDayDto> WorkDays,
    List<MonthHolidayDto> Holidays
);

public record MonthHolidayDto(
    DateTime Date,
    string Name
);
