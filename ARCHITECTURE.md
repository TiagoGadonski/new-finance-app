# 🏗️ Arquitetura - FinanceApp

Documentação detalhada da arquitetura do projeto.

## 📐 Visão Geral

O FinanceApp segue os princípios de **Clean Architecture** (Arquitetura Limpa), garantindo:

- ✅ **Separação de Responsabilidades**: Cada camada tem um propósito específico
- ✅ **Independência de Frameworks**: Lógica de negócio independente de tecnologia
- ✅ **Testabilidade**: Fácil de testar em todas as camadas
- ✅ **Manutenibilidade**: Código organizado e escalável

## 🎯 Camadas da Aplicação

```
┌───────────────────────────────────────────────────────┐
│                   Presentation                        │
│              FinanceApp.Api (Controllers)             │
│              - AuthController                         │
│              - TransactionsController                 │
│              - Middleware                             │
└───────────────────────────────────────────────────────┘
                         ↓ Depends on
┌───────────────────────────────────────────────────────┐
│                   Application                         │
│         FinanceApp.Application (Use Cases)            │
│         - Commands & Queries (CQRS)                   │
│         - Handlers (MediatR)                          │
│         - DTOs & Validators                           │
└───────────────────────────────────────────────────────┘
                         ↓ Depends on
┌───────────────────────────────────────────────────────┐
│                     Domain                            │
│         FinanceApp.Domain (Business Logic)            │
│         - Entities (User, Transaction, etc)           │
│         - Interfaces (IRepository, etc)               │
│         - Business Rules                              │
└───────────────────────────────────────────────────────┘
                         ↑ Implemented by
┌───────────────────────────────────────────────────────┐
│                 Infrastructure                        │
│     FinanceApp.Infrastructure (External)              │
│     - DbContext & Repositories                        │
│     - External Services (Auth, Cache)                 │
│     - Migrations                                      │
└───────────────────────────────────────────────────────┘
```

## 1️⃣ Domain Layer (Núcleo)

**Responsabilidade**: Regras de negócio puras, sem dependências externas.

### Estrutura
```
FinanceApp.Domain/
├── Entities/              # Entidades do domínio
│   ├── BaseEntity.cs     # Classe base com Id, CreatedAt, etc
│   ├── User.cs           # Usuário
│   ├── Account.cs        # Conta bancária
│   ├── Transaction.cs    # Transação financeira
│   ├── Budget.cs         # Orçamento
│   ├── Subscription.cs   # Assinatura
│   ├── Goal.cs           # Meta financeira
│   ├── Debt.cs           # Dívida
│   ├── RoundupRule.cs    # Regra de arredondamento
│   └── ClassificationRule.cs  # Regra de classificação
├── Enums/                # Enumerações
│   ├── TransactionType.cs     # Income/Expense
│   ├── AccountType.cs         # Checking, Savings, etc
│   ├── SubscriptionStatus.cs  # Active, Paused, Cancelled
│   ├── DebtPaymentStrategy.cs # Snowball, Avalanche
│   └── GoalStatus.cs          # Active, Achieved, Cancelled
├── Interfaces/           # Contratos (abstrações)
│   ├── IRepository.cs         # CRUD genérico
│   ├── IUserRepository.cs     # Específico de User
│   ├── IAuthService.cs        # Autenticação
│   └── IClassificationService.cs  # Classificação automática
├── Exceptions/           # Exceções de domínio
│   ├── DomainException.cs
│   ├── NotFoundException.cs
│   └── UnauthorizedException.cs
└── ValueObjects/         # (Futuro) Objetos de valor
```

### Princípios
- **Entidades Ricas**: Lógica de negócio nas entidades
  ```csharp
  public class Budget
  {
      public decimal PercentageUsed => Limit > 0 ? (Spent / Limit) * 100 : 0;
      public bool ShouldAlert => PercentageUsed >= 80 && !AlertSent;
  }
  ```

- **Sem Dependências**: Não depende de nenhuma outra camada
- **Imutabilidade**: Use `required` e `init` quando possível

## 2️⃣ Application Layer (Casos de Uso)

**Responsabilidade**: Orquestração de casos de uso, sem lógica de negócio complexa.

