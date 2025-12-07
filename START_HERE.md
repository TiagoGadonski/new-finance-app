# 🚀 INICIAR FINANCEAPP - GUIA PASSO A PASSO

## ⚡ Início Rápido (3 comandos!)

### Passo 1: Iniciar Backend + Banco de Dados
```powershell
# Abra PowerShell COMO ADMINISTRADOR
cd T:\Tiago\FinanceApp
.\scripts\setup.ps1 up
```

**Aguarde**: Pode levar 1-2 minutos na primeira vez (download de imagens Docker)

✅ Quando ver "financeapp-api" com status "healthy", está pronto!

### Passo 2: Abrir o Frontend
```powershell
# Em OUTRO PowerShell (não precisa ser admin)
cd T:\Tiago\FinanceApp\frontend
python -m http.server 8080
```

**OU se não tiver Python:**
```powershell
# Use qualquer servidor web, exemplo com PHP:
php -S localhost:8080

# Ou simplesmente abra o arquivo:
start index.html
```

### Passo 3: Acessar no Navegador
Abra seu navegador em:
👉 **http://localhost:8080**

---

## 🔐 Login Automático

As credenciais já estão preenchidas:
- **Email**: demo@financeapp.com
- **Senha**: Demo@123

Apenas clique em **"Entrar"**!

---

## 📊 O Que Você Pode Testar

### ✅ Dashboard
- Ver saldo total das contas
- Receitas e despesas do mês
- Transações recentes

### ✅ Transações
- Criar nova transação (receita/despesa)
- Ver lista completa
- Categorização automática

### ✅ Orçamentos
- Definir limite por categoria
- Ver percentual usado
- Alertas quando atingir 80%

### ✅ Assinaturas
- Cadastrar Netflix, Spotify, etc
- Ver próximas cobranças
- Detectar assinaturas pouco usadas

### ✅ Metas
- Criar meta financeira
- Acompanhar progresso
- Ver percentual alcançado

### ✅ Dívidas
- Cadastrar dívidas
- **Simular quitação**:
  - Bola de Neve (menor saldo)
  - Avalanche (maior juros)
- Comparar estratégias

---

## 🐛 Problemas Comuns

### "Erro de conexão com o servidor"
```powershell
# Verifique se backend está rodando:
docker ps

# Deve aparecer "financeapp-api" com status UP
# Se não aparecer, rode:
.\scripts\setup.ps1 up
```

### "CORS Error" no navegador
```powershell
# O backend já está configurado para aceitar requisições do frontend
# Se ainda der erro, tente abrir com: http:// (não https://)
```

### Backend não inicia
```powershell
# Verifique se Docker está instalado e rodando:
docker --version

# Se não tiver Docker, instale:
# https://www.docker.com/products/docker-desktop/
```

### Frontend não abre
```powershell
# Opção 1: Use extensão Live Server no VS Code

# Opção 2: Simplesmente abra o arquivo direto:
start T:\Tiago\FinanceApp\frontend\index.html

# Opção 3: Instale Node.js e rode:
npx serve frontend
```

---

## 📡 Testando a API Diretamente

### Swagger UI (Documentação Interativa)
👉 **http://localhost:5000/swagger**

Aqui você pode:
- Ver todos os endpoints
- Testar requisições
- Ver exemplos de request/response

### VS Code REST Client
Abra o arquivo:
```
collections/finance-app.http
```

Execute as requisições direto no VS Code!

---

## 🎯 Fluxo Recomendado de Teste

### 1. Primeiro Acesso
✅ Faça login
✅ Veja o dashboard (já tem 1 conta padrão "Carteira")

### 2. Crie sua Primeira Transação
✅ Vá em "Transações"
✅ Adicione uma receita (ex: Salário R$ 5000)
✅ Veja o saldo atualizar no dashboard

### 3. Configure um Orçamento
✅ Vá em "Orçamentos"
✅ Defina limite para categoria "Alimentação" (ex: R$ 1000)
✅ Crie algumas despesas de alimentação
✅ Veja a barra de progresso

### 4. Teste a Simulação de Dívidas
✅ Vá em "Dívidas"
✅ Cadastre 2-3 dívidas com juros diferentes
✅ Use o simulador com R$ 1500/mês
✅ Compare Bola de Neve vs Avalanche

### 5. Crie uma Meta
✅ Vá em "Metas"
✅ Defina uma meta (ex: Viagem - R$ 10.000)
✅ Acompanhe o progresso

---

## 🛑 Como Parar Tudo

### Parar o Frontend
```powershell
# No PowerShell onde rodou "python -m http.server"
# Pressione: Ctrl + C
```

### Parar o Backend
```powershell
cd T:\Tiago\FinanceApp
.\scripts\setup.ps1 down
```

---

## 📊 Dados de Teste

O sistema já vem com:
- ✅ 1 usuário demo
- ✅ 1 conta "Carteira" (saldo R$ 0)
- ✅ 13 categorias padrão
- ✅ Pronto para usar!

---

## 🎨 Recursos Avançados

### Importar Transações via CSV
1. Vá em "Transações"
2. Use o endpoint de importação
3. Exemplo de CSV em: `examples/transactions-sample.csv`

### Classificação Automática
O sistema aprende! Quando você categoriza "Uber" como "Transporte":
- Próxima vez que adicionar "Uber Eats"
- Sistema sugere "Transporte" automaticamente

### Alertas de Orçamento
- Quando gastar 80% do limite
- Sistema marca com ⚠️

### Análise de Assinaturas
- Sistema detecta assinaturas com menos de 2 usos/mês
- Sugere cancelamento

---

## 🆘 Precisa de Ajuda?

1. **Logs do Backend**:
```powershell
.\scripts\setup.ps1 logs
```

2. **Documentação Completa**:
- README.md
- ARCHITECTURE.md
- TROUBLESHOOTING.md

3. **Testar API Diretamente**:
- Swagger: http://localhost:5000/swagger
- Postman: Importe `collections/FinanceApp.postman_collection.json`

---

## ✨ Pronto!

Você agora tem:
- ✅ Backend .NET 8 rodando
- ✅ PostgreSQL + Redis
- ✅ Frontend funcional
- ✅ Todas as features disponíveis

**Divirta-se testando!** 🎉

---

## 📞 Links Rápidos

- **Frontend**: http://localhost:8080
- **Backend Swagger**: http://localhost:5000/swagger
- **API Base**: http://localhost:5000/api
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

**Desenvolvido com ❤️ usando .NET 8 + Clean Architecture**
