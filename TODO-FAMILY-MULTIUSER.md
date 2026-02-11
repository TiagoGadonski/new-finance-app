# TODO: Implementação Sistema Familiar Multi-Usuário

## ✅ CONCLUÍDO (Sprint 1 - Parte 1)

### Domain Layer - Entidades
- ✅ **Family.cs** - Nova entidade criada (container de topo)
- ✅ **AuditableEntity.cs** - Nova base class com CreatedByUsername e UpdatedByUsername
- ✅ **User.cs** - Modificado (Username ao invés de Email, FamilyId adicionado)
- ✅ **Transaction.cs** - Herda AuditableEntity, UserId → FamilyId
- ✅ **Account.cs** - Herda AuditableEntity, UserId → FamilyId
- ✅ **Debt.cs** - Herda AuditableEntity, UserId → FamilyId
- ✅ **Goal.cs** - Herda AuditableEntity, UserId → FamilyId
- ✅ **Budget.cs** - Herda AuditableEntity, UserId → FamilyId
- ✅ **Subscription.cs** - Herda AuditableEntity, UserId → FamilyId
- ✅ **Category.cs** - Herda AuditableEntity, UserId → FamilyId (nullable)
- ✅ **ClassificationRule.cs** - Herda AuditableEntity, UserId → FamilyId
- ✅ **RoundupRule.cs** - Herda AuditableEntity, UserId → FamilyId
- ✅ **MeiSettings.cs** - Herda AuditableEntity, UserId → FamilyId
- ✅ **ShoppingList.cs** - Herda AuditableEntity, UserId → FamilyId
- ✅ **ShoppingItem.cs** - Não precisa mudanças (child entity)

---

## 🚧 PENDENTE - PRÓXIMOS PASSOS

### Sprint 1 - Parte 2: Infrastructure/Database

#### 1. ApplicationDbContext
**Arquivo**: `src/FinanceApp.Infrastructure/Data/ApplicationDbContext.cs`

**Mudanças necessárias**:
```csharp
// 1. Adicionar DbSet
public DbSet<Family> Families { get; set; }

// 2. OnModelCreating - Configurar Family
builder.Entity<Family>(entity =>
{
    entity.HasKey(e => e.Id);
    entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
    entity.Property(e => e.IsActive).HasDefaultValue(true);
});

// 3. Configurar User
builder.Entity<User>(entity =>
{
    // ADICIONAR: Unique index em Username (case-insensitive)
    entity.HasIndex(e => e.Username).IsUnique();
    entity.Property(e => e.Username)
        .IsRequired()
        .HasMaxLength(20)
        .HasConversion(v => v.ToLowerInvariant(), v => v); // Store lowercase

    // REMOVER: entity.HasIndex(e => e.Email).IsUnique();
    // REMOVER: entity.Property(e => e.Email)...

    // ADICIONAR: FK para Family
    entity.HasOne(e => e.Family)
        .WithMany(f => f.Users)
        .HasForeignKey(e => e.FamilyId)
        .OnDelete(DeleteBehavior.Restrict);
});

// 4. Atualizar TODAS as entidades financeiras para usar FamilyId
// Pattern para Transaction, Account, Debt, Goal, Budget, Subscription, etc:
builder.Entity<Transaction>(entity =>
{
    // MUDAR de User para Family
    entity.HasOne(e => e.Family)
        .WithMany(f => f.Transactions)
        .HasForeignKey(e => e.FamilyId)
        .OnDelete(DeleteBehavior.Cascade);

    // Configurar campos de audit
    entity.Property(e => e.CreatedByUsername).IsRequired().HasMaxLength(20);
    entity.Property(e => e.UpdatedByUsername).HasMaxLength(20);
});

// Repetir pattern para: Account, Budget, Subscription, Goal, Debt,
// ClassificationRule, RoundupRule, MeiSettings, ShoppingList

// 5. Category é especial (FamilyId nullable)
builder.Entity<Category>(entity =>
{
    entity.HasOne(e => e.Family)
        .WithMany(f => f.Categories)
        .HasForeignKey(e => e.FamilyId)
        .OnDelete(DeleteBehavior.Cascade)
        .IsRequired(false); // Nullable FK
});
```

#### 2. Migration - AddFamilyMultiUserSupport
**Arquivo**: Criar nova migration

**Comando**:
```bash
cd src/FinanceApp.Api
dotnet ef migrations add AddFamilyMultiUserSupport --project ../FinanceApp.Infrastructure
```

