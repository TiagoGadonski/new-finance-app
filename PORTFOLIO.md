# Orbit - Portfolio Tecnico

## Resumo Executivo

**Orbit** e uma plataforma pessoal full-stack que integra gestao financeira, produtividade e automacao inteligente. O projeto demonstra dominio em arquitetura de software, desenvolvimento backend e frontend, integracao com APIs externas, e DevOps com Docker.

---

## Numeros do Projeto

| Metrica | Valor |
|---------|-------|
| Arquivos C# (backend) | 166 |
| Arquivos TypeScript/TSX (frontend) | 107 |
| Entidades de dominio | 29 |
| Controllers REST | 25 |
| Paginas no frontend | 20 |
| Modulos de API no frontend | 18 |
| Enums | 13 |
| Containers Docker | 4 |
| Migrations EF Core | 10+ |

---

## Arquitetura e Padroes

### Backend - Clean Architecture (.NET 8)

O backend segue rigorosamente os principios de **Clean Architecture**, com 4 camadas bem definidas:

```
┌─────────────────────────────────────────┐
│  API Layer (Controllers, Middleware)     │
├─────────────────────────────────────────┤
│  Application Layer (CQRS, DTOs, Handlers)│
├─────────────────────────────────────────┤
│  Domain Layer (Entities, Interfaces)     │
├─────────────────────────────────────────┤
│  Infrastructure (EF Core, Repos, Services)│
└─────────────────────────────────────────┘
```

**Padroes aplicados:**
- **CQRS** com MediatR (Commands e Queries separados)
- **Repository Pattern** generico (`IRepository<T>`)
- **Dependency Injection** em todas as camadas
- **Domain-Driven Design** com entidades ricas e enums tipados
- **BackgroundService** para processamento periodico assíncrono
- **JWT Authentication** com refresh token rotation

### Frontend - Next.js 15

- **App Router** com 20 paginas
- **TanStack Query** para cache e data fetching (queries e mutations)
- **Tailwind CSS** com suporte completo a dark mode
- **Component architecture** com modais, formularios, graficos (Recharts)
- **TypeScript** em todo o codigo com tipagem forte

### Infraestrutura - Docker

- **Multi-stage Docker build** para otimizacao de imagem
- **Docker Compose** com 4 servicos (PostgreSQL, Redis, API, Frontend)
- **Health checks** para orquestracao confiavel de startup
- **Volumes** persistentes para dados

---

## Modulos e Funcionalidades

### 1. Gestao Financeira Completa

**Complexidade: Alta**

Sistema completo de financas pessoais com:

- **Multi-conta**: Corrente, poupanca, cartao, investimentos, carteira, negocios
- **Multi-moeda**: Suporte a diferentes moedas com conversao via API externa (open.er-api.com)
- **Transacoes**: CRUD completo + importacao CSV + templates reutilizaveis + deteccao de duplicatas
- **Categorias inteligentes**: Classificacao automatica por regras aprendidas (machine learning simples)
- **Orcamento**: Limites por categoria com monitoramento e alertas automaticos
- **Assinaturas**: Tracking com previsao de gastos e geracao automatica de transacoes

**Destaques tecnicos:**
- Importacao de CSV com parsing robusto (formatos ISO e brasileiro)
- Deteccao de duplicatas com fuzzy matching
- Consolidacao de orcamento com calculo real-time de percentuais

### 2. Investimentos

**Complexidade: Media**

Portfolio tracking com:

- Suporte a acoes, FIIs, cripto, renda fixa, ETFs
- Registro de compras/vendas com calculo de preco medio
- Grafico de alocacao (pie chart) por tipo de ativo
- Resumo consolidado com rentabilidade

### 3. Simulacao de Dividas

**Complexidade: Media**

Engine de simulacao com duas estrategias classicas:

- **Snowball** (Dave Ramsey): Prioriza dividas menores para momentum psicologico
- **Avalanche**: Prioriza maiores taxas de juros para economia maxima
- Comparativo mostrando total de juros e tempo de quitacao por estrategia

### 4. Sistema de Alertas Proativos

**Complexidade: Alta**

`AlertEvaluationService` - um BackgroundService que roda periodicamente e avalia:

| Tipo de Alerta | Logica de Avaliacao |
|---------------|---------------------|
| Orcamento estourando | Gasto >= X% do limite (configuravel) |
| Conta a vencer | Assinatura/divida vence em N dias |
| Saldo negativo | Conta com balance < 0 |
| Meta quase atingida | Progresso >= X% do objetivo |
| Ultimo dia util | Calculo considerando feriados (inclui Pascoa) |

**Destaques tecnicos:**
- Deduplicacao: nao cria notificacao repetida no mesmo dia
- Entrega multicanal: in-app (Notification entity) e/ou Telegram
- Calculo de dia util com consideracao de feriados nacionais, municipais e moveis (Pascoa)
- Configuracao por familia (threshold, canal de entrega)

### 5. Lembretes Calendarizados

**Complexidade: Media**

- Entidade separada de AlertConfiguration (alertas sao condicionais, lembretes sao de data)
- Notificacao N dias antes da data (configuravel)
- Suporte a eventos recorrentes anuais (aniversarios)
- CRUD via frontend + avaliacao automatica pelo BackgroundService

