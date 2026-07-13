// Enums
export enum ShoppingListStatus {
  Planning = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3
}

export enum ItemPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Urgent = 3
}

export enum TransactionType {
  Income = 0,
  Expense = 1
}

export enum AccountType {
  Checking = 0,
  Savings = 1,
  CreditCard = 2,
  Investment = 3,
  Wallet = 4,
  Business = 5,
  Cash = 4 // Alias for Wallet
}

export enum GoalStatus {
  InProgress = 0,
  Completed = 1,
  Cancelled = 2
}

export enum PaymentStrategy {
  Snowball = 0,
  Avalanche = 1
}

export enum SubscriptionStatus {
  Active = 0,
  Paused = 1,
  Cancelled = 2
}

// Shopping Lists Types
export interface ShoppingListDto {
  id: string;
  name: string;
  description: string | null;
  targetDate: string | null;
  status: ShoppingListStatus;
  totalItems: number;
  purchasedItems: number;
  completionPercentage: number;
  totalEstimatedCost: number;
  totalSpent: number;
  remainingBudget: number;
  items: ShoppingItemDto[];
  createdAt: string;
}

export interface ShoppingItemDto {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  actualPrice: number | null;
  totalEstimated: number;
  totalActual: number;
  category: string | null;
  priority: ItemPriority;
  isPurchased: boolean;
  transactionId: string | null;
  purchasedDate: string | null;
}

export interface CreateShoppingListRequest {
  name: string;
  description?: string | null;
  targetDate?: string | null;
}

export interface UpdateShoppingListRequest {
  name: string;
  description?: string | null;
  targetDate?: string | null;
  status: ShoppingListStatus;
}

export interface CreateShoppingItemRequest {
  name: string;
  quantity: number;
  estimatedPrice: number;
  category?: string | null;
  priority: ItemPriority;
}

export interface UpdateShoppingItemRequest {
  name: string;
  quantity: number;
  estimatedPrice: number;
  actualPrice?: number | null;
  category?: string | null;
  priority: ItemPriority;
  isPurchased: boolean;
}

export interface MarkItemPurchasedRequest {
  createTransaction: boolean;
  actualPrice?: number | null;
  accountId?: string | null;
  categoryId?: string | null;
}

// MEI Types
export interface MeiSettingsDto {
  id: string;
  annualRevenueLimit: number;
  year: number;
  startMonth: number;
  mainCategoryId: string | null;
  alertThreshold1: number;
  alertThreshold2: number;
  alertThreshold3: number;
  proportionalLimit: number;
  monthlyAverageLimit: number;
}

export interface CreateMeiSettingsRequest {
  year: number;
  annualRevenueLimit?: number;
  startMonth?: number;
  mainCategoryId?: string | null;
  alertThreshold1?: number;
  alertThreshold2?: number;
  alertThreshold3?: number;
}

export interface MeiDashboardDto {
  year: number;
  annualRevenueLimit: number;
  proportionalLimit: number;
  currentRevenue: number;
  remainingRevenue: number;
  percentageUsed: number;
  monthlyAverageLimit: number;
  currentMonthRevenue: number;
  projectedAnnualRevenue: number;
  isAtRisk: boolean;
  alertMessage: string | null;
  monthlyBreakdown: MonthlyMeiRevenueDto[];
}

export interface MonthlyMeiRevenueDto {
  month: number;
  monthName: string;
  revenue: number;
  limit: number;
  percentageUsed: number;
  isOverLimit: boolean;
}

export interface MeiAlertDto {
  level: 'info' | 'warning' | 'danger' | 'critical';
  message: string;
  percentageUsed: number;
  remainingRevenue: number;
  recommendation: string;
}

// Notifications
export enum NotificationType {
  Info = 0,
  Warning = 1,
  Alert = 2,
  Success = 3
}

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

// Investment Enums
export enum InvestmentType {
  Stock = 0,
  ETF = 1,
  Fund = 2,
  Crypto = 3,
  FixedIncome = 4,
  Other = 5
}

export enum InvestmentTransactionType {
  Buy = 0,
  Sell = 1,
  Dividend = 2
}

// Accounts
export interface AccountDto {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  currency: string;
  isActive: boolean;
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  initialBalance: number;
  color?: string;
  currency?: string;
}

