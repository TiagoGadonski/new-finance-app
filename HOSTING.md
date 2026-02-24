# Orbit - Guia de Deploy 24/7

Este guia cobre como colocar o Orbit rodando 24 horas em uma VPS gratuita (Oracle Cloud Free Tier).

---

## Opcao Recomendada: Oracle Cloud Free Tier

### Por que Oracle Cloud?

- **Gratis para sempre** (Always Free Tier) - nao e trial
- **VM com 1 OCPU + 1GB RAM** (AMD) ou ate **4 OCPU + 24GB RAM** (ARM/Ampere) no free tier
- Suficiente para rodar Orbit (4 containers Docker)
- 200GB de boot volume incluido

### Passo 1: Criar Conta na Oracle Cloud

1. Acesse https://cloud.oracle.com/
2. Clique em "Sign Up"
3. Preencha dados (precisa de cartao de credito para verificacao, mas NAO cobra)
4. Selecione "Always Free" ao criar recursos

### Passo 2: Criar VM (Compute Instance)

1. No console Oracle Cloud, va em **Compute > Instances > Create Instance**
2. Configuracao recomendada:
   - **Shape**: VM.Standard.A1.Flex (ARM) - 2 OCPU, 6GB RAM (free tier permite ate 4 OCPU / 24GB)
   - **Image**: Ubuntu 22.04 ou 24.04
   - **Boot Volume**: 50GB (padrao)
   - **SSH Key**: Gere um par de chaves ou use sua chave existente
3. Em **Networking**, marque "Assign a public IPv4 address"
4. Clique em **Create**

### Passo 3: Configurar Security List (Firewall)

No console Oracle Cloud:

1. Va em **Networking > Virtual Cloud Networks**
2. Clique na sua VCN > Subnet > Security List
3. Adicione **Ingress Rules**:

| Port | Protocolo | Source | Descricao |
|------|-----------|--------|-----------|
| 22 | TCP | 0.0.0.0/0 | SSH |
| 3000 | TCP | 0.0.0.0/0 | Frontend |
| 5000 | TCP | 0.0.0.0/0 | API |

### Passo 4: Conectar na VM via SSH

```bash
ssh -i sua-chave.key ubuntu@<IP-PUBLICO>
```

### Passo 5: Instalar Docker

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sudo sh

# Adicionar usuario ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Relogar para aplicar grupo
exit
# Reconecte via SSH
ssh -i sua-chave.key ubuntu@<IP-PUBLICO>

# Verificar instalacao
docker --version
docker compose version
```

### Passo 6: Clonar e Configurar o Projeto

```bash
# Clonar repositorio
git clone <repo-url> ~/orbit
cd ~/orbit

# Criar arquivo .env
cat > .env << 'EOF'
# Banco de dados
DB_USER=postgres
DB_PASSWORD=SuaSenhaSegura123!
DB_NAME=orbit

# JWT - TROQUE ESTA CHAVE!
JWT_SECRET_KEY=sua-chave-secreta-unica-com-pelo-menos-32-caracteres-aqui

# Senha do admin inicial
SEED_ADMIN_PASSWORD=SuaSenhaAdmin123!

# Telegram (para alertas proativos do backend)
TELEGRAM_BOT_TOKEN=seu-bot-token
TELEGRAM_CHAT_ID=seu-chat-id

# Intervalo de avaliacao de alertas (horas)
ALERT_EVAL_INTERVAL=6

# StarBot - segredo compartilhado para autenticacao multi-usuario via bot
# Gere com: openssl rand -hex 32
# Deve ser o MESMO valor usado em FINANCE_BOT_SECRET no .env do StarBot
BOT_SECRET=$(openssl rand -hex 32)
EOF

# Exibir o BOT_SECRET gerado (copie para o .env do StarBot!)
echo "BOT_SECRET gerado:"
grep BOT_SECRET .env
```

### Passo 7: Ajustar docker-compose para Producao

O `NEXT_PUBLIC_API_URL` precisa apontar para o IP publico da VPS:

```bash
# Descubra o IP publico
curl -s ifconfig.me