### 6. Tarefas (To-Do) com Integracao Telegram

**Complexidade: Media**

- CRUD completo com filtros (pendentes/concluidas)
- **Integracao bidirecional com Telegram Bot**:
  - Usuario envia mensagem natural ao bot → bot cria tarefa no Orbit
  - Usuario pede lista → bot consulta API e responde formatado
  - Usuario pede para concluir → bot faz toggle via API
- Implementado via StarBot (repositorio separado) com tools pattern

### 7. Trabalho PJ / MEI

**Complexidade: Media**

- Calendario de dias trabalhados com visualizacao mensal
- CRUD de feriados com calculo automatico de feriados moveis (Pascoa + Corpus Christi + Carnaval)
- Calculo de impostos MEI (DAS) com tracking de faturamento vs limite anual
- Configuracao de hora/dia de trabalho e taxa por hora

### 8. Relatorios e Analytics

**Complexidade: Media**

Tres tipos de relatorios:

- **Mensal**: Receitas vs despesas com breakdown por categoria
- **Fluxo de Caixa**: Projecao futura baseada em historico e assinaturas
- **Comparacao de Periodos**: Lado a lado entre dois meses/periodos

### 9. Multi-usuario com Familias

**Complexidade: Alta**

- Modelo de **familias**: admin cria familia e convida membros
- Todos os dados sao scoped por `FamilyId` (isolamento completo)
- **Audit trail**: `CreatedByUsername`, `UpdatedByUsername` em todas as entidades principais
- Painel administrativo para gestao de membros
- Roles: Admin e User com permissoes diferenciadas

### 10. Funcionalidades Complementares

- **Dark mode** completo no frontend
- **Listas de compras** colaborativas com prioridades
- **Split de despesas** entre membros
- **Microinvestimentos** (arredondamento de transacoes)
- **Notificacoes in-app** com badge e dropdown no navbar
- **Paginacao** client-side para listas grandes

---

## Integracao com Telegram Bot (StarBot)

Projeto separado que conecta o Orbit ao Telegram, permitindo interacao via linguagem natural:

**Arquitetura do StarBot:**
- **TypeScript** com build via tsup
- **grammy** para API do Telegram
- **Anthropic Claude API** para processamento de linguagem natural
- **Tool pattern**: cada funcionalidade e um `ITool` com definition + execute
- **FinanceApiClient**: HTTP client com JWT auth e auto-refresh

**Tools implementadas (12):**
- Listar contas, categorias, transacoes
- Criar transacao
- Relatorio mensal
- Listar assinaturas, metas, dividas, orcamentos
- Criar/listar/completar tarefas

O bot recebe mensagens em linguagem natural, identifica a intencao via LLM, executa as tools necessarias e responde formatado.

---

## Tecnologias Utilizadas

### Backend
| Tecnologia | Uso |
|-----------|-----|
| .NET 8 / ASP.NET Core | Framework principal |
| Entity Framework Core | ORM com migrations |
| PostgreSQL 16 | Banco de dados |
| Redis 7 | Cache distribuido |
| MediatR | CQRS pattern |
| FluentValidation | Validacoes |
| BCrypt.Net | Criptografia |
| Serilog | Logging |
| xUnit + Moq | Testes |

### Frontend
| Tecnologia | Uso |
|-----------|-----|
| Next.js 15 | Framework React |
| TypeScript | Tipagem |
| TanStack Query | Data fetching |
| Tailwind CSS | Estilizacao |
| Recharts | Graficos |
| Lucide Icons | Iconografia |

### DevOps
| Tecnologia | Uso |
|-----------|-----|
| Docker | Containerizacao |
| Docker Compose | Orquestracao |
| Multi-stage builds | Otimizacao de imagem |

### Integracoes
| Tecnologia | Uso |
|-----------|-----|
| Telegram Bot API | Notificacoes proativas |
| open.er-api.com | Taxas de cambio |
| Anthropic Claude API | LLM para bot conversacional |

---

## Decisoes Arquiteturais Notaveis

1. **Clean Architecture com 4 camadas** - Separacao clara de responsabilidades, testabilidade, e independencia de framework
2. **BackgroundService ao inves de Hangfire/Quartz** - Simplicidade sem dependencias extras para caso de uso single-instance
3. **JWT com Refresh Token Rotation** - Seguranca robusta sem dependencia de sessao server-side
4. **Generic Repository** - Reduz boilerplate mantendo flexibilidade por entidade
5. **Telegram direto do .NET** - Notificacoes proativas sem dependencia do StarBot (envio separado de polling)
6. **TanStack Query** - Cache inteligente no frontend com invalidacao automatica apos mutations
7. **Family-scoped data** - Isolamento por FamilyId em todas as queries, sem risco de vazamento entre familias
8. **AuditableEntity base class** - Heranca para tracking automatico de criacao/atualizacao

---

## Como Executar

```bash
# Clonar e subir
git clone <repo-url>
cd Orbit
docker compose up -d --build

# Acessar
# Frontend: http://localhost:3000
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

Todo o sistema (banco, cache, API, frontend) sobe com um unico comando.