**Etapas críticas da migration**:
1. Criar tabela Families
2. Adicionar coluna FamilyId em Users (nullable temporariamente)
3. Auto-criar Family para cada User existente (SQL: `INSERT INTO Families... FROM Users`)
4. Popular FamilyId em Users baseado na Family criada
5. Adicionar coluna Username em Users (nullable temp)
6. Gerar username a partir de Email (SQL: `UPDATE Users SET Username = LOWER(SPLIT_PART(Email, '@', 1))`)
7. Tratar duplicatas de username (adicionar sufixo _1, _2, etc)
8. Tornar FamilyId e Username NOT NULL
9. Criar indexes (Username unique, FamilyId FK)
10. Para CADA entidade financeira (Transaction, Account, etc):
    - Adicionar coluna FamilyId (nullable temp)
    - Copiar FamilyId de Users: `UPDATE Transactions SET FamilyId = (SELECT FamilyId FROM Users WHERE Users.Id = Transactions.UserId)`
    - Tornar FamilyId NOT NULL
    - Adicionar colunas CreatedByUsername, UpdatedByUsername (default "system")
    - Dropar FK UserId
    - Dropar coluna UserId
    - Adicionar FK FamilyId
11. Remover coluna Email de Users
12. Dropar index de Email

**CRÍTICO**: Testar migration em cópia do banco antes!

---

### Sprint 2: Repositories & Services

#### 3. Interfaces

**NOVO**: `src/FinanceApp.Domain/Interfaces/IFamilyRepository.cs`
```csharp
public interface IFamilyRepository : IRepository<Family>
{
    Task<Family?> GetWithUsersAsync(Guid familyId);
    Task<IEnumerable<Family>> GetAllWithUsersAsync();
}
```

**MODIFICAR**: `src/FinanceApp.Domain/Interfaces/IUserRepository.cs`
```csharp
// Mudar método:
Task<User?> GetByUsernameAsync(string username); // Era GetByEmailAsync
Task<bool> UsernameExistsAsync(string username);  // NOVO
// Manter: GetByRefreshTokenAsync
```

#### 4. Implementações de Repositórios

**NOVO**: `src/FinanceApp.Infrastructure/Repositories/FamilyRepository.cs`
```csharp
public class FamilyRepository : Repository<Family>, IFamilyRepository
{
    public async Task<Family?> GetWithUsersAsync(Guid familyId)
    {
        return await _dbSet
            .Include(f => f.Users)
            .FirstOrDefaultAsync(f => f.Id == familyId);
    }

    public async Task<IEnumerable<Family>> GetAllWithUsersAsync()
    {
        return await _dbSet.Include(f => f.Users).ToListAsync();
    }
}
```

**MODIFICAR**: `src/FinanceApp.Infrastructure/Repositories/UserRepository.cs`
```csharp
public async Task<User?> GetByUsernameAsync(string username)
{
    return await _dbSet
        .Include(u => u.Family)
        .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
}

public async Task<bool> UsernameExistsAsync(string username)
{
    return await _dbSet.AnyAsync(u => u.Username.ToLower() == username.ToLower());
}
```

#### 5. CurrentUserService

**NOVO**: `src/FinanceApp.Application/Common/Interfaces/ICurrentUserService.cs`
```csharp
public interface ICurrentUserService
{
    Guid UserId { get; }
    Guid FamilyId { get; }
    string Username { get; }
    UserRole Role { get; }
    bool IsAdmin { get; }
}
```

**NOVO**: `src/FinanceApp.Infrastructure/Services/CurrentUserService.cs`
```csharp
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public Guid UserId => Guid.Parse(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    public Guid FamilyId => Guid.Parse(_httpContextAccessor.HttpContext?.User.FindFirstValue("FamilyId")!);
    public string Username => _httpContextAccessor.HttpContext?.User.FindFirstValue("Username") ?? "";
    public UserRole Role => Enum.Parse<UserRole>(_httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role)!);
    public bool IsAdmin => Role == UserRole.Admin;
}
```

#### 6. AuthService - JWT Claims

**MODIFICAR**: `src/FinanceApp.Infrastructure/Services/AuthService.cs`
```csharp
public string GenerateJwtToken(User user)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim("FamilyId", user.FamilyId.ToString()),  // NOVO
        new Claim("Username", user.Username),  // MUDOU: Email -> Username
        new Claim(ClaimTypes.Name, user.Name),
        new Claim(ClaimTypes.Role, user.Role.ToString())
    };
    // ... resto do código
}
```

