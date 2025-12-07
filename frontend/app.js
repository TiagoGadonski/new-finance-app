const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let currentUser = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        loadDashboard();
    } else {
        document.getElementById('loginContainer').style.display = 'flex';
    }

    setupEventListeners();
});

function setupEventListeners() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await login();
    });

    // Transaction Form
    document.getElementById('transactionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createTransaction();
    });

    // Budget Form
    document.getElementById('budgetForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createBudget();
    });

    // Subscription Form
    document.getElementById('subscriptionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createSubscription();
    });

    // Goal Form
    document.getElementById('goalForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createGoal();
    });

    // Debt Form
    document.getElementById('debtForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createDebt();
    });

    // Set default date
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('txDate').value = now.toISOString().slice(0, 16);
    document.getElementById('budgetMonth').value = now.getMonth() + 1;
    document.getElementById('budgetYear').value = now.getFullYear();
}

// Auth Functions
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            showError(error.error || 'Erro ao fazer login');
            return;
        }

        const data = await response.json();
        token = data.accessToken;
        localStorage.setItem('token', token);
        currentUser = data.user;

        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'block';

        loadDashboard();
    } catch (error) {
        showError('Erro de conexão com o servidor. Certifique-se que a API está rodando em http://localhost:5000');
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('dashboardContainer').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}

// API Helper
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            logout();
            throw new Error('Sessão expirada');
        }
        const error = await response.json();
        throw new Error(error.error || 'Erro na requisição');
    }

    return await response.json();
}

// Dashboard
async function loadDashboard() {
    document.getElementById('userName').textContent = currentUser?.name || 'Usuário';

    try {
        await Promise.all([
            loadAccounts(),
            loadCategories(),
            loadTransactions(),
            loadSummary()
        ]);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        alert('Erro ao carregar dados: ' + error.message);
    }
}

async function loadAccounts() {
    try {
        const accounts = await apiRequest('/accounts');

        const accountsList = document.getElementById('accountsList');
        const accountSelect = document.getElementById('txAccountId');

        if (accounts.length === 0) {
            accountsList.innerHTML = '<div class="empty-state">Nenhuma conta cadastrada</div>';
            return;
        }

        accountsList.innerHTML = accounts.map(account => `
            <div class="account-item">
                <div class="item-info">
                    <div class="item-title">${account.name}</div>
                    <div class="item-subtitle">${getAccountTypeName(account.type)}</div>
                </div>
                <div class="item-value">R$ ${account.balance.toFixed(2)}</div>
            </div>
        `).join('');

        accountSelect.innerHTML = accounts.map(a =>
            `<option value="${a.id}">${a.name} - R$ ${a.balance.toFixed(2)}</option>`
        ).join('');

        // Calculate total balance
        const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
        document.getElementById('totalBalance').textContent = `R$ ${totalBalance.toFixed(2)}`;
    } catch (error) {
        console.error('Erro ao carregar contas:', error);
    }
}