### Estrutura
```
FinanceApp.Application/
├── Common/
│   └── DTOs/             # Data Transfer Objects
│       ├── AuthDtos.cs
│       ├── TransactionDtos.cs
│       └── ...
├── Features/             # Organizados por feature (Vertical Slice)
│   ├── Auth/
│   │   └── Commands/
│   │       ├── SignUpCommand.cs
│   │       ├── LoginCommand.cs
│   │       └── RefreshTokenCommand.cs
│   ├── Transactions/
│   │   ├── Commands/
│   │   │   ├── CreateTransactionCommand.cs
│   │   │   └── ImportCsvCommand.cs
│   │   └── Queries/
│   │       └── GetTransactionSummaryQuery.cs
│   ├── Budgets/
│   │   └── Queries/
│   │       └── GetBudgetConsolidatedQuery.cs
│   ├── Subscriptions/
│   │   └── Queries/
│   │       └── GetSubscriptionForecastQuery.cs
│   └── Debts/
│       └── Commands/
│           └── SimulateDebtPaymentCommand.cs
├── Services/             # Application Services
│   └── ClassificationService.cs
└── DependencyInjection.cs
```

### CQRS Pattern

**Commands** (Escrita):
```csharp
public record CreateTransactionCommand(
    Guid UserId,
    CreateTransactionRequest Request
) : IRequest<TransactionDto>;

public class CreateTransactionCommandHandler
    : IRequestHandler<CreateTransactionCommand, TransactionDto>
{
    public async Task<TransactionDto> Handle(
        CreateTransactionCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Validar
        // 2. Criar entidade
        // 3. Salvar
        // 4. Retornar DTO
    }
}
```

**Queries** (Leitura):
```csharp
public record GetBudgetConsolidatedQuery(
    Guid UserId,
    int Month,
    int Year
) : IRequest<BudgetConsolidatedDto>;

public class GetBudgetConsolidatedQueryHandler
    : IRequestHandler<GetBudgetConsolidatedQuery, BudgetConsolidatedDto>
{
    public async Task<BudgetConsolidatedDto> Handle(
        GetBudgetConsolidatedQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Buscar dados
        // 2. Agregar
        // 3. Retornar DTO
    }
}
```

### Princípios
- **Um Handler por Use Case**: Cada operação tem seu handler
- **Imutáveis Records**: DTOs como records imutáveis
- **Validações**: FluentValidation (não implementado ainda, mas recomendado)

## 3️⃣ Infrastructure Layer (Detalhes Técnicos)

**Responsabilidade**: Implementações de infraestrutura, banco de dados, APIs externas.

### Estrutura
```
FinanceApp.Infrastructure/
├── Data/
│   ├── ApplicationDbContext.cs    # EF Core DbContext
│   └── DataSeeder.cs              # Seed de dados iniciais
├── Repositories/
│   ├── Repository.cs              # Implementação genérica
│   └── UserRepository.cs          # Específico de User
├── Services/
│   └── AuthService.cs             # JWT, BCrypt
├── Migrations/                     # EF Core Migrations
└── DependencyInjection.cs
```

### DbContext
```csharp
public class ApplicationDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    // ...

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configurações Fluent API
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(200);
        });
    }
}
```

### Repository Pattern
```csharp
public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public virtual async Task<T?> GetByIdAsync(Guid id)
        => await _dbSet.FindAsync(id);

    public virtual async Task<IEnumerable<T>> FindAsync(
        Expression<Func<T, bool>> predicate)
        => await _dbSet.Where(predicate).ToListAsync();
}
```

### Princípios
- **Dependency Inversion**: Implementa interfaces do Domain
- **Configuração Centralizada**: `DependencyInjection.cs`
- **Migrations**: Sempre criar migrations para mudanças no schema

## 4️⃣ API Layer (Apresentação)

**Responsabilidade**: Expor endpoints HTTP, validar entrada, serializar saída.

### Estrutura
```
FinanceApp.Api/
├── Controllers/
│   ├── BaseAuthenticatedController.cs  # Base com [Authorize]
│   ├── AuthController.cs
│   ├── TransactionsController.cs
│   ├── BudgetsController.cs
│   └── ...
├── Middleware/
│   └── ExceptionHandlingMiddleware.cs  # Tratamento global
├── Program.cs                          # Configuração
├── appsettings.json
└── appsettings.Development.json
```

### Controller Pattern
```csharp
[Route("api/[controller]")]
public class TransactionsController : BaseAuthenticatedController
{
    private readonly IMediator _mediator;

    [HttpPost]
    public async Task<ActionResult<TransactionDto>> Create(
        [FromBody] CreateTransactionRequest request)
    {
        var command = new CreateTransactionCommand(UserId, request);
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }
}
```

