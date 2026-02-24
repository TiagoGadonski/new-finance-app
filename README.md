# Orbit

Sistema completo de gestao financeira pessoal, produtividade e automacao, com backend em **.NET 8**, frontend em **Next.js** e integracao com **Telegram Bot**.

## Visao Geral

Orbit e uma plataforma pessoal que unifica financas, planejamento de trabalho, tarefas e alertas inteligentes em uma unica aplicacao. O sistema roda em containers Docker e oferece notificacoes proativas via Telegram.

### Principais Modulos

| Modulo | Descricao |
|--------|-----------|
| **Financas** | Contas, transacoes, categorias, orcamentos, assinaturas, dividas, metas |
| **Investimentos** | Portfolio com tracking de acoes/FIIs/crypto, grafico de alocacao |
| **Trabalho PJ** | Calendario de dias uteis, feriados, calculo de impostos MEI |
| **Alertas Proativos** | Monitoramento automatico de orcamento, vencimentos, ultimo dia util |
| **Lembretes** | Aniversarios, datas importantes com notificacao antecipada |
| **Tarefas** | To-do list com integracao Telegram (criar/listar/completar via bot) |
| **Relatorios** | Relatorio mensal, fluxo de caixa, comparacao de periodos |
| **Multi-usuario** | Sistema de familias com roles (admin/user) e audit trail |

## Stack Tecnica

### Backend (.NET 8 - Clean Architecture)
- **ASP.NET Core** Web API
- **Entity Framework Core** com PostgreSQL
- **Redis** para cache
- **MediatR** para CQRS pattern
- **JWT** com refresh tokens
- **BackgroundService** para avaliacao periodica de alertas
- **Serilog** para logging estruturado

### Frontend (Next.js 15)
- **TypeScript**
- **TanStack Query** para data fetching e cache
- **Tailwind CSS** com dark mode
- **Recharts** para graficos
- **Lucide Icons**

### Infraestrutura
- **Docker** & **Docker Compose** (4 containers)
- **PostgreSQL 16** (banco de dados)
- **Redis 7** (cache)
- **Telegram Bot API** (notificacoes proativas)

### Integracao
- **StarBot** (Telegram Bot separado) - permite interagir com o Orbit via mensagens no Telegram
  - Autenticacao multi-usuario: cada usuario ve apenas os dados da sua propria familia
  - 15 ferramentas de IA: transacoes, contas, categorias, metas, dividas, orcamentos, tarefas, lembretes
  - Veja [GUIA_BOT.md](GUIA_BOT.md) para o guia completo de uso

## Arquitetura

```
Orbit/
├── src/
│   ├── Orbit.Domain/           # Entidades, enums, interfaces
│   │   ├── Entities/ (29)      # Account, Transaction, Budget, Investment, TodoItem, etc.
│   │   ├── Enums/ (13)         # AccountType, TransactionType, AlertType, etc.
│   │   └── Interfaces/         # IRepository<T>, ITelegramService
│   │
│   ├── Orbit.Application/      # DTOs, CQRS handlers, services
│   │   ├── Common/DTOs/        # Records para request/response
│   │   ├── Features/           # Commands e queries (MediatR)
│   │   └── Services/           # ClassificationService
│   │
│   ├── Orbit.Infrastructure/   # Implementacoes de infraestrutura
│   │   ├── Data/               # DbContext, migrations, seeder
│   │   ├── Repositories/       # Repository pattern generico
│   │   └── Services/           # AuthService, TelegramService, AlertEvaluationService
│   │
│   └── Orbit.Api/              # Camada de apresentacao
│       ├── Controllers/ (25)   # REST endpoints
│       ├── Middleware/          # Exception handling
│       └── Program.cs          # Configuracao e DI
│
├── frontend-nextjs/
│   └── src/
│       ├── app/ (20 paginas)   # Next.js App Router pages
│       ├── components/         # UI components, modals, charts
│       ├── lib/api/ (18)       # Modulos de API client
│       └── types/              # TypeScript interfaces
│
├── tests/
│   └── Orbit.Tests/            # xUnit + Moq + FluentAssertions
│
├── docker-compose.yml          # Orquestracao (postgres, redis, api, frontend)
└── Dockerfile                  # Multi-stage build da API
```

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows, Mac ou Linux)
- Git

## Instalacao

```bash
# Clone o repositorio
git clone <repo-url>
cd Orbit

# Suba todos os servicos
docker compose up -d --build
```

Acesse:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000
- **Swagger**: http://localhost:5000/swagger

### Variaveis de Ambiente (opcionais)

Crie um arquivo `.env` na raiz para customizar:

```env
# Banco de dados
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=orbit

# Seguranca
JWT_SECRET_KEY=sua-chave-secreta-com-pelo-menos-32-caracteres
SEED_ADMIN_PASSWORD=Admin@123456

# Telegram (para alertas proativos do backend)
TELEGRAM_BOT_TOKEN=seu-bot-token
TELEGRAM_CHAT_ID=seu-chat-id

# Intervalo de avaliacao de alertas (horas)
ALERT_EVAL_INTERVAL=6

# StarBot - segredo compartilhado para autenticacao multi-usuario via Telegram
# Deve ser o mesmo valor definido em FINANCE_BOT_SECRET no .env do StarBot
BOT_SECRET=segredo-aleatorio-com-pelo-menos-32-caracteres
```

## Funcionalidades Detalhadas

### Gestao Financeira
- **Contas**: Corrente, poupanca, cartao, investimentos, carteira, negocios - com suporte multi-moeda
- **Transacoes**: Registro manual, importacao CSV, templates reutilizaveis, deteccao de duplicatas
- **Categorias**: Personalizaveis com icones/cores, classificacao automatica por regras aprendidas
- **Orcamentos**: Limites mensais por categoria com acompanhamento em tempo real
- **Assinaturas**: Gerenciamento com alertas de vencimento e projecao de gastos
- **Metas**: Definicao de objetivos com tracking de progresso
- **Dividas**: Registro com simulacao de quitacao (estrategias Snowball e Avalanche)

