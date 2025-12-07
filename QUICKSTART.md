# 🚀 Guia de Início Rápido - FinanceApp

## Começar em 5 Minutos

### 1. Clone o Projeto
```bash
git clone https://github.com/seu-usuario/financeapp.git
cd financeapp
```

### 2. Inicie com Docker
```powershell
# Windows
.\scripts\setup.ps1 up

# Linux/Mac
make up
```

### 3. Acesse o Swagger
Abra no navegador: **http://localhost:5000/swagger**

### 4. Teste a API

#### Login com usuário demo
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "demo@financeapp.com",
  "password": "Demo@123"
}
```

Copie o `accessToken` da resposta.

#### Criar uma transação
```http
POST http://localhost:5000/api/transactions
Authorization: Bearer SEU_TOKEN_AQUI
Content-Type: application/json

{
  "accountId": "use-o-id-da-conta-carteira",
  "categoryId": "use-o-id-de-uma-categoria",
  "amount": 50.00,
  "type": "Expense",
  "description": "Almoço no restaurante",
  "date": "2024-12-06T12:00:00Z"
}
```

## 📝 Próximos Passos

1. Explore os endpoints no Swagger
2. Importe suas transações via CSV
3. Configure orçamentos para suas categorias
4. Registre suas assinaturas
5. Simule a quitação de dívidas

## 🆘 Problemas Comuns

### Docker não inicia
```bash
# Verifique se o Docker está rodando
docker --version

# Limpe containers antigos
docker-compose down -v
docker-compose up -d
```

### Erro de conexão com banco
```bash
# Aguarde o PostgreSQL ficar pronto
docker-compose logs postgres

# Force recriação dos containers
docker-compose up -d --force-recreate
```

### Porta 5000 já em uso
Edite `docker-compose.yml` e altere a porta:
```yaml
api:
  ports:
    - "8080:8080"  # Mude para 8080 ou outra porta livre
```

## 📚 Documentação Completa
Veja o [README.md](README.md) para informações detalhadas.