### Middleware Pipeline
```
Request
  ↓
ExceptionHandlingMiddleware  → Captura exceções globalmente
  ↓
Serilog Logging             → Loga todas requests
  ↓
HTTPS Redirection           → Force HTTPS
  ↓
CORS                        → Controle de origem
  ↓
Rate Limiting               → 100 req/min
  ↓
Authentication (JWT)        → Valida token
  ↓
Authorization               → Verifica policies
  ↓
Controller                  → Executa ação
  ↓
Response
```

## 🔄 Fluxo de uma Requisição

```
1. Cliente envia POST /api/transactions
   ↓
2. ExceptionHandlingMiddleware intercepta
   ↓
3. Rate Limiter verifica limite
   ↓
4. Authentication valida JWT token
   ↓
5. Authorization verifica se user pode acessar
   ↓
6. TransactionsController.Create() é chamado
   ↓
7. Cria CreateTransactionCommand
   ↓
8. MediatR encaminha para CreateTransactionCommandHandler
   ↓
9. Handler:
   - Busca Account e Category via Repository
   - Valida ownership (user é dono?)
   - Cria Transaction entity
   - Atualiza saldo da Account
   - Salva via Repository
   - Chama ClassificationService para aprender
   ↓
10. Handler retorna TransactionDto
    ↓
11. Controller retorna 201 Created com Location header
    ↓
12. Response é serializado para JSON
    ↓
13. Cliente recebe resposta
```

## 🎨 Padrões de Design

### 1. CQRS (Command Query Responsibility Segregation)
- **Commands**: Alteram estado (Create, Update, Delete)
- **Queries**: Apenas leem (Get, List, Summary)

### 2. Mediator Pattern
- **MediatR**: Desacopla controllers de handlers
- Controllers não conhecem handlers diretamente

### 3. Repository Pattern
- **Abstração**: Controllers não conhecem EF Core
- **Testabilidade**: Fácil mockar repositories

### 4. Dependency Injection
- **Constructor Injection**: Todas as dependências injetadas
- **Service Lifetime**:
  - Scoped: DbContext, Repositories
  - Singleton: IConfiguration
  - Transient: Validators (futuro)

### 5. Options Pattern
```csharp
services.Configure<JwtSettings>(
    configuration.GetSection("JwtSettings"));
```

## 🔐 Segurança

### 1. Autenticação JWT
```csharp
[Authorize]
public class BaseAuthenticatedController : ControllerBase
{
    protected Guid UserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
```

### 2. Rate Limiting
```csharp
services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
        partitionKey: context => context.User.Identity?.Name ?? "anonymous",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 100,
            Window = TimeSpan.FromMinutes(1)
        });
});
```

### 3. Resource Ownership
```csharp
// Sempre verifica se recurso pertence ao usuário
var account = await _repository.GetByIdAsync(id);
if (account == null || account.UserId != UserId)
    return NotFound();
```

## 📊 Persistência de Dados

### Entity Framework Core
- **Code First**: Entidades → Migrations → Banco
- **Lazy Loading**: Desabilitado (evita N+1)
- **Tracking**: Queries somente leitura podem usar `.AsNoTracking()`

### Migrations
```bash
# Criar migration
dotnet ef migrations add NomeDaMigration

# Aplicar
dotnet ef database update

# Reverter
dotnet ef database update PreviousMigration

# Gerar script SQL
dotnet ef migrations script
```

## 🧪 Testabilidade

### Testes Unitários
```csharp
// Mock de repository
var mockRepo = new Mock<IRepository<Debt>>();
mockRepo.Setup(r => r.FindAsync(It.IsAny<Expression<...>>()))
    .ReturnsAsync(debts);

// Handler usa o mock
var handler = new SimulateDebtPaymentCommandHandler(mockRepo.Object);

// Teste isolado
var result = await handler.Handle(command, CancellationToken.None);
result.Should().NotBeNull();
```

## 🚀 Melhorias Futuras

- [ ] **CQRS Avançado**: Separar leitura (read model) de escrita
- [ ] **Event Sourcing**: Histórico completo de mudanças
- [ ] **Domain Events**: Eventos de domínio para desacoplamento
- [ ] **Specification Pattern**: Queries complexas reutilizáveis
- [ ] **FluentValidation**: Validações declarativas
- [ ] **AutoMapper**: Mapeamento automático entidade → DTO
- [ ] **Unit of Work**: Transações distribuídas
- [ ] **Cache Strategy**: Redis para queries frequentes
- [ ] **Background Jobs**: Hangfire para tarefas agendadas

## 📚 Referências

- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)
- [DDD - Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [EF Core Best Practices](https://docs.microsoft.com/ef/core/performance/)