### Investimentos
- Portfolio com acoes, FIIs, cripto, renda fixa, ETFs
- Registro de compras/vendas com preco medio
- Grafico de alocacao por tipo de ativo
- Resumo com total investido, valor atual e rentabilidade

### Trabalho PJ / MEI
- Calendario de dias trabalhados com feriados nacionais e municipais
- Calculo automatico de Pascoa e feriados moveis
- Estimativa de DAS (imposto MEI) com tracking do limite anual
- Configuracao de hora/dia de trabalho

### Sistema de Alertas Proativos
O `AlertEvaluationService` roda em background a cada 6h e avalia:

| Alerta | Condicao |
|--------|----------|
| Orcamento estourando | >= 80% do limite da categoria |
| Conta a vencer | Assinatura vence em 3 dias |
| Divida vencendo | Divida com vencimento em 3 dias |
| Saldo negativo | Conta com saldo < 0 |
| Meta quase atingida | >= 90% do objetivo |
| Ultimo dia util | Hoje e o ultimo dia util do mes |

Entrega: notificacao in-app e/ou Telegram (configuravel por alerta).

### Lembretes
- Aniversarios, datas comemorativas, eventos recorrentes
- Notificacao X dias antes (configuravel)
- CRUD completo na pagina /alerts (tab Lembretes)

### Tarefas (To-Do)
- Criar, listar, completar, deletar tarefas
- Filtro por pendentes/concluidas
- Integracao com Telegram Bot (via StarBot):
  - "Anota pra mim: comprar leite" → cria tarefa no Orbit
  - "Quais minhas tarefas?" → lista tarefas pendentes
  - "Conclui a tarefa X" → marca como feita

### Multi-usuario
- Sistema de familias: um admin convida membros
- Todos os dados sao scoped por familia
- Audit trail: quem criou/atualizou cada registro
- Painel administrativo para gestao de usuarios
- Cada usuario pode registrar seu **ID do Telegram** nas configuracoes de perfil
- Autenticacao automatica no StarBot: basta ter o ID salvo (sem precisar de senha)
- Admin pode criar usuarios em qualquer familia existente ou criar uma familia nova

### Outras Funcionalidades
- **Dark mode** completo
- **Listas de compras** colaborativas
- **Split de despesas** entre membros da familia
- **Conversao de moeda** com taxas atualizadas
- **Microinvestimentos** (arredondamento automatico)
- **Notificacoes in-app** com badge no navbar

## Endpoints da API

A API possui **25 controllers** com os seguintes grupos:

| Grupo | Prefixo | Operacoes |
|-------|---------|-----------|
| Auth | `/api/auth` | login, signup, refresh, **telegram** (auth via ID do Telegram) |
| User | `/api/user` | profile |
| Admin | `/api/admin/users` | list, create, update, delete users |
| Accounts | `/api/accounts` | CRUD |
| Categories | `/api/categories` | CRUD |
| Transactions | `/api/transactions` | CRUD, import CSV, summary, duplicates |
| Templates | `/api/transaction-templates` | CRUD, apply |
| Budgets | `/api/budgets` | CRUD, consolidated view |
| Subscriptions | `/api/subscriptions` | CRUD, forecast, generate transactions |
| Goals | `/api/goals` | CRUD, contribute |
| Debts | `/api/debts` | CRUD, simulate |
| Investments | `/api/investments` | CRUD, transactions, summary |
| Notifications | `/api/notifications` | list, mark-read, unread-count |
| Alerts | `/api/alert-configurations` | CRUD |
| Reminders | `/api/reminders` | CRUD, toggle |
| Todos | `/api/todos` | CRUD, toggle |
| Reports | `/api/reports` | monthly, cashflow, comparison |
| Currency | `/api/currency` | rates, convert, refresh |
| Work Calendar | `/api/work-calendar` | settings, workdays, holidays CRUD |
| MEI | `/api/mei` | settings, DAS calculation |
| Shopping Lists | `/api/shopping-lists` | CRUD, items, toggle |
| Splits | `/api/expense-splits` | CRUD, items |
| Roundups | `/api/roundups` | CRUD, simulate |
| Classification | `/api/classification-rules` | CRUD |

Documentacao interativa disponivel em `/swagger`.

## Desenvolvimento Local (sem Docker)

```bash
# Requisitos: .NET 8 SDK, Node.js 18+, PostgreSQL, Redis

# Backend
dotnet restore
dotnet ef database update --project src/Orbit.Infrastructure --startup-project src/Orbit.Api
dotnet run --project src/Orbit.Api

# Frontend
cd frontend-nextjs
npm install
npm run dev
```

## Migrations

```bash
# Criar nova migration
dotnet ef migrations add NomeDaMigration \
  --project src/Orbit.Infrastructure \
  --startup-project src/Orbit.Api

# Aplicar (automatico no startup)
dotnet ef database update \
  --project src/Orbit.Infrastructure \
  --startup-project src/Orbit.Api
```

## Testes

```bash
dotnet test tests/Orbit.Tests/Orbit.Tests.csproj --verbosity normal
```

Cobertura: classificacao automatica, orcamento, assinaturas, simulacao de dividas, autenticacao.

## Codigo

- **166 arquivos C#** no backend
- **107 arquivos TypeScript/TSX** no frontend
- **29 entidades** de dominio
- **13 enums**
- **25 controllers**
- **20 paginas** no frontend
- **18 modulos de API** no frontend