async function loadCategories() {
    try {
        const categories = await apiRequest('/categories');

        const selects = [
            document.getElementById('txCategoryId'),
            document.getElementById('budgetCategoryId'),
            document.getElementById('subCategoryId')
        ];

        selects.forEach(select => {
            select.innerHTML = categories.map(c =>
                `<option value="${c.id}">${c.icon || ''} ${c.name}</option>`
            ).join('');
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

async function loadTransactions() {
    try {
        const transactions = await apiRequest('/transactions');

        const recentList = document.getElementById('recentTransactions');
        const fullList = document.getElementById('transactionsList');

        if (transactions.length === 0) {
            const emptyMsg = '<div class="empty-state"><div class="empty-state-icon">📝</div>Nenhuma transação registrada</div>';
            recentList.innerHTML = emptyMsg;
            if (fullList) fullList.innerHTML = emptyMsg;
            return;
        }

        const sortedTx = transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        const recent = sortedTx.slice(0, 5);

        const renderTx = (tx) => `
            <div class="transaction-item">
                <div class="item-info">
                    <div class="item-title">${tx.description}</div>
                    <div class="item-subtitle">${tx.categoryName} • ${new Date(tx.date).toLocaleDateString('pt-BR')}</div>
                </div>
                <div class="item-value ${tx.type === 'Income' ? 'value-income' : 'value-expense'}">
                    ${tx.type === 'Income' ? '+' : '-'} R$ ${tx.amount.toFixed(2)}
                </div>
            </div>
        `;

        recentList.innerHTML = recent.map(renderTx).join('');
        if (fullList) fullList.innerHTML = sortedTx.map(renderTx).join('');
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
    }
}

async function loadSummary() {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const summary = await apiRequest(`/transactions/summary?month=${month}&year=${year}`);

        document.getElementById('monthIncome').textContent = `R$ ${summary.totalIncome.toFixed(2)}`;
        document.getElementById('monthExpense').textContent = `R$ ${summary.totalExpense.toFixed(2)}`;
        document.getElementById('monthBalance').textContent = `R$ ${summary.balance.toFixed(2)}`;
    } catch (error) {
        console.error('Erro ao carregar resumo:', error);
    }
}

async function createTransaction() {
    const data = {
        accountId: document.getElementById('txAccountId').value,
        categoryId: document.getElementById('txCategoryId').value,
        amount: parseFloat(document.getElementById('txAmount').value),
        type: document.getElementById('txType').value,
        description: document.getElementById('txDescription').value,
        date: document.getElementById('txDate').value,
        isRecurring: false
    };

    try {
        await apiRequest('/transactions', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        alert('Transação criada com sucesso!');
        document.getElementById('transactionForm').reset();
        loadAccounts();
        loadTransactions();
        loadSummary();
    } catch (error) {
        alert('Erro ao criar transação: ' + error.message);
    }
}

// Budgets
async function loadBudgets() {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const consolidated = await apiRequest(`/budgets/consolidated?month=${month}&year=${year}`);
        const budgetsList = document.getElementById('budgetsList');

        if (consolidated.budgets.length === 0) {
            budgetsList.innerHTML = '<div class="empty-state">Nenhum orçamento configurado para este mês</div>';
            return;
        }

        budgetsList.innerHTML = `
            <div style="margin-bottom: 20px;">
                <strong>Total Orçado:</strong> R$ ${consolidated.totalLimit.toFixed(2)}<br>
                <strong>Total Gasto:</strong> R$ ${consolidated.totalSpent.toFixed(2)}
            </div>
        ` + consolidated.budgets.map(budget => `
            <div class="budget-item">
                <div class="item-info">
                    <div class="item-title">${budget.categoryName}</div>
                    <div class="progress-bar">
                        <div class="progress-fill ${budget.percentageUsed >= 80 ? 'danger' : budget.percentageUsed >= 60 ? 'warning' : ''}"
                             style="width: ${Math.min(budget.percentageUsed, 100)}%">
                            ${budget.percentageUsed.toFixed(0)}%
                        </div>
                    </div>
                    <div class="item-subtitle">
                        R$ ${budget.spent.toFixed(2)} / R$ ${budget.limit.toFixed(2)}
                        ${budget.shouldAlert ? ' <span class="badge badge-danger">⚠️ Limite próximo!</span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
    }
}

async function createBudget() {
    const data = {
        categoryId: document.getElementById('budgetCategoryId').value,
        limit: parseFloat(document.getElementById('budgetLimit').value),
        month: parseInt(document.getElementById('budgetMonth').value),
        year: parseInt(document.getElementById('budgetYear').value)
    };

    try {
        await apiRequest('/budgets', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        alert('Orçamento criado com sucesso!');
        document.getElementById('budgetForm').reset();
        loadBudgets();
    } catch (error) {
        alert('Erro ao criar orçamento: ' + error.message);
    }
}

// Subscriptions
async function loadSubscriptions() {
    try {
        const subscriptions = await apiRequest('/subscriptions');
        const subsList = document.getElementById('subscriptionsList');

        if (subscriptions.length === 0) {
            subsList.innerHTML = '<div class="empty-state">Nenhuma assinatura cadastrada</div>';
            return;
        }

        subsList.innerHTML = subscriptions.map(sub => `
            <div class="subscription-item">
                <div class="item-info">
                    <div class="item-title">${sub.name}</div>
                    <div class="item-subtitle">
                        Cobrança dia ${sub.billingDay}
                        ${sub.isLowUsage ? '<span class="badge badge-warning">⚠️ Pouco usado</span>' : ''}
                        ${sub.status !== 'Active' ? `<span class="badge badge-info">${sub.status}</span>` : ''}
                    </div>
                </div>
                <div class="item-value">R$ ${sub.amount.toFixed(2)}/mês</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar assinaturas:', error);
    }
}

async function createSubscription() {
    const data = {
        name: document.getElementById('subName').value,
        categoryId: document.getElementById('subCategoryId').value,
        amount: parseFloat(document.getElementById('subAmount').value),
        billingDay: parseInt(document.getElementById('subBillingDay').value)
    };

    try {
        await apiRequest('/subscriptions', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        alert('Assinatura criada com sucesso!');
        document.getElementById('subscriptionForm').reset();
        loadSubscriptions();
    } catch (error) {
        alert('Erro ao criar assinatura: ' + error.message);
    }
}

// Goals
async function loadGoals() {
    try {
        const goals = await apiRequest('/goals');
        const goalsList = document.getElementById('goalsList');

        if (goals.length === 0) {
            goalsList.innerHTML = '<div class="empty-state">Nenhuma meta cadastrada</div>';
            return;
        }

        goalsList.innerHTML = goals.map(goal => `
            <div class="goal-item">
                <div class="item-info">
                    <div class="item-title">${goal.name}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.percentageAchieved}%">
                            ${goal.percentageAchieved.toFixed(0)}%
                        </div>
                    </div>
                    <div class="item-subtitle">
                        R$ ${goal.currentAmount.toFixed(2)} / R$ ${goal.targetAmount.toFixed(2)}
                        • Meta: ${new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                        ${goal.status === 'Achieved' ? '<span class="badge badge-success">✓ Alcançada!</span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar metas:', error);
    }
}

async function createGoal() {
    const data = {
        name: document.getElementById('goalName').value,
        targetAmount: parseFloat(document.getElementById('goalTarget').value),
        targetDate: document.getElementById('goalDate').value
    };

    try {
        await apiRequest('/goals', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        alert('Meta criada com sucesso!');
        document.getElementById('goalForm').reset();
        loadGoals();
    } catch (error) {
        alert('Erro ao criar meta: ' + error.message);
    }
}

// Debts
async function loadDebts() {
    try {
        const debts = await apiRequest('/debts');
        const debtsList = document.getElementById('debtsList');

        if (debts.length === 0) {
            debtsList.innerHTML = '<div class="empty-state">Nenhuma dívida cadastrada</div>';
            return;
        }

        debtsList.innerHTML = debts.map(debt => `
            <div class="debt-item">
                <div class="item-info">
                    <div class="item-title">${debt.name}</div>
                    <div class="item-subtitle">
                        Restante: R$ ${debt.remainingAmount.toFixed(2)} de R$ ${debt.totalAmount.toFixed(2)}
                        • Juros: ${debt.interestRate}% a.m.
                        • Mínimo: R$ ${debt.minimumPayment.toFixed(2)}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar dívidas:', error);
    }
}

async function createDebt() {
    const data = {
        name: document.getElementById('debtName').value,
        totalAmount: parseFloat(document.getElementById('debtTotal').value),
        remainingAmount: parseFloat(document.getElementById('debtRemaining').value),
        interestRate: parseFloat(document.getElementById('debtRate').value),
        minimumPayment: parseFloat(document.getElementById('debtMinPayment').value),
        dueDate: null
    };

    try {
        await apiRequest('/debts', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        alert('Dívida criada com sucesso!');
        document.getElementById('debtForm').reset();
        loadDebts();
    } catch (error) {
        alert('Erro ao criar dívida: ' + error.message);
    }
}

async function simulateDebtPayment() {
    const amount = parseFloat(document.getElementById('simAmount').value);
    const strategy = document.getElementById('simStrategy').value;

    if (!amount || amount <= 0) {
        alert('Digite um valor mensal válido');
        return;
    }

    try {
        const result = await apiRequest('/debts/simulate', {
            method: 'POST',
            body: JSON.stringify({
                monthlyPayment: amount,
                strategy: strategy
            })
        });

        const resultDiv = document.getElementById('simulationResult');
        resultDiv.innerHTML = `
            <div style="margin-top: 20px; padding: 20px; background: var(--light); border-radius: 8px;">
                <h4>Resultado da Simulação - ${strategy === 'Snowball' ? 'Bola de Neve' : 'Avalanche'}</h4>
                <p><strong>Total de Juros:</strong> R$ ${result.totalInterestPaid.toFixed(2)}</p>
                <p><strong>Meses para Quitar:</strong> ${result.monthsToPayoff}</p>
                <p><strong>Economia vs Mínimo:</strong> R$ ${result.monthlySavings.toFixed(2)}</p>

                <h5 style="margin-top: 15px;">Plano de Pagamento:</h5>
                ${result.paymentPlan.map((plan, i) => `
                    <div style="padding: 10px; border-bottom: 1px solid var(--border);">
                        <strong>${i + 1}º - ${plan.debtName}</strong><br>
                        Pagamento: R$ ${plan.monthlyPayment.toFixed(2)}/mês<br>
                        Quitação: ${plan.monthsToPayoff} meses<br>
                        Juros Total: R$ ${plan.totalInterest.toFixed(2)}
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        alert('Erro ao simular: ' + error.message);
    }
}

// Tab Navigation
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Load data for the tab
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'budgets':
            loadBudgets();
            break;
        case 'subscriptions':
            loadSubscriptions();
            break;
        case 'goals':
            loadGoals();
            break;
        case 'debts':
            loadDebts();
            break;
        case 'mei':
            loadMeiDashboard();
            break;
    }
}

// Helper functions
function getAccountTypeName(type) {
    const types = {
        'Checking': 'Conta Corrente',
        'Savings': 'Poupança',
        'CreditCard': 'Cartão de Crédito',
        'Investment': 'Investimentos',
        'Wallet': 'Carteira',
        'Business': 'Negócio/MEI'
    };
    return types[type] || type;
}

// ===== MEI FUNCTIONS =====

async function loadMeiDashboard() {
    try {
        const currentYear = document.getElementById('meiYear')?.value || new Date().getFullYear();
        const response = await fetch(`${API_URL}/mei/dashboard/${currentYear}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao carregar dashboard MEI');

        const data = await response.json();

        // Atualizar cards
        document.getElementById('meiCurrentRevenue').textContent = formatCurrency(data.currentRevenue);
        document.getElementById('meiLimit').textContent = formatCurrency(data.proportionalLimit);
        document.getElementById('meiRemaining').textContent = formatCurrency(data.remainingRevenue);
        document.getElementById('meiPercentage').textContent = data.percentageUsed.toFixed(1) + '%';

        // Atualizar barra de progresso
        const progressBar = document.getElementById('meiProgress');
        const percentage = Math.min(data.percentageUsed, 100);
        progressBar.style.width = percentage + '%';
        progressBar.textContent = percentage.toFixed(1) + '%';

        // Definir cor da barra baseado no percentual
        if (percentage >= 100) {
            progressBar.className = 'progress-fill danger';
        } else if (percentage >= 90) {
            progressBar.className = 'progress-fill danger';
        } else if (percentage >= 80) {
            progressBar.className = 'progress-fill warning';
        } else {
            progressBar.className = 'progress-fill';
        }

        // Mostrar alerta se houver
        const alertDiv = document.getElementById('meiAlert');
        if (data.alertMessage) {
            alertDiv.style.display = 'block';
            let alertClass = 'info-box';
            if (data.percentageUsed >= 100) alertClass = 'error';
            else if (data.percentageUsed >= 90) alertClass = 'error';
            else if (data.percentageUsed >= 80) alertClass = 'error';

            alertDiv.innerHTML = `<div class="${alertClass}" style="margin-bottom: 20px;">${data.alertMessage}</div>`;
        } else {
            alertDiv.style.display = 'none';
        }

        // Projeção
        const projectionText = document.getElementById('meiProjection');
        if (data.projectedAnnualRevenue > data.proportionalLimit) {
            const excess = data.projectedAnnualRevenue - data.proportionalLimit;
            projectionText.innerHTML = `<strong style="color: var(--danger);">Projeção:</strong> Com a média atual, você pode exceder o limite em <strong>R$ ${formatNumber(excess)}</strong>`;
        } else {
            projectionText.innerHTML = `<strong style="color: var(--success);">Projeção:</strong> Você está no caminho certo para ficar dentro do limite MEI`;
        }

        // Breakdown mensal
        const monthlyDiv = document.getElementById('meiMonthlyBreakdown');
        monthlyDiv.innerHTML = data.monthlyBreakdown.map(month => `
            <div class="transaction-item">
                <div class="item-info">
                    <div class="item-title">${month.monthName}</div>
                    <div class="item-subtitle">Limite: ${formatCurrency(month.limit)}</div>
                </div>
                <div>
                    <div class="item-value ${month.isOverLimit ? 'value-expense' : 'value-income'}">
                        ${formatCurrency(month.revenue)}
                    </div>
                    <div style="font-size: 12px; color: ${month.isOverLimit ? 'var(--danger)' : '#666'};">
                        ${month.percentageUsed.toFixed(0)}% ${month.isOverLimit ? '⚠️' : ''}
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erro ao carregar MEI:', error);
        alert('Erro ao carregar dados MEI');
    }
}

async function configureMei(event) {
    event.preventDefault();

    const year = parseInt(document.getElementById('meiYear').value);
    const limit = parseFloat(document.getElementById('meiLimitInput').value);
    const startMonth = parseInt(document.getElementById('meiStartMonth').value);
    const categorySelect = document.getElementById('meiCategory');
    const categoryId = categorySelect.value || null;

    try {
        const response = await fetch(`${API_URL}/mei/configure`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                year,
                annualRevenueLimit: limit,
                startMonth,
                mainCategoryId: categoryId,
                alertThreshold1: 70,
                alertThreshold2: 80,
                alertThreshold3: 90
            })
        });

        if (!response.ok) throw new Error('Erro ao configurar MEI');

        alert('Configuração MEI salva com sucesso!');
        await loadMeiDashboard();
    } catch (error) {
        console.error('Erro ao configurar MEI:', error);
        alert('Erro ao salvar configuração MEI');
    }
}

// Event Listeners para MEI
document.getElementById('meiConfigForm')?.addEventListener('submit', configureMei);