#### 7. DataSeeder

**MODIFICAR**: `src/FinanceApp.Infrastructure/Data/DataSeeder.cs`
```csharp
public static async Task SeedAsync(ApplicationDbContext context)
{
    // 1. Criar Family padrão
    var defaultFamily = new Family
    {
        Id = Guid.NewGuid(),
        Name = "Demo Family",
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    };
    await context.Families.AddAsync(defaultFamily);

    // 2. Criar User com FamilyId e Username
    var defaultUser = new User
    {
        Id = Guid.NewGuid(),
        FamilyId = defaultFamily.Id,
        Name = "Demo User",
        Username = "demo",  // MUDOU
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo@123"),
        Role = UserRole.Admin,
        CreatedAt = DateTime.UtcNow
    };

    // 3. Categorias com FamilyId e CreatedByUsername
    var categories = new[]
    {
        new Category
        {
            FamilyId = defaultFamily.Id,  // MUDOU
            Name = "Alimentação",
            CreatedByUsername = "demo",  // NOVO
            // ...
        }
    };

    // 4. Conta com FamilyId e CreatedByUsername
    var account = new Account
    {
        FamilyId = defaultFamily.Id,  // MUDOU
        Name = "Carteira",
        CreatedByUsername = "demo",  // NOVO
        // ...
    };
}
```

#### 8. DependencyInjection

**MODIFICAR**: `src/FinanceApp.Infrastructure/DependencyInjection.cs`
```csharp
// Adicionar:
services.AddScoped<IFamilyRepository, FamilyRepository>();
services.AddScoped<ICurrentUserService, CurrentUserService>();
services.AddHttpContextAccessor(); // Necessário para CurrentUserService
```

---

### Sprint 3: Application Layer (DTOs & Commands)

#### 9. Auth DTOs

**MODIFICAR**: `src/FinanceApp.Application/Common/DTOs/AuthDtos.cs`
```csharp
public record SignUpRequest(
    string Name,
    string Username,  // MUDOU: Email -> Username
    string Password,
    Guid? FamilyId = null  // NOVO: Admin pode criar user em family existente
);

public record LoginRequest(
    string Username,  // MUDOU: Email -> Username
    string Password
);

public record UserDto(
    Guid Id,
    string Name,
    string Username,  // MUDOU: Email -> Username
    UserRole Role,
    Guid FamilyId,  // NOVO
    string FamilyName  // NOVO
);
```

#### 10. Transaction DTOs (e todos os outros)

**MODIFICAR**: `src/FinanceApp.Application/Common/DTOs/TransactionDtos.cs`
```csharp
public record TransactionDto(
    Guid Id,
    Guid AccountId,
    // ... campos existentes
    string CreatedByUsername,  // NOVO
    DateTime CreatedAt,  // NOVO (já existia em BaseEntity)
    string? UpdatedByUsername,  // NOVO
    DateTime? UpdatedAt  // NOVO (já existia em BaseEntity)
);
```

**Aplicar mesmo pattern em**: SubscriptionDtos, DebtDtos, GoalDtos, BudgetDtos, AccountDtos

#### 11. SignUpCommand

**MODIFICAR**: `src/FinanceApp.Application/Features/Auth/Commands/SignUpCommand.cs`
```csharp
public class SignUpCommandHandler : IRequestHandler<SignUpCommand, AuthResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IFamilyRepository _familyRepository;  // NOVO

    public async Task<AuthResponse> Handle(SignUpCommand request, ...)
    {
        // 1. Validar username format (3-20 chars, alphanumeric + _-)
        // 2. Verificar se username já existe (case-insensitive)
        // 3. Se FamilyId não fornecido, criar nova Family
        // 4. Se FamilyId fornecido, verificar se existe
        // 5. Criar User com Username e FamilyId
        // 6. Gerar JWT com novos claims (FamilyId, Username)
    }
}
```

#### 12. LoginCommand

**MODIFICAR**: `src/FinanceApp.Application/Features/Auth/Commands/LoginCommand.cs`
```csharp
public class LoginCommandHandler
{
    public async Task<AuthResponse> Handle(LoginCommand request, ...)
    {
        // Mudar: GetByEmailAsync -> GetByUsernameAsync
        var user = await _userRepository.GetByUsernameAsync(request.Username);
        // ... resto igual
    }
}
```

