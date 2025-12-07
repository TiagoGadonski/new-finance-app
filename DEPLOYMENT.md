# 🚀 Guia de Deploy - FinanceApp

Guia completo para deploy em produção.

## 📋 Pré-requisitos de Produção

- [ ] Servidor Linux (Ubuntu 22.04 LTS recomendado)
- [ ] Docker e Docker Compose instalados
- [ ] Domínio configurado (ex: api.financeapp.com)
- [ ] Certificado SSL (Let's Encrypt via Certbot)
- [ ] PostgreSQL em produção (RDS, managed, etc)
- [ ] Redis em produção (ElastiCache, managed, etc)

## 🔐 Checklist de Segurança

Antes de fazer deploy, certifique-se:

### 1. Secrets e Configurações
```bash
# ❌ NUNCA use estas configurações em produção:
JwtSettings__SecretKey: "your-super-secret-key-..."  # TROCAR!
DB_PASSWORD: "postgres"                               # TROCAR!
Redis: "localhost:6379"                              # TROCAR!

# ✅ Use valores seguros:
# - JWT: Gere com: openssl rand -base64 64
# - DB: Senha forte aleatória (20+ caracteres)
# - Redis: Configure senha
```

### 2. HTTPS
```yaml
# docker-compose.prod.yml
api:
  environment:
    - ASPNETCORE_URLS=https://+:443;http://+:80
  volumes:
    - ./certificates:/https:ro
```

### 3. CORS
```csharp
// Apenas origins permitidas
app.UseCors(policy => policy
    .WithOrigins(
        "https://app.financeapp.com",
        "https://www.financeapp.com"
    )
    .AllowAnyMethod()
    .AllowAnyHeader());
```

### 4. Rate Limiting
```csharp
// Mais restritivo em produção
PermitLimit = 50,  // Era 100
Window = TimeSpan.FromMinutes(1)
```

## 🐳 Deploy com Docker

### 1. Preparar Ambiente

```bash
# Conecte ao servidor
ssh user@seu-servidor.com

# Crie diretório
mkdir -p /opt/financeapp
cd /opt/financeapp

# Clone repositório
git clone https://github.com/seu-usuario/financeapp.git .
```

### 2. Configurar Variáveis de Ambiente

```bash
# Crie .env
cat > .env << EOF
# Database
DB_HOST=seu-db-producao.rds.amazonaws.com
DB_PORT=5432
DB_NAME=financeapp
DB_USER=financeapp_user
DB_PASSWORD=$(openssl rand -base64 32)

# Redis
REDIS_HOST=seu-redis-producao.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=$(openssl rand -base64 32)

# JWT
JWT_SECRET_KEY=$(openssl rand -base64 64)
JWT_ISSUER=FinanceApp
JWT_AUDIENCE=FinanceAppUsers

# App
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=https://+:443;http://+:80
EOF

# Proteja o arquivo
chmod 600 .env
```

### 3. Criar docker-compose.prod.yml

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: financeapp-api-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=https://+:443;http://+:80
      - ConnectionStrings__DefaultConnection=Host=${DB_HOST};Port=${DB_PORT};Database=${DB_NAME};Username=${DB_USER};Password=${DB_PASSWORD}
      - ConnectionStrings__Redis=${REDIS_HOST}:${REDIS_PORT},password=${REDIS_PASSWORD}
      - JwtSettings__SecretKey=${JWT_SECRET_KEY}
      - JwtSettings__Issuer=${JWT_ISSUER}
      - JwtSettings__Audience=${JWT_AUDIENCE}
    volumes:
      - ./logs:/app/logs
      - ./certificates:/https:ro
    networks:
      - financeapp-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Nginx reverse proxy (opcional)
  nginx:
    image: nginx:alpine
    container_name: financeapp-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certificates:/etc/nginx/ssl:ro
    depends_on:
      - api
    networks:
      - financeapp-network

networks:
  financeapp-network:
    driver: bridge
```

### 4. Configurar SSL (Let's Encrypt)

```bash
# Instale Certbot
sudo apt update
sudo apt install certbot

# Obtenha certificado
sudo certbot certonly --standalone -d api.financeapp.com

# Copie certificados
sudo cp /etc/letsencrypt/live/api.financeapp.com/fullchain.pem ./certificates/
sudo cp /etc/letsencrypt/live/api.financeapp.com/privkey.pem ./certificates/

# Converta para PFX (necessário para .NET)
sudo openssl pkcs12 -export \
  -out ./certificates/certificate.pfx \
  -inkey /etc/letsencrypt/live/api.financeapp.com/privkey.pem \
  -in /etc/letsencrypt/live/api.financeapp.com/fullchain.pem \
  -password pass:SUA_SENHA_AQUI

# Ajuste permissões
sudo chown -R $USER:$USER ./certificates
chmod 600 ./certificates/*
```

### 5. Build e Deploy

```bash
# Build da imagem
docker-compose -f docker-compose.prod.yml build

# Rodar migrations
docker-compose -f docker-compose.prod.yml run --rm api \
  dotnet ef database update --project src/FinanceApp.Infrastructure

# Iniciar aplicação
docker-compose -f docker-compose.prod.yml up -d

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f api
```

### 6. Verificar Health

```bash
# API está respondendo?
curl -k https://api.financeapp.com/health

# Swagger (desabilite em produção!)
curl -k https://api.financeapp.com/swagger

# Teste login
curl -X POST https://api.financeapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@financeapp.com","password":"Demo@123"}'
```

## ☁️ Deploy em Cloud Providers

### AWS (Elastic Beanstalk)

```bash
# Instale EB CLI
pip install awsebcli

# Inicialize
eb init -p docker financeapp --region us-east-1

# Crie ambiente
eb create financeapp-prod \
  --database \
  --database.engine postgres \
  --database.version 16

# Configure variáveis
eb setenv \
  JwtSettings__SecretKey="$(openssl rand -base64 64)" \
  ASPNETCORE_ENVIRONMENT=Production

# Deploy
eb deploy

# Abra no navegador
eb open
```

### Azure (App Service)

```bash
# Login
az login

# Crie resource group
az group create --name financeapp-rg --location eastus

# Crie App Service Plan
az appservice plan create \
  --name financeapp-plan \
  --resource-group financeapp-rg \
  --is-linux \
  --sku B1

# Crie Web App
az webapp create \
  --resource-group financeapp-rg \
  --plan financeapp-plan \
  --name financeapp-api \
  --deployment-container-image-name seu-usuario/financeapp:latest

# Configure variáveis
az webapp config appsettings set \
  --resource-group financeapp-rg \
  --name financeapp-api \
  --settings \
    ASPNETCORE_ENVIRONMENT=Production \
    JwtSettings__SecretKey="$(openssl rand -base64 64)"

# Deploy
az webapp deployment source config \
  --name financeapp-api \
  --resource-group financeapp-rg \
  --repo-url https://github.com/seu-usuario/financeapp \
  --branch main \
  --manual-integration
```

### Google Cloud (Cloud Run)

```bash
# Login
gcloud auth login

# Configure projeto
gcloud config set project SEU_PROJETO_ID

# Build imagem
gcloud builds submit --tag gcr.io/SEU_PROJETO_ID/financeapp

# Deploy
gcloud run deploy financeapp \
  --image gcr.io/SEU_PROJETO_ID/financeapp \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ASPNETCORE_ENVIRONMENT=Production

# Configure secret
echo "$(openssl rand -base64 64)" | \
  gcloud secrets create jwt-secret-key --data-file=-

# Adicione secret ao service
gcloud run services update financeapp \
  --update-secrets=JwtSettings__SecretKey=jwt-secret-key:latest
```

## 🗄️ Database em Produção

### Opção 1: Managed Database (Recomendado)

#### AWS RDS
```bash
aws rds create-db-instance \
  --db-instance-identifier financeapp-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username financeapp \
  --master-user-password SENHA_FORTE_AQUI \
  --allocated-storage 20 \
  --backup-retention-period 7 \
  --multi-az \
  --publicly-accessible false
```

#### Azure Database for PostgreSQL
```bash
az postgres server create \
  --resource-group financeapp-rg \
  --name financeapp-db \
  --location eastus \
  --admin-user financeapp \
  --admin-password SENHA_FORTE_AQUI \
  --sku-name B_Gen5_1 \
  --version 16 \
  --backup-retention 7
```

### Opção 2: PostgreSQL em Container (Produção)

```yaml
# docker-compose.prod.yml
postgres:
  image: postgres:16-alpine
  restart: always
  environment:
    POSTGRES_PASSWORD: ${DB_PASSWORD}
    POSTGRES_DB: financeapp
  volumes:
    - postgres-prod-data:/var/lib/postgresql/data
    - ./backups:/backups
  networks:
    - financeapp-network
  # Não exponha porta publicamente!
  # ports:
  #   - "5432:5432"  # NÃO fazer isso
```

### Backup Automático

```bash
# Crie script de backup
cat > /opt/financeapp/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/financeapp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="financeapp_backup_${DATE}.sql"

docker-compose -f /opt/financeapp/docker-compose.prod.yml exec -T postgres \
  pg_dump -U financeapp financeapp > "${BACKUP_DIR}/${FILENAME}"

# Compactar
gzip "${BACKUP_DIR}/${FILENAME}"

# Manter apenas últimos 30 dias
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x /opt/financeapp/backup.sh

# Agende com cron (diariamente às 3am)
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/financeapp/backup.sh") | crontab -
```

## 📊 Monitoring e Logging

### 1. Application Insights (Azure)

```bash
# Instale pacote
dotnet add package Microsoft.ApplicationInsights.AspNetCore

# Configure em appsettings.Production.json
{
  "ApplicationInsights": {
    "InstrumentationKey": "SUA_KEY_AQUI"
  }
}

# Program.cs
builder.Services.AddApplicationInsightsTelemetry();
```

### 2. Prometheus + Grafana

```yaml
# docker-compose.monitoring.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

### 3. ELK Stack (Elasticsearch, Logstash, Kibana)

```yaml
elasticsearch:
  image: elasticsearch:8.11.0
  environment:
    - discovery.type=single-node
  ports:
    - "9200:9200"

kibana:
  image: kibana:8.11.0
  ports:
    - "5601:5601"
  depends_on:
    - elasticsearch
```

## 🔄 CI/CD com GitHub Actions (Já configurado!)

O projeto já inclui `.github/workflows/ci-cd.yml` que:

1. ✅ Roda build
2. ✅ Executa testes
3. ✅ Publica imagem Docker no GitHub Container Registry
4. ✅ Verifica formatação de código

Para deploy automático, adicione:

```yaml
# .github/workflows/ci-cd.yml
deploy:
  runs-on: ubuntu-latest
  needs: docker-build
  if: github.ref == 'refs/heads/main'

  steps:
    - name: Deploy to production
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.PROD_HOST }}
        username: ${{ secrets.PROD_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /opt/financeapp
          git pull origin main
          docker-compose -f docker-compose.prod.yml pull
          docker-compose -f docker-compose.prod.yml up -d --force-recreate
```

## 🧪 Testes em Produção

### Health Check Endpoint

```csharp
// Program.cs
app.MapGet("/health", () => Results.Ok(new
{
    status = "Healthy",
    timestamp = DateTime.UtcNow
}));
```

### Smoke Tests

```bash
#!/bin/bash
# smoke-test.sh

API_URL="https://api.financeapp.com"

# Health check
curl -f "${API_URL}/health" || exit 1

# Login
TOKEN=$(curl -s -X POST "${API_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@financeapp.com","password":"Demo@123"}' \
  | jq -r '.accessToken')

# Get user
curl -f -H "Authorization: Bearer ${TOKEN}" \
  "${API_URL}/api/user/me" || exit 1

echo "✅ All smoke tests passed!"
```

## 📈 Escalabilidade

### Load Balancer (Nginx)

```nginx
# nginx.conf
upstream financeapp_api {
    least_conn;
    server api1:8080;
    server api2:8080;
    server api3:8080;
}

server {
    listen 443 ssl;
    server_name api.financeapp.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location / {
        proxy_pass http://financeapp_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Auto-scaling (Kubernetes)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: financeapp-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: financeapp-api
  template:
    metadata:
      labels:
        app: financeapp-api
    spec:
      containers:
      - name: api
        image: ghcr.io/seu-usuario/financeapp:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: financeapp-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: financeapp-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## 🔒 Hardening de Segurança

```bash
# 1. Firewall
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# 2. Fail2ban (proteção contra brute force)
sudo apt install fail2ban
sudo systemctl enable fail2ban

# 3. Atualizações automáticas
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# 4. Remova Swagger em produção
# appsettings.Production.json
{
  "Swagger": {
    "Enabled": false  # NÃO exponha Swagger em prod!
  }
}
```

## ✅ Checklist Final de Deploy

- [ ] Secrets configurados (JWT, DB, Redis)
- [ ] HTTPS configurado com certificado válido
- [ ] Banco de dados em produção funcionando
- [ ] Migrations aplicadas
- [ ] Seeding executado
- [ ] Logs configurados e funcionando
- [ ] Monitoring configurado
- [ ] Backups automáticos agendados
- [ ] CORS restrito apenas a origens permitidas
- [ ] Rate limiting configurado adequadamente
- [ ] Swagger desabilitado em produção
- [ ] Health checks funcionando
- [ ] Smoke tests passando
- [ ] DNS configurado (api.financeapp.com)
- [ ] Firewall configurado
- [ ] Auto-scaling configurado (se aplicável)
- [ ] CI/CD testado e funcionando

## 🆘 Rollback em Caso de Problemas

```bash
# 1. Voltar para versão anterior da imagem
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull financeapp:v1.0.0  # Versão anterior
docker-compose -f docker-compose.prod.yml up -d

# 2. Restaurar backup do banco
docker-compose -f docker-compose.prod.yml exec postgres \
  psql -U financeapp financeapp < /backups/financeapp_backup_20240101.sql

# 3. Verificar logs
docker-compose -f docker-compose.prod.yml logs --tail=100 api
```

---

**Pronto para Produção!** 🚀

Para dúvidas ou problemas, consulte [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