# Edite o docker-compose.yml
nano docker-compose.yml
```

Altere a linha do frontend:
```yaml
  frontend:
    build:
      args:
        - NEXT_PUBLIC_API_URL=http://<SEU-IP-PUBLICO>:5000/api
```

### Passo 8: Build e Deploy

```bash
cd ~/orbit
docker compose up -d --build
```

Primeira build pode levar 5-10 minutos. Acompanhe os logs:

```bash
# Ver logs de todos os containers
docker compose logs -f

# Ver logs de um container especifico
docker compose logs -f api
```

### Passo 9: Verificar

```bash
# Status dos containers
docker compose ps

# Testar API
curl http://localhost:5000/api/auth/login

# Testar frontend
curl -I http://localhost:3000
```

Acesse no navegador:
- **Frontend**: `http://<SEU-IP-PUBLICO>:3000`
- **API/Swagger**: `http://<SEU-IP-PUBLICO>:5000/swagger`

---

## Manutencao

### Atualizar o Orbit

```bash
cd ~/orbit
git pull
docker compose up -d --build
```

### Backup do Banco de Dados

```bash
# Backup
docker exec orbit-postgres pg_dump -U postgres orbit > backup_$(date +%Y%m%d).sql

# Restaurar
cat backup_20260221.sql | docker exec -i orbit-postgres psql -U postgres orbit
```

### Backup Automatico (cron)

```bash
# Criar script de backup
cat > ~/backup-orbit.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR
docker exec orbit-postgres pg_dump -U postgres orbit > $BACKUP_DIR/orbit_$(date +%Y%m%d_%H%M).sql
# Manter apenas ultimos 30 backups
ls -t $BACKUP_DIR/orbit_*.sql | tail -n +31 | xargs rm -f 2>/dev/null
EOF

chmod +x ~/backup-orbit.sh

# Agendar backup diario as 3h da manha
crontab -e
# Adicionar linha:
# 0 3 * * * /home/ubuntu/backup-orbit.sh
```

### Auto-restart dos Containers

Docker Compose ja reinicia automaticamente os containers se eles cairem (comportamento padrao). Para garantir que o Docker inicie com o sistema:

```bash
sudo systemctl enable docker
```

### Ver Logs

```bash
# Logs em tempo real
docker compose logs -f

# Logs da API apenas
docker compose logs -f api

# Ultimas 100 linhas
docker compose logs --tail=100 api
```

### Monitorar Uso de Recursos

```bash
# CPU e memoria dos containers
docker stats

# Espaco em disco
df -h
docker system df
```

### Limpar Imagens Antigas

```bash
# Remover imagens nao utilizadas
docker image prune -a -f

# Limpar tudo (cuidado)
docker system prune -a -f
```

---

## Opcional: Dominio + HTTPS

Se quiser acessar via dominio (ex: orbit.seudominio.com) com HTTPS:

### 1. Registrar Dominio

Use um servico como Cloudflare (DNS gratuito), Namecheap, ou GoDaddy.

### 2. Apontar DNS

Crie um registro A apontando para o IP publico da VPS.

### 3. Instalar Nginx + Certbot

```bash
sudo apt install nginx certbot python3-certbot-nginx -y

# Configurar Nginx como reverse proxy
sudo cat > /etc/nginx/sites-available/orbit << 'EOF'
server {
    listen 80;
    server_name orbit.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /swagger {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/orbit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obter certificado SSL (gratuito)
sudo certbot --nginx -d orbit.seudominio.com
```

Apos isso, atualize o `NEXT_PUBLIC_API_URL` no docker-compose.yml para usar HTTPS:

```yaml
- NEXT_PUBLIC_API_URL=https://orbit.seudominio.com/api
```

