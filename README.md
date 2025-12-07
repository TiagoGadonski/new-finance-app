# 💰 FinanceApp - Aplicativo Completo de Finanças Pessoais e MEI

Aplicação completa de gerenciamento financeiro pessoal e para MEI (Microempreendedor Individual), desenvolvida com **.NET 8** e **Clean Architecture**.

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Testes](#-testes)
- [Migrations](#-migrations)
- [Importação de CSV](#-importação-de-csv)
- [Próximos Passos](#-próximos-passos)
- [Licença](#-licença)

## ✨ Funcionalidades

### 🔐 Autenticação e Segurança
- **JWT Authentication** com access token e refresh token
- **Rotação automática de tokens** para maior segurança
- **Senhas criptografadas** com BCrypt
- **Rate Limiting** para proteção contra ataques
- **Policies** por recurso do usuário

### 💳 Gestão Financeira
- **Contas**: Múltiplas contas (corrente, poupança, cartão, investimentos, carteira, negócio)
- **Categorias**: Personalizáveis com ícones e cores
- **Transações**: Registro manual ou importação via CSV
- **Classificação Automática**: Machine learning simples que aprende com suas escolhas

### 📊 Orçamento Inteligente
- **Orçamento mensal** por categoria
- **Alertas automáticos** ao atingir 80% do limite
- **Visão consolidada** com status de cada categoria
- **Acompanhamento em tempo real** do saldo disponível

### 📱 Assinaturas
- **Gerenciamento** de todas suas assinaturas (Netflix, Spotify, etc.)
- **Alertas** 3 dias antes do vencimento
- **Análise de uso** com sugestão de cancelamento para assinaturas pouco utilizadas
- **Projeção** de gastos para os próximos 30 dias

### 🎯 Metas Financeiras
- **Definição de objetivos** com valor e prazo
- **Acompanhamento de progresso** em tempo real
- **Cálculo automático** de quanto falta para atingir a meta

### 💰 Gestão de Dívidas
- **Registro** de todas as dívidas com juros e parcelas
- **Simulação de quitação** com duas estratégias:
  - **Bola de Neve** (Snowball): Paga primeiro as menores dívidas
  - **Avalanche**: Paga primeiro as dívidas com maior juros
- **Comparativo** mostrando economia de cada estratégia

### 🪙 Microinvestimentos
- **Arredondamento automático** de transações
- **Multiplicador configurável** (1x, 2x, etc.)
- **Simulação mensal** para ver quanto você economizaria
- **Transferência automática** para conta de investimentos

### 📈 Ideal para MEI
- Categorias específicas para receitas de serviços
- Separação clara entre finanças pessoais e do negócio
- Relatórios mensais para facilitar declarações
- Contas separadas para melhor controle

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** com 4 camadas:

```
┌─────────────────────────────────────┐
│          API Layer                  │  Controllers, Middleware
├─────────────────────────────────────┤
│      Application Layer              │  CQRS, Handlers, DTOs, Validators
├─────────────────────────────────────┤
│       Domain Layer                  │  Entities, Interfaces, Business Rules
├─────────────────────────────────────┤
│    Infrastructure Layer             │  DbContext, Repositories, Services
└─────────────────────────────────────┘
```

### Padrões Implementados
- **CQRS** (Command Query Responsibility Segregation) com MediatR
- **Repository Pattern** para abstração de dados
- **Dependency Injection** em todas as camadas
- **Unit of Work** através do DbContext
- **Domain-Driven Design** com entidades ricas

## 🛠️ Tecnologias

### Backend
- **.NET 8** - Framework principal
- **ASP.NET Core** - Web API
- **Entity Framework Core** - ORM
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache distribuído
- **MediatR** - CQRS pattern
- **FluentValidation** - Validações
- **BCrypt.Net** - Criptografia de senhas
- **Serilog** - Logging estruturado

### DevOps
- **Docker** & **Docker Compose** - Containerização
- **GitHub Actions** - CI/CD
- **Entity Framework Migrations** - Versionamento de BD

### Testes
- **xUnit** - Framework de testes
- **Moq** - Mocking
- **FluentAssertions** - Assertions fluentes

## 📦 Pré-requisitos

### Para executar com Docker (Recomendado)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows, Mac, Linux)
- Git

### Para executar sem Docker
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL 16+](https://www.postgresql.org/download/)
- [Redis 7+](https://redis.io/download/)
- Git

## 🚀 Instalação e Execução

### Opção 1: Com Docker (Recomendado)

#### Windows (PowerShell)
```powershell
# Clone o repositório
git clone https://github.com/seu-usuario/financeapp.git
cd financeapp

# Execute com PowerShell script
.\scripts\setup.ps1 up

# Ou use docker-compose diretamente
docker-compose up -d
```

#### Linux/Mac (Makefile)
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/financeapp.git
cd financeapp

# Execute com Make
make up

# Ou use docker-compose diretamente
docker-compose up -d
```

Acesse:
- **API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Opção 2: Sem Docker

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/financeapp.git
cd financeapp

# Instale as dependências
dotnet restore

# Configure o banco de dados no appsettings.json
# ConnectionStrings:DefaultConnection = "Host=localhost;Port=5432;Database=financeapp;Username=seu_usuario;Password=sua_senha"

# Execute as migrations
dotnet ef database update --project src/FinanceApp.Infrastructure --startup-project src/FinanceApp.Api

# Execute a aplicação
dotnet run --project src/FinanceApp.Api
```

## 📁 Estrutura do Projeto

```
FinanceApp/
├── src/
│   ├── FinanceApp.Domain/              # Entidades e regras de negócio
│   │   ├── Entities/                   # User, Account, Transaction, etc.
│   │   ├── Enums/                      # TransactionType, AccountType, etc.
│   │   ├── Interfaces/                 # IRepository, IAuthService, etc.
│   │   └── Exceptions/                 # DomainException, NotFoundException, etc.
│   │
│   ├── FinanceApp.Application/         # Lógica de aplicação
│   │   ├── Common/DTOs/                # Data Transfer Objects
│   │   ├── Features/                   # CQRS Commands e Queries
│   │   │   ├── Auth/                   # SignUp, Login, Refresh
│   │   │   ├── Transactions/           # Create, Import, GetSummary
│   │   │   ├── Budgets/                # GetConsolidated
│   │   │   ├── Subscriptions/          # GetForecast
│   │   │   └── Debts/                  # Simulate
│   │   └── Services/                   # ClassificationService
│   │
│   ├── FinanceApp.Infrastructure/      # Implementações de infraestrutura
│   │   ├── Data/                       # DbContext, Migrations, Seeder
│   │   ├── Repositories/               # Repository implementations
│   │   └── Services/                   # AuthService
│   │
│   └── FinanceApp.Api/                 # Camada de apresentação
│       ├── Controllers/                # AuthController, TransactionsController, etc.
│       ├── Middleware/                 # ExceptionHandling
│       └── Program.cs                  # Configuração da aplicação
│
├── tests/
│   └── FinanceApp.Tests/               # Testes unitários
│       ├── Services/                   # ClassificationServiceTests
│       ├── Features/                   # Budget, Subscription, Debt tests
│       └── Infrastructure/             # AuthServiceTests
│
├── docker/
│   ├── Dockerfile                      # Imagem da API
│   └── docker-compose.yml              # Orquestração completa
│
├── scripts/
│   └── setup.ps1                       # Script de automação PowerShell
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml                   # Pipeline CI/CD
│
├── collections/
│   └── finance-app.http                # Coleção REST Client
│
└── README.md                           # Este arquivo
```

## 🌐 Endpoints da API

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/signup` | Criar nova conta |
| POST | `/api/auth/login` | Fazer login |
| POST | `/api/auth/refresh` | Renovar token |

### Usuário
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/user/me` | Obter dados do usuário |

### Contas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/accounts` | Criar conta |
| GET | `/api/accounts` | Listar contas |
| GET | `/api/accounts/{id}` | Obter conta |
| PUT | `/api/accounts/{id}` | Atualizar conta |
| DELETE | `/api/accounts/{id}` | Deletar conta |

### Categorias
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/categories` | Criar categoria |
| GET | `/api/categories` | Listar categorias |
| PUT | `/api/categories/{id}` | Atualizar categoria |
| DELETE | `/api/categories/{id}` | Deletar categoria |

### Transações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/transactions` | Criar transação |
| POST | `/api/transactions/import/csv` | Importar CSV |
| GET | `/api/transactions` | Listar transações |
| GET | `/api/transactions/{id}` | Obter transação |
| GET | `/api/transactions/summary` | Resumo mensal |
| PUT | `/api/transactions/{id}` | Atualizar transação |
| DELETE | `/api/transactions/{id}` | Deletar transação |

### Orçamento
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/budgets` | Criar orçamento |
| GET | `/api/budgets` | Listar orçamentos |
| GET | `/api/budgets/consolidated` | Visão consolidada |
| PUT | `/api/budgets/{id}` | Atualizar orçamento |
| DELETE | `/api/budgets/{id}` | Deletar orçamento |

### Assinaturas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/subscriptions` | Criar assinatura |
| POST | `/api/subscriptions/forecast` | Projeção 30 dias |
| GET | `/api/subscriptions` | Listar assinaturas |
| PUT | `/api/subscriptions/{id}` | Atualizar assinatura |
| DELETE | `/api/subscriptions/{id}` | Deletar assinatura |

### Metas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/goals` | Criar meta |
| GET | `/api/goals` | Listar metas |
| GET | `/api/goals/{id}` | Obter meta com progresso |
| PUT | `/api/goals/{id}` | Atualizar meta |
| DELETE | `/api/goals/{id}` | Deletar meta |

### Dívidas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/debts` | Criar dívida |
| POST | `/api/debts/simulate` | Simular quitação |
| GET | `/api/debts` | Listar dívidas |
| PUT | `/api/debts/{id}` | Atualizar dívida |
| DELETE | `/api/debts/{id}` | Deletar dívida |

### Microinvestimentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/roundups` | Criar regra de arredondamento |
| POST | `/api/roundups/simulate` | Simular arredondamento mensal |
| GET | `/api/roundups` | Listar regras |
| PUT | `/api/roundups/{id}` | Atualizar regra |
| DELETE | `/api/roundups/{id}` | Deletar regra |

## 🧪 Testes

### Executar todos os testes
```bash
# Com PowerShell
.\scripts\setup.ps1 test

# Com Make
make test

# Diretamente com dotnet
dotnet test tests/FinanceApp.Tests/FinanceApp.Tests.csproj --verbosity normal
```

### Cobertura de Testes
O projeto inclui **12+ testes unitários** cobrindo:

1. **Classificação Automática** (3 testes)
   - Sugestão de categoria com regra existente
   - Sugestão sem regra (retorna null)
   - Criação de regra aprendida

2. **Orçamento** (4 testes)
   - Cálculo de percentual usado
   - Alerta abaixo do threshold
   - Alerta acima do threshold
   - Alerta já enviado

3. **Assinaturas** (4 testes)
   - Detecção de baixo uso
   - Detecção de uso normal
   - Notificação dentro de 3 dias
   - Notificação fora do período

4. **Simulação de Dívidas** (3 testes)
   - Estratégia Snowball (menor saldo)
   - Estratégia Avalanche (maior juros)
   - Cenário sem dívidas

5. **Autenticação** (5 testes)
   - Hash de senha
   - Verificação de senha correta
   - Verificação de senha incorreta
   - Geração de JWT token
   - Geração de refresh token único

## 🗄️ Migrations

### Criar uma nova migration
```bash
dotnet ef migrations add NomeDaMigration --project src/FinanceApp.Infrastructure --startup-project src/FinanceApp.Api
```

### Aplicar migrations
```bash
# Com PowerShell
.\scripts\setup.ps1 migrate

# Com Make
make migrate

# Diretamente com dotnet
dotnet ef database update --project src/FinanceApp.Infrastructure --startup-project src/FinanceApp.Api
```

### Remover última migration
```bash
dotnet ef migrations remove --project src/FinanceApp.Infrastructure --startup-project src/FinanceApp.Api
```

### Seed de Dados
O projeto já vem com **dados padrão** que são inseridos automaticamente na primeira execução:

#### Usuário de Demonstração
- **Email**: `demo@financeapp.com`
- **Senha**: `Demo@123`

#### Categorias Padrão
**Despesas**:
- 🍔 Alimentação
- 🚗 Transporte
- 🏠 Moradia
- ⚕️ Saúde
- 📚 Educação
- 🎮 Lazer
- 📱 Assinaturas
- 💼 MEI/Negócios

**Receitas**:
- 💰 Salário
- 💻 Freelance
- 🏢 MEI/Serviços
- 📈 Investimentos
- 💵 Outros

#### Conta Padrão
- 💳 Carteira (Wallet)

## 📥 Importação de CSV

### Formato do CSV
```csv
Date,Description,Amount,Type
2024-12-01,Salário,5000.00,Income
2024-12-02,Supermercado Pão de Açúcar,250.50,Expense
2024-12-03,Uber para reunião,35.00,Expense
2024-12-04,Freelance Website,1500.00,Income
```

### Campos
- **Date**: Data no formato ISO (YYYY-MM-DD) ou brasileiro (DD/MM/YYYY)
- **Description**: Descrição da transação
- **Amount**: Valor (use ponto como separador decimal)
- **Type**: `Income` ou `Expense` (ou `Receita` / `Despesa`)

### Exemplo de Importação

```http
POST http://localhost:5000/api/transactions/import/csv
Authorization: Bearer seu-token-aqui
Content-Type: application/json

{
  "accountId": "guid-da-conta",
  "csvContent": "Date,Description,Amount,Type\n2024-12-01,Salário,5000.00,Income\n2024-12-02,Supermercado,250.50,Expense"
}
```

### Classificação Automática
Durante a importação, o sistema:
1. **Analisa** cada descrição
2. **Busca** regras de classificação existentes
3. **Sugere** categorias baseadas em palavras-chave
4. **Aprende** conforme você corrige as categorizações

## 🔮 Próximos Passos

### Integração com Open Finance
Planejamento para conectar com instituições financeiras:

#### 1. Camada de Integração
```
FinanceApp.OpenFinance/
├── Services/
│   ├── IOpenFinanceService.cs
│   ├── PluggyIntegration.cs       # Exemplo: Pluggy API
│   └── BelvoIntegration.cs        # Exemplo: Belvo API
├── DTOs/
│   ├── BankConnectionDto.cs
│   ├── ExternalTransactionDto.cs
│   └── ExternalAccountDto.cs
└── Mappers/
    ├── TransactionMapper.cs       # Mapeia transação externa -> interna
    └── CategoryMapper.cs          # Mapeia categoria externa -> interna
```

#### 2. Sincronização
- **Webhook** para receber notificações de novas transações
- **Sincronização agendada** (a cada X horas)
- **Reconciliação** de transações duplicadas

#### 3. Mapeamento de Categorias
```csharp
public class OpenFinanceCategoryMapper
{
    private readonly Dictionary<string, Guid> _categoryMapping = new()
    {
        { "food_and_drink", /* GUID da categoria Alimentação */ },
        { "transportation", /* GUID da categoria Transporte */ },
        // ... mais mapeamentos
    };

    public Guid MapCategory(string externalCategory)
    {
        return _categoryMapping.TryGetValue(externalCategory, out var categoryId)
            ? categoryId
            : _defaultCategoryId; // Categoria padrão
    }
}
```

#### 4. Sem Quebrar o Domínio Atual
- Criar **adapter pattern** para transformar dados externos
- Manter **classificação automática** como fallback
- Permitir **override manual** das categorias sugeridas
- **Histórico** de onde veio cada transação (manual vs open finance)

#### 5. Exemplo de Implementação
```csharp
public class OpenFinanceTransactionImporter
{
    private readonly IOpenFinanceService _openFinance;
    private readonly IClassificationService _classifier;
    private readonly IMediator _mediator;

    public async Task SyncTransactionsAsync(Guid userId, string bankConnectionId)
    {
        // 1. Buscar transações externas
        var externalTransactions = await _openFinance.GetTransactionsAsync(bankConnectionId);

        foreach (var ext in externalTransactions)
        {
            // 2. Verificar se já existe
            if (await TransactionExists(ext.Id)) continue;

            // 3. Mapear categoria
            var categoryId = MapOrSuggestCategory(ext.Category, ext.Description);

            // 4. Criar transação internamente
            var command = new CreateTransactionCommand(userId, new CreateTransactionRequest(
                AccountId: ext.AccountId,
                CategoryId: categoryId,
                Amount: ext.Amount,
                Type: ext.Type,
                Description: ext.Description,
                Date: ext.Date,
                Tags: $"open-finance,{ext.Source}"
            ));

            await _mediator.Send(command);
        }
    }
}
```

### Outras Melhorias Futuras
- Dashboard web com React/Vue
- App mobile com React Native
- Notificações push
- Exportação de relatórios em PDF
- Gráficos e visualizações avançadas
- Multi-tenancy para empresas
- Planejamento tributário para MEI

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para ajudar no controle financeiro pessoal e de MEI.

---

**Dúvidas ou sugestões?** Abra uma issue no GitHub!