#### 13. CreateTransactionCommand (e todos os outros Commands)

**MODIFICAR**: `src/FinanceApp.Application/Features/Transactions/Commands/CreateTransactionCommand.cs`
```csharp
public class CreateTransactionCommandHandler
{
    private readonly ICurrentUserService _currentUserService;  // NOVO

    public async Task<TransactionDto> Handle(CreateTransactionCommand request, ...)
    {
        var familyId = _currentUserService.FamilyId;  // NOVO
        var username = _currentUserService.Username;  // NOVO

        // Validar que Account pertence à família
        if (account.FamilyId != familyId) throw new NotFoundException();

        var transaction = new Transaction
        {
            FamilyId = familyId,  // MUDOU: UserId -> FamilyId
            CreatedByUsername = username,  // NOVO
            // ... outros campos
        };

        // Retornar DTO com campos de audit
    }
}
```

**Repetir pattern em**: Todos os Create/Update Commands de todas as entidades

#### 14. Query Handlers

**MODIFICAR**: Todos os GetAll/List queries para:
1. Filtrar por FamilyId ao invés de UserId
2. Adicionar parâmetro opcional `createdBy` para filtro
3. Retornar campos de audit nos DTOs

---

### Sprint 4: API Layer (Controllers)

#### 15. BaseAuthenticatedController

**MODIFICAR**: `src/FinanceApp.Api/Controllers/BaseAuthenticatedController.cs`
```csharp
[Authorize]
public abstract class BaseAuthenticatedController : ControllerBase
{
    protected Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    protected Guid FamilyId => Guid.Parse(User.FindFirstValue("FamilyId")!);  // NOVO
    protected string Username => User.FindFirstValue("Username") ?? "";  // NOVO
    protected bool IsAdmin => User.IsInRole("Admin");  // NOVO
}
```

#### 16. AuthController

**MODIFICAR**: `src/FinanceApp.Api/Controllers/AuthController.cs`
```csharp
[HttpPost("signup")]
public async Task<ActionResult<AuthResponse>> SignUp([FromBody] SignUpRequest request)
{
    // Request agora tem Username ao invés de Email
}

[HttpPost("login")]
public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
{
    // Request agora tem Username ao invés de Email
}
```

#### 17. TransactionsController (e todos os outros)

**MODIFICAR**: `src/FinanceApp.Api/Controllers/TransactionsController.cs`
```csharp
[HttpGet]
public async Task<ActionResult<IEnumerable<TransactionDto>>> GetAll(
    [FromQuery] string? createdBy = null  // NOVO: filtro por criador
)
{
    // Filtrar por FamilyId ao invés de UserId
    var query = _repository.FindAsync(t => t.FamilyId == FamilyId);

    // Aplicar filtro de criador se fornecido
    if (!string.IsNullOrEmpty(createdBy))
        query = query.Where(t => t.CreatedByUsername == createdBy);

    // Retornar DTOs com campos de audit
}

[HttpDelete("{id}")]
public async Task<ActionResult> Delete(Guid id)
{
    var transaction = await _repository.GetByIdAsync(id);

    // Security: validar FamilyId (exceto admin)
    if (transaction.FamilyId != FamilyId && !IsAdmin)
        return Forbid();

    // ... resto
}
```

**Repetir pattern em**: AccountsController, DebtsController, GoalsController, BudgetsController, SubscriptionsController

#### 18. AdminController

**NOVO**: `src/FinanceApp.Api/Controllers/AdminController.cs`
```csharp
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : BaseAuthenticatedController
{
    [HttpGet("families")]
    public async Task<ActionResult<IEnumerable<FamilyDto>>> GetAllFamilies() { }

    [HttpPost("users")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest request) { }

    [HttpPost("users/{id}/reset-password")]
    public async Task<ActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request) { }

    [HttpGet("families/{familyId}/transactions")]
    public async Task<ActionResult> GetFamilyTransactions(Guid familyId) { }
}
```

---

### Sprint 5: Frontend

#### 19. Types

**MODIFICAR**: `frontend-nextjs/src/types/auth.ts`
```typescript
interface LoginRequest {
  username: string;  // MUDOU: email -> username
  password: string;
}

interface UserDto {
  id: string;
  name: string;
  username: string;  // MUDOU: email -> username
  role: 'User' | 'Admin';
  familyId: string;  // NOVO
  familyName: string;  // NOVO
}
```