E rebuild: `docker compose up -d --build`

---

## Opcional: Deploy do StarBot na Mesma VPS

Se quiser que o Telegram Bot tambem rode 24/7 com acesso multi-usuario ao Orbit:

```bash
# Clonar StarBot
git clone <starbot-repo-url> ~/starbot
cd ~/starbot

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar dependencias e build
npm install
npm run build

# Configurar variaveis (use o mesmo BOT_SECRET do .env do Orbit!)
cat > .env << 'EOF'
TELEGRAM_BOT_TOKEN=seu-bot-token
ANTHROPIC_API_KEY=sua-api-key
AI_MODEL=claude-sonnet-4-20250514

# Integracao com Orbit - modo multi-usuario (recomendado)
# Cada usuario do Telegram autentica automaticamente com sua propria conta Orbit
FINANCE_API_URL=http://localhost:5000
FINANCE_BOT_SECRET=mesmo-valor-do-BOT_SECRET-no-orbit-env

# Opcional: modo single-user (fallback se nao usar multi-usuario)
# FINANCE_USERNAME=seu-usuario
# FINANCE_PASSWORD=sua-senha

# TELEGRAM_ALLOWED_USERS nao e necessario quando FINANCE_BOT_SECRET esta configurado
# O controle de acesso e feito automaticamente pelo Orbit (so entra quem tem ID cadastrado)
EOF

# Instalar PM2 para manter rodando
sudo npm install -g pm2

# Iniciar com PM2
pm2 start dist/cli/index.js --name starbot -- start
pm2 save

# Configurar auto-start na reinicializacao do servidor
pm2 startup
# Execute o comando que o PM2 exibir (começa com "sudo env PATH=...")
```

### Como adicionar um novo usuario ao bot

1. O admin cria o usuario no painel **Configuracoes > Administracao**
2. O usuario acessa o app e vai em **Perfil > Configuracoes**
3. O usuario copia seu ID do Telegram (encontrado falando com @userinfobot no Telegram)
4. O usuario cola o ID no campo **"ID do Telegram"** e salva
5. Pronto — na proxima mensagem ao bot, ele ja estara autenticado automaticamente

### Comandos uteis do PM2

```bash
pm2 status                    # Ver status de todos os processos
pm2 logs starbot              # Ver logs em tempo real
pm2 logs starbot --lines 50   # Ver ultimas 50 linhas
pm2 restart starbot           # Reiniciar o bot
pm2 restart starbot --update-env  # Reiniciar e recarregar variaveis de ambiente
pm2 stop starbot              # Parar o bot
```

### Atualizar o StarBot

```bash
cd ~/starbot
git pull
npm run build
pm2 restart starbot
```

---

## Resumo de Portas

| Servico | Porta | Acesso |
|---------|-------|--------|
| Frontend | 3000 | Navegador |
| API | 5000 | Swagger / Frontend |
| PostgreSQL | 5432 | Interno (nao expor publicamente) |
| Redis | 6379 | Interno (nao expor publicamente) |

**Importante**: Na Security List da Oracle Cloud, so abra as portas 22, 3000 e 5000. NAO exponha PostgreSQL (5432) e Redis (6379) para a internet.

---

## Troubleshooting

### Container nao inicia
```bash
docker compose logs api  # Ver erro especifico
docker compose down && docker compose up -d --build  # Rebuild completo
```

### Banco de dados corrompido
```bash
docker compose down
docker volume rm orbit_postgres-data  # CUIDADO: perde dados!
docker compose up -d --build  # Recria do zero
```

### Sem espaco em disco
```bash
docker system prune -a -f  # Limpar imagens antigas
sudo journalctl --vacuum-size=100M  # Limpar logs do sistema
```

### API nao conecta no banco
```bash
# Verificar se postgres esta saudavel
docker compose ps
docker compose logs postgres

# Verificar connection string
docker compose exec api env | grep Connection
```