export interface UpdateAccountRequest {
  name: string;
  color?: string;
  isActive: boolean;
  currency?: string;
}

// Categories
export interface CategoryDto {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  icon?: string;
  color?: string;
}

// Transactions
export interface TransactionDto {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  description: string;
  type: TransactionType;
  date: string;
  isRecurring: boolean;
  tags?: string | null;
  accountName?: string;
  categoryName?: string;
  installmentCount?: number | null;
  currentInstallment?: number | null;
  parentTransactionId?: string | null;
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface CreateTransactionRequest {
  accountId: string;
  categoryId: string;
  amount: number;
  description: string;
  type: TransactionType;
  date: string;
  isRecurring?: boolean;
  tags?: string | null;
  installmentCount?: number | null;
}

export interface UpdateTransactionRequest {
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  isRecurring: boolean;
  tags?: string | null;
}

// Budgets
export interface BudgetDto {
  id: string;
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  month: number;
  year: number;
  shouldAlert: boolean;
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface BudgetConsolidatedDto {
  month: number;
  year: number;
  totalLimit: number;
  totalSpent: number;
  budgets: BudgetDto[];
}

export interface CreateBudgetRequest {
  categoryId: string;
  limit: number;
  month: number;
  year: number;
}

export interface UpdateBudgetRequest {
  limit: number;
}

// Subscriptions
export interface SubscriptionDto {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  billingDay: number;
  isActive: boolean;
  isPaidThisMonth: boolean;
  nextBillingDate: string;
  categoryName?: string;
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface CreateSubscriptionRequest {
  name: string;
  categoryId: string;
  accountId: string;
  amount: number;
  billingDay: number;
}

export interface UpdateSubscriptionRequest {
  name: string;
  amount: number;
  billingDay: number;
  status: SubscriptionStatus;
}

// Goals
export interface GoalDto {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentageAchieved: number;
  targetDate: string;
  status: GoalStatus;
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  targetDate: string;
}

export interface UpdateGoalRequest {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: GoalStatus;
}

export interface ContributeGoalRequest {
  amount: number;
}

// Debts
export interface DebtDto {
  id: string;
  name: string;
  totalAmount: number | null;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string | null;
  isPaidThisMonth: boolean;
  isSettled: boolean;
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface CreateDebtRequest {
  name: string;
  totalAmount?: number | null;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string | null;
}

export interface UpdateDebtRequest {
  name: string;
  totalAmount?: number | null;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string | null;
}

export interface DebtSimulationRequest {
  monthlyPayment: number;
  strategy: PaymentStrategy;
}

export interface DebtSimulationResult {
  totalMonths: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  monthlyPlan: DebtPaymentPlan[];
}

export interface DebtPaymentPlan {
  month: number;
  debtName: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

// Transaction Templates
export interface TransactionTemplateDto {
  id: string;
  name: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description: string | null;
  tags: string | null;
  accountName: string;
  categoryName: string;
}

export interface CreateTransactionTemplateRequest {
  name: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description?: string | null;
  tags?: string | null;
}

export interface UpdateTransactionTemplateRequest {
  name: string;
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description?: string | null;
  tags?: string | null;
}

// Currency
export interface CurrencyRateDto {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
}

export interface CurrencyConversionResult {
  fromCurrency: string;
  toCurrency: string;
  originalAmount: number;
  convertedAmount: number;
  rate: number;
}

// Investments
export interface InvestmentDto {
  id: string;
  name: string;
  type: InvestmentType;
  symbol: string | null;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  accountId: string | null;
  accountName: string | null;
  totalValue: number;
  totalGainLoss: number;
  gainLossPercentage: number;
}

export interface CreateInvestmentRequest {
  name: string;
  type: InvestmentType;
  symbol?: string | null;
  quantity?: number;
  averagePrice?: number;
  currentPrice?: number;
  currency?: string;
  accountId?: string | null;
}

export interface UpdateInvestmentRequest {
  name: string;
  type: InvestmentType;
  symbol?: string | null;
  currentPrice?: number;
  currency?: string;
  accountId?: string | null;
}

export interface InvestmentTransactionDto {
  id: string;
  investmentId: string;
  type: InvestmentTransactionType;
  quantity: number;
  price: number;
  date: string;
  fees: number;
}

export interface CreateInvestmentTransactionRequest {
  type: InvestmentTransactionType;
  quantity: number;
  price: number;
  date: string;
  fees?: number;
}

export interface InvestmentSummaryDto {
  totalInvested: number;
  totalCurrentValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  totalDividends: number;
  totalInvestments: number;
  allocation: InvestmentAllocationDto[];
}

export interface InvestmentAllocationDto {
  type: InvestmentType;
  value: number;
  percentage: number;
}

// Reports
export interface CategorySummaryDto {
  categoryId: string;
  categoryName: string;
  amount: number;
  transactionCount: number;
}

export interface TopExpenseDto {
  description: string;
  amount: number;
  categoryName: string;
  date: string;
}

export interface MonthlyReportDto {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  expensesByCategory: CategorySummaryDto[];
  incomeByCategory: CategorySummaryDto[];
  topExpenses: TopExpenseDto[];
}

export interface CashFlowPointDto {
  date: string;
  balance: number;
  label: string;
}

export interface CashFlowForecastDto {
  points: CashFlowPointDto[];
  projectedBalance: number;
  monthlyFixedExpenses: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
}

export interface PeriodComparisonDto {
  period1: MonthlyReportDto;
  period2: MonthlyReportDto;
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
  incomeChangePercentage: number;
  expenseChangePercentage: number;
}

export interface DuplicateTransactionGroupDto {
  description: string;
  amount: number;
  transactions: TransactionDto[];
}

// Alert Configurations
export enum AlertType {
  BudgetWarning = 'BudgetWarning',
  BillDue = 'BillDue',
  GoalNearTarget = 'GoalNearTarget',
  NegativeBalance = 'NegativeBalance',
  DebtDue = 'DebtDue',
  LastBusinessDay = 'LastBusinessDay',
}

export enum AlertChannel {
  InApp = 'InApp',
  Telegram = 'Telegram',
  Both = 'Both',
}

export interface AlertConfigurationDto {
  id: string;
  userId: string | null;
  type: AlertType;
  threshold: number | null;
  isActive: boolean;
  channel: AlertChannel;
  cronSchedule: string | null;
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface CreateAlertConfigurationRequest {
  type: AlertType;
  threshold?: number | null;
  channel?: AlertChannel;
  cronSchedule?: string | null;
}

export interface UpdateAlertConfigurationRequest {
  type: AlertType;
  threshold: number | null;
  isActive: boolean;
  channel: AlertChannel;
  cronSchedule: string | null;
}

// Classification Rules
export interface ClassificationRuleDto {
  id: string;
  keyword: string;
  categoryId: string;
  categoryName: string;
  priority: number;
  isLearned: boolean;
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface CreateClassificationRuleRequest {
  keyword: string;
  categoryId: string;
  priority?: number;
  isLearned?: boolean;
}

export interface UpdateClassificationRuleRequest {
  keyword: string;
  categoryId: string;
  priority: number;
}

export interface CategorySuggestionDto {
  categoryId: string | null;
  categoryName: string | null;
  matchedKeyword: string | null;
  confidence: number;
}

// Expense Splits
export interface ExpenseSplitDto {
  id: string;
  transactionId: string | null;
  totalAmount: number;
  description: string;
  items: ExpenseSplitItemDto[];
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface ExpenseSplitItemDto {
  id: string;
  userId: string | null;
  username: string;
  amount: number;
  isPaid: boolean;
  paidAt: string | null;
}

export interface CreateExpenseSplitRequest {
  transactionId?: string | null;
  totalAmount: number;
  description: string;
  items: CreateExpenseSplitItemRequest[];
}

export interface CreateExpenseSplitItemRequest {
  userId?: string | null;
  username: string;
  amount: number;
}

// Reminders
export interface ReminderDto {
  id: string;
  name: string;
  description: string | null;
  month: number;
  day: number;
  isRecurring: boolean;
  daysInAdvance: number;
  isActive: boolean;
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface CreateReminderRequest {
  name: string;
  description?: string | null;
  month: number;
  day: number;
  isRecurring?: boolean;
  daysInAdvance?: number;
}

export interface UpdateReminderRequest {
  name: string;
  description: string | null;
  month: number;
  day: number;
  isRecurring: boolean;
  daysInAdvance: number;
  isActive: boolean;
}

// Todos
export type TodoPriority = 0 | 1 | 2; // Low=0, Medium=1, High=2
export type TodoCategory = 0 | 1 | 2 | 3 | 4; // Job=0, Personal=1, Studies=2, Business=3, Other=4

export interface TodoCommentDto {
  id: string;
  text: string;
  createdAt: string;
  createdByUsername: string;
}

export interface TodoItemDto {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TodoPriority | null;
  category: TodoCategory | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
  comments: TodoCommentDto[];
}

export interface TodoStatsDto {
  pending: number;
  overdue: number;
  dueToday: number;
  dueSoon: number;
  completedThisWeek: number;
}

export interface CreateTodoRequest {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: TodoPriority | null;
  category?: TodoCategory | null;
}

export interface UpdateTodoRequest {
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TodoPriority | null;
  category: TodoCategory | null;
  isCompleted: boolean;
}

export interface AddTodoCommentRequest {
  text: string;
}

export interface RecurringIncomeDto {
  id: string;
  description: string;
  amount: number;
  isActive: boolean;
  createdByUsername: string | null;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface CreateRecurringIncomeRequest {
  description: string;
  amount: number;
}

export interface UpdateRecurringIncomeRequest {
  description: string;
  amount: number;
  isActive: boolean;
}

export interface MonthForecastDto {
  month: string;
  income: number;
  fixedExpenses: number;
  debtInstallments: number;
  total: number;
  surplus: number;
  accumulatedBalance: number;
  endingThisMonth: string[];
}

export interface BudgetForecastResultDto {
  monthlyIncome: number;
  recurringFixedTotal: number;
  months: MonthForecastDto[];
}

// Job Applications
export enum ApplicationStatus {
  Applied = 0,
  InProcess = 1,
  Interview = 2,
  TechnicalTest = 3,
  Offer = 4,
  Rejected = 5,
  NoResponse = 6
}

export enum ApplicationSource {
  LinkedInEasyApply = 0,
  LinkedInExternal = 1,
  Strider = 2,
  WeWorkRemotely = 3,
  WorkingNomads = 4,
  Jobgether = 5,
  CompanyWebsite = 6,
  Other = 7
}

export enum ApplicationFit {
  High = 0,
  Medium = 1,
  Low = 2
}

export interface JobApplicationDto {
  id: string;
  company: string | null;
  jobUrl: string | null;
  source: ApplicationSource;
  jobTitle: string | null;
  stack: string | null;
  salary: string | null;
  fit: ApplicationFit | null;
  status: ApplicationStatus;
  nextStep: string | null;
  nextStepDate: string | null;
  notes: string | null;
  appliedDate: string;
  createdByUsername: string;
  createdAt: string;
  updatedByUsername: string | null;
  updatedAt: string | null;
}

export interface CreateJobApplicationRequest {
  company?: string | null;
  jobUrl?: string | null;
  source: ApplicationSource;
  jobTitle?: string | null;
  stack?: string | null;
  salary?: string | null;
  fit?: ApplicationFit | null;
  nextStep?: string | null;
  nextStepDate?: string | null;
  notes?: string | null;
  appliedDate?: string | null;
}

export interface UpdateJobApplicationRequest {
  company?: string | null;
  jobUrl?: string | null;
  source: ApplicationSource;
  jobTitle?: string | null;
  stack?: string | null;
  salary?: string | null;
  fit?: ApplicationFit | null;
  status: ApplicationStatus;
  nextStep?: string | null;
  nextStepDate?: string | null;
  notes?: string | null;
  appliedDate: string;
}

export interface SourceConversionDto {
  source: ApplicationSource;
  total: number;
  gotResponse: number;
}

export interface JobApplicationStatsDto {
  total: number;
  appliedThisWeek: number;
  weeklyGoal: number;
  activeCount: number;
  inProcessCount: number;
  interviewCount: number;
  technicalTestCount: number;
  offerCount: number;
  rejectedCount: number;
  noResponseCount: number;
  conversionBySource: SourceConversionDto[];
}

export interface JobAnalysisResultDto {
  company: string | null;
  jobTitle: string | null;
  stack: string | null;
  salary: string | null;
  workModel: string | null;
  acceptsLatam: boolean | null;
  suggestedFit: 'High' | 'Medium' | 'Low';
  verdict: string;
  pros: string[];
  cons: string[];
}
