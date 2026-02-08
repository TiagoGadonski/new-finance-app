export interface WorkCalendarSettingsDto {
  id: string;
  hourlyRate: number;
  hoursPerDay: number;
}

export interface CreateOrUpdateSettingsRequest {
  hourlyRate: number;
  hoursPerDay: number;
}

export interface WorkDayDto {
  id: string;
  date: string;
  hoursWorked: number;
}

export interface ToggleWorkDayRequest {
  date: string;
}

export interface HolidayDto {
  id: string;
  name: string;
  month: number | null;
  day: number | null;
  isFixed: boolean;
  easterOffset: number | null;
}

export interface CreateHolidayRequest {
  name: string;
  month: number | null;
  day: number | null;
  isFixed: boolean;
  easterOffset: number | null;
}

export interface UpdateHolidayRequest {
  name: string;
  month: number | null;
  day: number | null;
  isFixed: boolean;
  easterOffset: number | null;
}

export interface MonthHolidayDto {
  date: string;
  name: string;
}

export interface MonthSummaryDto {
  year: number;
  month: number;
  businessDays: number;
  workedDays: number;
  totalHours: number;
  estimatedValue: number;
  paymentDate: string;
  workDays: WorkDayDto[];
  holidays: MonthHolidayDto[];
}
