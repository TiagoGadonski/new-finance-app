# FinanceApp - Guia de Configuração

## Visão Geral
FinanceApp é uma aplicação completa de gestão financeira com backend .NET 8 (Clean Architecture) e frontend Next.js 16.

## Correções Implementadas

### Segurança Crítica ✅
- **JWT Secret Key**: Movido para variável de ambiente
  - Defina `JWT_SECRET_KEY` (mínimo 32 caracteres) ou use o valor em `appsettings.Development.json` para desenvolvimento
- **CORS**: Restringido para origens específicas (`localhost:3000`)
- **Validação null**: Adicionada no `BaseAuthenticatedController`
- **Refresh Token Rotation**: Já implementado no backend

### Banco de Dados ✅
- **Migrations**: Criada migration inicial completa (`InitialCreate`)
- **MigrateAsync**: Substituído `EnsureCreatedAsync` por `MigrateAsync` em produção
- **Isolamento de Transação**: Implementado Unit of Work pattern com transações
- **Eager Loading**: Adicionado suporte a `.Include()` no Repository

### Validação e Qualidade de Código ✅
- **FluentValidation**: Implementados validators para Auth, Transaction e Account
- **ValidationBehavior**: Pipeline MediatR configurado
- **AutoMapper**: Removido (não estava sendo usado)
- **Error Handling**: Melhorado com correlationId, stack trace (dev), e logs estruturados

### Frontend ✅
- **Refresh Token Automático**: Interceptor axios implementado
- **Axios**: Versão corrigida para 1.7.7
- **Package.json**: Script de lint corrigido
- **.env.example**: Criado com configurações necessárias

### DevOps e Configuração ✅
- **.gitignore**: Atualizado com *.db, *.sqlite, appsettings.Production.json
- **Pacotes .NET**: Atualizados (Serilog, Swashbuckle)
- **Redis**: Configuração removida (usando in-memory cache)

---

## Pré-requisitos

### Backend
- .NET 8 SDK
- SQLite (incluído com .NET)

### Frontend
- Node.js 18+
- npm ou yarn

---

## Configuração do Backend

### 1. Configurar Variável de Ambiente (Produção)

**Windows (PowerShell):**
```powershell
$env:JWT_SECRET_KEY = "sua-chave-secreta-super-segura-com-mais-de-32-caracteres"
```

**Linux/Mac:**
```bash
export JWT_SECRET_KEY="sua-chave-secreta-super-segura-com-mais-de-32-caracteres"
```

### 2. Aplicar Migrations

```bash
cd src/FinanceApp.Infrastructure
dotnet ef database update --startup-project ../FinanceApp.Api
```

### 3. Executar o Backend

```bash
cd src/FinanceApp.Api
dotnet run
```

O backend estará disponível em: `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

---

## Configuração do Frontend

### 1. Instalar Dependências

```bash
cd frontend-nextjs
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite `.env.local` se necessário:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Executar o Frontend

```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

---

## Recursos Principais

### Backend
- **Clean Architecture**: Domain, Application, Infrastructure, API
- **CQRS + MediatR**: Comandos e queries separados
- **FluentValidation**: Validação automática de requests
- **Unit of Work**: Transações de banco garantidas
- **JWT Authentication**: Com refresh token rotation
- **Eager Loading**: Suporte a `.Include()` no repository
- **Logging Estruturado**: Serilog com correlationId

### Frontend
- **Next.js 16**: Com Turbopack e React 19
- **Redux Toolkit**: Estado global
- **React Query**: Cache e sincronização de servidor
- **Refresh Token Automático**: Renovação transparente de tokens
- **Error Handling**: Interceptors com retry
- **TypeScript**: Tipagem completa
- **Tailwind CSS 4**: Estilização moderna

---

## Estrutura do Projeto

```
FinanceApp/
├── src/
│   ├── FinanceApp.Domain/          # Entidades e interfaces
│   ├── FinanceApp.Application/     # Lógica de negócio, CQRS, Validators
│   ├── FinanceApp.Infrastructure/  # EF Core, Repositories, UnitOfWork
│   └── FinanceApp.Api/             # Controllers, Middleware
├── frontend-nextjs/
│   ├── src/
│   │   ├── app/                    # Pages (App Router)
│   │   ├── components/             # Componentes React
│   │   ├── lib/                    # API client, utils
│   │   └── store/                  # Redux store
│   └── public/                     # Assets estáticos
└── tests/                          # Testes unitários
```

---

## Comandos Úteis

### Backend
```bash
# Criar nova migration
dotnet ef migrations add NomeDaMigration --startup-project ../FinanceApp.Api

# Reverter migration
dotnet ef migrations remove --startup-project ../FinanceApp.Api

# Build
dotnet build

# Rodar testes
dotnet test
```

### Frontend
```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar em produção
npm start

# Lint
npm run lint

# Gerar ícones PWA
npm run generate:icons
```

---

## Configurações de Segurança

### Desenvolvimento
- JWT Secret em `appsettings.Development.json` (apenas dev!)
- CORS permite `localhost:3000`
- Stack traces visíveis em erros

### Produção
- JWT Secret em variável de ambiente `JWT_SECRET_KEY`
- CORS configurável via `AllowedOrigins` em appsettings
- Mensagens de erro genéricas (sem stack trace)
- HTTPS obrigatório

---

## Troubleshooting

### Erro: "JWT Secret Key must be at least 32 characters long"
**Solução**: Defina a variável de ambiente `JWT_SECRET_KEY` ou use o valor em `appsettings.Development.json`

### Erro: "Unable to create a 'DbContext'"
**Solução**: Execute `dotnet restore` e verifique se o projeto Infrastructure está compilado

### Frontend não conecta ao backend
**Solução**: Verifique se `NEXT_PUBLIC_API_URL` em `.env.local` aponta para `http://localhost:5000/api`

### CORS Error
**Solução**: Adicione a origem do frontend em `AllowedOrigins` no `appsettings.json`

---

## Próximos Passos

1. **Testes**: Adicionar testes de integração no frontend
2. **CI/CD**: Configurar pipeline de deploy
3. **Docker**: Criar docker-compose para desenvolvimento
4. **API Versioning**: Implementar versionamento de API
5. **Documentação**: Adicionar XML comments para Swagger

---

## Suporte

Para problemas ou dúvidas:
- Verifique os logs em `logs/financeapp-*.txt`
- Revise o correlationId nos erros de API
- Consulte a documentação do Swagger em `/swagger`

---

**Desenvolvido com Clean Architecture + Next.js 16**
