# Orbit — Personal Finance Platform

A full-stack personal finance management platform built for multi-user households. Orbit covers the entire financial lifecycle — from daily transactions and recurring bills to investment tracking, debt payoff planning, and multi-month budget forecasting.

---

## Badges

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![xUnit](https://img.shields.io/badge/Tests-xUnit-green)

---

## Features

### Accounts & Transactions
- Multi-currency accounts (per-account currency field + live exchange rates via open.er-api.com, cached in Redis)
- Installment tracking (`InstallmentCount` / `CurrentInstallment`) and recurring transaction flag
- CSV import with duplicate detection
- Reusable transaction templates (apply a template to create a pre-filled transaction in one click)
- Automatic transaction classification via configurable keyword-matching rules

### Budgets, Goals & Debts
- Monthly budget envelopes with consolidated spend tracking
- Savings goals with progress tracking
- Debt management with installment countdown and payoff simulation (Snowball and Avalanche strategies)

### Subscriptions & Forecast
- Active/cancelled subscription tracking with upcoming billing calendar
- **Budget Forecast**: projects monthly surplus/deficit for 1–12 months ahead, combining recurring income, fixed expense templates, active subscriptions, and debt installments — installment contributions automatically decrease as debts are paid off

### Investments
- Portfolio tracking (stocks, FIIs, crypto, etc.) with average cost basis
- Investment transaction history (buy/sell/dividend)
- Allocation chart by asset type

### Reports
- Monthly report (income vs. expense by category)
- Cash flow projection
- Period comparison (any two date ranges)

### Freelance / MEI Tools
- Work calendar: define working days, public holidays, and calculate monthly billable hours
- MEI DAS tax estimator with annual revenue limit tracking

### Alerts & Reminders
- Configurable alert rules: budget threshold, bill due, debt due, negative balance, goal near target, last business day of month
- Background evaluation service (configurable interval, default 6 h) runs as a .NET `BackgroundService`
- Calendar-based reminders (birthdays, recurring dates) with configurable advance notice in days
- In-app notification center + optional Telegram message delivery

### Multi-user & Audit
- All data scoped by `FamilyId` extracted from JWT claims — complete tenant isolation at the query level
- Multiple users per family, each with their own credentials and role (`Admin` / `User`)
- Full audit trail: `CreatedByUsername`, `UpdatedByUsername`, `CreatedAt`, `UpdatedAt` on every record

### Telegram Bot Integration *(separate repo)*
- [StarBot](https://github.com/tiagogadonski/starbot) — a Node.js bot using Claude (Anthropic) as the AI layer
- Authenticated per-user via a shared `BOT_SECRET`; each Telegram user maps to an Orbit account
- Supports natural-language commands: *"lancei R$120 no mercado hoje"*, *"qual minha sobra esse mês?"*, and more via Claude tool-use loop

### Additional Modules
- Expense splitting between family members
- Shopping lists
- Todo items
- Roundup rules (round up transactions and sweep the difference to a savings goal)

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | .NET 8 |
| Architecture | Clean Architecture (Domain → Application → Infrastructure → Api) |
| CQRS / Mediator | MediatR 12 |
| ORM | Entity Framework Core 8 (Npgsql) |
| Validation | FluentValidation 11 |
| Auth | JWT Bearer + refresh tokens (BCrypt password hashing) |
| Caching | Redis via `IDistributedCache` |
| CSV parsing | CsvHelper 30 |
| Logging | Serilog (console + rotating file sinks) |
| API docs | Swagger / Swashbuckle |
| Background jobs | `BackgroundService` (alert evaluation) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Data fetching | TanStack Query v5 |
| State | Redux Toolkit (auth slice) |
| Forms | React Hook Form 7 |
| Charts | Recharts 3 |
| Styling | Tailwind CSS 4 |
| HTTP client | Axios (with JWT refresh interceptor) |
| Icons | Lucide React |
| Toasts | React Hot Toast |

### Telegram Bot *(separate repo)*
| | |
|---|---|
| Runtime | Node.js |
| Framework | grammY |
| AI | Anthropic SDK (Claude) with tool-use loop |
| Build | tsup |

### Infrastructure
| | |
|---|---|
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Containerization | Docker Compose |
| Tests | xUnit + Moq + FluentAssertions |

---

## Architecture

The backend follows **Clean Architecture** with strict unidirectional dependencies — outer layers depend on inner layers, never the reverse.

```
┌─────────────────────────────────────────────────────┐
│                      Api Layer                      │
│         Controllers → MediatR → Handlers            │
│         JWT auth · Swagger · Serilog                │
├─────────────────────────────────────────────────────┤
│                  Application Layer                  │
│   Commands · Queries · Handlers · Validators        │
│   CurrencyService · ClassificationService           │
│   BudgetForecastService · NotificationService       │
├─────────────────────────────────────────────────────┤
│                 Infrastructure Layer                │
│   EF Core + Npgsql · Generic Repository<T>          │
│   AlertEvaluationService (BackgroundService)        │
│   TelegramService · Migrations (auto-applied)       │
│   DataSeeder · Redis cache (IDistributedCache)      │
├─────────────────────────────────────────────────────┤
│                   Domain Layer                      │
│   Entities · Enums · IRepository<T> interface       │
│   BaseEntity (Id, CreatedAt, UpdatedAt)             │
│   AuditableEntity (+ CreatedByUsername, Updated*)   │
└─────────────────────────────────────────────────────┘
```

**Request flow example — create transaction:**

```
POST /api/transactions
  → TransactionsController (extracts FamilyId, UserId from JWT)
  → MediatR.Send(CreateTransactionCommand)
  → CreateTransactionCommandHandler
      → IRepository<Transaction>.AddAsync()
      → ClassificationService.ClassifyAsync()   // auto-categorise
      → NotificationService (if alert triggered)
  → 201 Created + TransactionDto
```

**Multi-tenancy**: every handler receives `FamilyId` from the JWT claim and applies it as a filter predicate to all repository queries. There is no shared mutable state between families at the ORM level.

**Token refresh**: the frontend Axios interceptor automatically retries failed 401 requests after exchanging the stored refresh token, with a queued-request mechanism to handle concurrent calls during refresh.

---

## Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- (For local development without Docker) .NET 8 SDK · Node.js 20+

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DB_PASSWORD` | ✅ | PostgreSQL password |
| `DB_USER` | optional | PostgreSQL user (default: `postgres`) |
| `DB_NAME` | optional | Database name (default: `orbit`) |
| `JWT_SECRET_KEY` | ✅ | HS256 signing key — minimum 32 characters |
| `JWT_ISSUER` | optional | JWT issuer claim (default: `Orbit`) |
| `JWT_AUDIENCE` | optional | JWT audience claim (default: `OrbitUsers`) |
| `SEED_ADMIN_PASSWORD` | ✅ | Password for the admin user created on first run |
| `TELEGRAM_BOT_TOKEN` | optional | Telegram Bot API token (alert delivery) |
| `TELEGRAM_CHAT_ID` | optional | Telegram chat ID to receive alert messages |
| `BOT_SECRET` | optional | Shared secret for StarBot ↔ API authentication |
| `ALERT_EVAL_INTERVAL` | optional | Alert evaluation interval in hours (default: `6`) |

Before building the frontend image, update `NEXT_PUBLIC_API_URL` in `docker-compose.yml` to match your host's public address — this value is baked into the Next.js bundle at build time.

### Running with Docker Compose

```bash
# 1. Clone the repository
git clone https://github.com/your-username/orbit.git
cd orbit

# 2. Configure environment
cp .env.example .env
# Edit .env — set DB_PASSWORD, JWT_SECRET_KEY, SEED_ADMIN_PASSWORD at minimum

# 3. Build services (build separately to avoid memory pressure on constrained hosts)
docker compose build api
docker compose build frontend

# 4. Start all services
docker compose up -d

# 5. Verify
docker compose ps
```

| Service | Default port |
|---|---|
| API | `http://localhost:5000` |
| Swagger UI | `http://localhost:5000/swagger` |
| Frontend | `http://localhost:3000` |
| PostgreSQL | `5432` |
| Redis | `6379` |

> **First run**: EF Core migrations are applied automatically at startup. The API then seeds a default admin user using the `SEED_ADMIN_PASSWORD` value if no users exist.

### Running Tests

```bash
docker run --rm \
  -v $(pwd):/app \
  -w /app/tests/Orbit.Tests \
  mcr.microsoft.com/dotnet/sdk:8.0 \
  dotnet test
```

---

## Project Structure

```
orbit/
├── src/
│   ├── Orbit.Domain/          # Entities, enums, IRepository<T> interface
│   ├── Orbit.Application/     # MediatR handlers, validators, services, DTOs
│   ├── Orbit.Infrastructure/  # EF Core context, migrations, background services
│   └── Orbit.Api/             # Controllers, middleware, DI composition root
├── frontend-nextjs/
│   └── src/
│       ├── app/               # Next.js App Router pages (one folder per route)
│       ├── components/        # Shared UI + feature-specific components
│       ├── lib/api/           # Axios API client modules (one file per domain)
│       └── types/             # TypeScript interfaces mirroring backend DTOs
├── tests/
│   └── Orbit.Tests/           # xUnit unit tests — handlers and services
├── docker-compose.yml
├── .env.example
└── .editorconfig
```

---

## Screenshots

| Dashboard | Transactions |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Transactions](docs/screenshots/transactions.png) |

| Budget Forecast | Investments |
|---|---|
| ![Forecast](docs/screenshots/forecast.png) | ![Investments](docs/screenshots/investments.png) |

| Debt Simulator | Reports |
|---|---|
| ![Debts](docs/screenshots/debts.png) | ![Reports](docs/screenshots/reports.png) |

---

## License

MIT
