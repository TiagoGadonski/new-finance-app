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

// Accounts
export interface AccountDto {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  isActive: boolean;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  initialBalance: number;
  color?: string;
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

// Subscriptions
export interface SubscriptionDto {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  billingDay: number;
  isActive: boolean;
  nextBillingDate: string;
  categoryName?: string;
}

export interface CreateSubscriptionRequest {
  name: string;
  categoryId: string;
  accountId: string;
  amount: number;
  billingDay: number;
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
}

export interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  targetDate: string;
}

export interface ContributeGoalRequest {
  amount: number;
}

// Debts
export interface DebtDto {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: string | null;
}

export interface CreateDebtRequest {
  name: string;
  totalAmount: number;
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