**MODIFICAR**: `frontend-nextjs/src/types/index.ts`
```typescript
interface TransactionDto {
  // ... campos existentes
  createdByUsername: string;  // NOVO
  createdAt: string;  // NOVO
  updatedByUsername: string | null;  // NOVO
  updatedAt: string | null;  // NOVO
}
```

#### 20. Login Page

**MODIFICAR**: `frontend-nextjs/src/app/login/page.tsx`
```typescript
// Mudar:
- Label: "Email" -> "Username"
- Type: type="email" -> type="text"
- Placeholder: "Enter your username (e.g., @pai)"
- Validation: regex /^[a-zA-Z0-9_-]+$/, minLength 3, maxLength 20
- Default value: username: 'demo'
```

#### 21. Transaction List

**MODIFICAR**: `frontend-nextjs/src/app/transactions/page.tsx`
```typescript
// Adicionar:
1. Coluna "Created By" mostrando @{transaction.createdByUsername}
2. Filtro dropdown para selecionar criador
3. Query com filtro: queryKey: ['transactions', createdByFilter]
4. API call: transactionsApi.getAll(createdByFilter)
```

#### 22. TransactionDetail Component

**NOVO**: `frontend-nextjs/src/components/transactions/TransactionDetail.tsx`
```typescript
// Mostrar:
- Created by: @{transaction.createdByUsername} on {date}
- Last edited by: @{transaction.updatedByUsername} on {date}
```

#### 23. Navbar

**MODIFICAR**: `frontend-nextjs/src/components/layout/Navbar.tsx`
```typescript
// Adicionar:
<div>
  <p>@{user.username}</p>
  <p className="text-xs">{user.familyName}</p>
</div>
{user.role === 'Admin' && <span>Admin</span>}
```

#### 24. Admin Panel

**NOVO**: `frontend-nextjs/src/app/admin/page.tsx`
- Lista de famílias
- Lista de usuários por família
- Criar usuário
- Resetar senha
- Ver dados de qualquer família

**NOVO**: `frontend-nextjs/src/lib/api/adminApi.ts`
```typescript
export const adminApi = {
  getAllFamilies: () => client.get('/Admin/families'),
  createUser: (data) => client.post('/Admin/users', data),
  resetPassword: (userId, password) => client.post(`/Admin/users/${userId}/reset-password`),
};
```

#### 25. Aplicar Pattern a Outras Páginas

**MODIFICAR**: Adicionar coluna "Created By" + filtro em:
- `frontend-nextjs/src/app/debts/page.tsx`
- `frontend-nextjs/src/app/subscriptions/page.tsx`
- `frontend-nextjs/src/app/goals/page.tsx`
- `frontend-nextjs/src/app/budgets/page.tsx`

---

## 📋 CHECKLIST DE SEGURANÇA

Ao implementar, garantir:

- [ ] Sempre filtrar queries por FamilyId (exceto admin)
- [ ] Validar FamilyId do JWT, nunca do request body
- [ ] Username único enforced no banco (unique index case-insensitive)
- [ ] Audit trail usa strings (não FK) para persistir após delete
- [ ] Admin role checked antes de cross-family access
- [ ] Cascade delete configurado: Family → cascade, User → restrict
- [ ] Validação de username no backend (regex, tamanho, duplicatas)
- [ ] Testar migration em CÓPIA do banco antes de produção!

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. ✅ Entidades Domain (FEITO)
2. ✅ ApplicationDbContext + Migration (FEITO)
3. ✅ Repositories + Services (FEITO - FamilyRepository, UserRepository, CurrentUserService, AuthService)
4. ✅ DTOs + Commands (FEITO - audit fields adicionados a todos os DTOs)
5. ✅ Controllers (FEITO - todos usam FamilyId, Username, audit fields)
6. ✅ Frontend types + pages (FEITO - types, Navbar @username/familyName, admin panel)

---

## 📝 NOTAS IMPORTANTES

- **Migration**: É a parte mais crítica. Testar MUITO antes de rodar em produção!
- **Backward Compatibility**: Migration preserva dados, mas muda estrutura completamente
- **Rollback**: Se der erro, usar `Down()` da migration + git revert
- **Plano completo**: Referência em `C:\Users\cwbcordeti\.claude\plans\cuddly-mixing-pancake.md`
