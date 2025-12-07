# 🔧 Troubleshooting - FinanceApp

Guia de resolução de problemas comuns.

## 🚫 Problemas de Inicialização

### Docker não inicia

**Erro**: `Cannot connect to the Docker daemon`

**Solução**:
```bash
# Windows: Verifique se Docker Desktop está rodando
# Abra Docker Desktop manualmente

# Linux: Inicie o serviço Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verifique status
docker --version
docker ps
```

### Porta já em uso

**Erro**: `Bind for 0.0.0.0:5000 failed: port is already allocated`

**Solução**:
```bash
# Opção 1: Libere a porta
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Opção 2: Mude a porta no docker-compose.yml
api:
  ports:
    - "8080:8080"  # Use porta diferente
```

### Container não conecta ao banco

**Erro**: `Could not connect to database`

**Solução**:
```bash
# Aguarde o PostgreSQL ficar pronto
docker-compose logs postgres

# Verifique se o container está saudável
docker ps

# Force recriação
docker-compose down -v
docker-compose up -d --force-recreate
```

## 🗄️ Problemas de Banco de Dados

### Migrations não aplicam

**Erro**: `Failed to apply migrations`

**Solução**:
```bash
# Opção 1: Rodar migrations manualmente
dotnet ef database update --project src/FinanceApp.Infrastructure --startup-project src/FinanceApp.Api

# Opção 2: Dentro do container
docker-compose exec api dotnet ef database update

# Opção 3: Recrie o banco
docker-compose down -v  # Remove volumes
docker-compose up -d
```

### Dados não aparecem

**Problema**: Banco vazio após inicialização

**Solução**:
```bash
# Verifique se seed rodou
docker-compose logs api | grep -i seed

# Conecte ao banco e verifique
docker-compose exec postgres psql -U postgres -d financeapp
\dt  # Lista tabelas
SELECT * FROM "Users";
\q

# Se não tiver dados, force seed
# Adicione no Program.cs: await DataSeeder.SeedAsync(context);
```

### Connection String incorreta

**Erro**: `Authentication failed`

**Solução**:
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=postgres;Port=5432;Database=financeapp;Username=postgres;Password=postgres"
  }
}

// Note: Use "Host=postgres" no Docker, "Host=localhost" sem Docker
```

## 🔐 Problemas de Autenticação

### Token inválido

**Erro**: `401 Unauthorized`

**Solução**:
```bash
# Verifique se JWT secret está configurado
# appsettings.json
{
  "JwtSettings": {
    "SecretKey": "deve-ter-pelo-menos-32-caracteres-aqui"
  }
}

# Gere novo token
POST /api/auth/login
{
  "email": "demo@financeapp.com",
  "password": "Demo@123"
}
```

### Senha não funciona

**Problema**: Login falha com senha correta

**Solução**:
```bash
# Verifique se usuário existe
docker-compose exec postgres psql -U postgres -d financeapp
SELECT "Email", "Name" FROM "Users";

# Reset senha do usuário demo
# Use /api/auth/signup para criar novo usuário
```

## 📡 Problemas de API

### Swagger não abre

**Erro**: `404 Not Found` em `/swagger`

**Solução**:
```csharp
// Verifique Program.cs
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Acesse: http://localhost:5000/swagger/index.html
```

### CORS Error

**Erro**: `Access-Control-Allow-Origin`

**Solução**:
```csharp
// Program.cs - Adicione antes de app.Run()
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());
```

### 500 Internal Server Error

**Solução**:
```bash
# Veja logs detalhados
docker-compose logs -f api

# Ou acesse logs no container
docker-compose exec api cat /app/logs/financeapp-*.txt

# Habilite logs detalhados
# appsettings.Development.json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Debug"
    }
  }
}
```

## 🧪 Problemas de Testes

### Testes falham

**Erro**: Testes não passam

**Solução**:
```bash
# Limpe e rebuild
dotnet clean
dotnet build
dotnet test --verbosity detailed

# Execute teste específico
dotnet test --filter "FullyQualifiedName~ClassificationServiceTests"

# Verifique dependências
dotnet restore
```

## 💾 Problemas de Performance

### API lenta

**Solução**:
```bash
# Verifique logs de queries lentas
docker-compose logs postgres | grep -i "duration"

