namespace FinanceApp.Application.Common.DTOs;

public record MonthlyReportDto(
    int Month,
    int Year,
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal Balance,
    decimal SavingsRate,
    List<CategorySummaryDto> ExpensesByCategory,
    List<CategorySummaryDto> IncomeByCategory,
    List<TopExpenseDto> TopExpenses
);

public record TopExpenseDto(
    string Description,
    decimal Amount,
    string CategoryName,
    DateTime Date
);

public record CashFlowForecastDto(
    List<CashFlowPointDto> Points,
    decimal ProjectedBalance,
    decimal MonthlyFixedExpenses,
    decimal AverageMonthlyIncome,
    decimal AverageMonthlyExpenses
);

public record CashFlowPointDto(
    DateTime Date,
    decimal Balance,
    string Label
);

public record PeriodComparisonDto(
    MonthlyReportDto Period1,
    MonthlyReportDto Period2,
    decimal IncomeChange,
    decimal ExpenseChange,
    decimal BalanceChange,
    decimal IncomeChangePercentage,
    decimal ExpenseChangePercentage
);

public record DuplicateTransactionGroupDto(
    string Description,
    decimal Amount,
    List<TransactionDto> Transactions
);