# Adicione índices no DbContext
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Transaction>()
        .HasIndex(t => new { t.UserId, t.Date });
}

# Crie migration
dotnet ef migrations add AddIndexes
```

### Banco de dados cresce muito

**Solução**:
```bash
# Vacuum PostgreSQL
docker-compose exec postgres psql -U postgres -d financeapp
VACUUM FULL;

# Limpe logs antigos
find ./logs -name "*.txt" -mtime +30 -delete
```

## 🔄 Problemas de Redis

### Redis não conecta

**Erro**: `Redis connection failed`

**Solução**:
```bash
# Verifique se Redis está rodando
docker-compose ps redis

# Teste conexão
docker-compose exec redis redis-cli ping
# Deve retornar: PONG

# Verifique connection string
# appsettings.json
{
  "ConnectionStrings": {
    "Redis": "redis:6379"  # Docker
    // ou
    "Redis": "localhost:6379"  # Local
  }
}
```

## 🐛 Debug Local

### Como debugar sem Docker

```bash
# 1. Inicie apenas banco e Redis
docker-compose up -d postgres redis

# 2. Ajuste connection string
# appsettings.Development.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;...",
    "Redis": "localhost:6379"
  }
}

# 3. Execute migrations
dotnet ef database update --project src/FinanceApp.Infrastructure --startup-project src/FinanceApp.Api

# 4. Execute a API
cd src/FinanceApp.Api
dotnet run

# 5. Ou use Visual Studio/Rider para debug
```

### Como ver SQL gerado pelo EF Core

```csharp
// appsettings.Development.json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}

// Agora você verá as queries SQL nos logs
```

## 📊 Problemas com Importação CSV

### CSV não importa

**Erro**: `Invalid CSV format`

**Solução**:
```csv
# Formato correto (com header)
Date,Description,Amount,Type
2024-12-01,Salário,5000.00,Income
2024-12-02,Compra,100.50,Expense

# Erros comuns:
# ❌ Sem header
# ❌ Separador errado (use vírgula)
# ❌ Data em formato inválido
# ❌ Amount com vírgula ao invés de ponto

# Use o exemplo em: examples/transactions-sample.csv
```

### Categorias não são sugeridas

**Problema**: Import não classifica automaticamente

**Solução**:
```bash
# A classificação aprende com o tempo
# Após importar, edite manualmente algumas transações
# O sistema vai aprender e sugerir nas próximas

# Ou crie regras manualmente
POST /api/classification-rules
{
  "keyword": "uber",
  "categoryId": "guid-da-categoria-transporte",
  "priority": 10
}
```

## 🚀 Otimizações de Produção

### Configurar para Produção

```bash
# 1. Mude secrets
# appsettings.Production.json
{
  "JwtSettings": {
    "SecretKey": "use-um-secret-forte-aqui-gerado-aleatoriamente-64-caracteres"
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=seu-db-producao;..."
  }
}

# 2. Habilite HTTPS
# docker-compose.yml
api:
  environment:
    - ASPNETCORE_URLS=https://+:443;http://+:80
  ports:
    - "443:443"
    - "80:80"
  volumes:
    - ./certificates:/https:ro

# 3. Configure rate limiting mais restritivo
# Program.cs
PermitLimit = 50,  # Diminua de 100
Window = TimeSpan.FromMinutes(1)

# 4. Habilite apenas origins específicas
app.UseCors(policy => policy
    .WithOrigins("https://seu-frontend.com")
    .AllowAnyMethod()
    .AllowAnyHeader());
```

## 📞 Ainda com Problemas?

1. **Verifique logs**: `docker-compose logs -f api`
2. **Veja issues no GitHub**: Pode ser um bug conhecido
3. **Abra uma issue**: Com logs e passos para reproduzir
4. **Discord/Chat**: Se tiver comunidade ativa

## 🔍 Comandos Úteis de Debug

```bash
# Ver todas as imagens Docker
docker images

# Ver todos os containers (inclusive parados)
docker ps -a

# Inspecionar container
docker inspect financeapp-api

# Entrar no container
docker-compose exec api bash

# Ver uso de recursos
docker stats

# Limpar tudo (CUIDADO: remove volumes)
docker system prune -a --volumes
```
