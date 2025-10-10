# 🏥 QSDPharmalitics API v2.0

**Advanced Pharmaceutical Analytics & Reporting Platform**

Uma API completa para análise de vendas farmacêuticas, gerenciamento de produtos e relatórios avançados com autenticação baseada em funções e analytics em tempo real.

## 📋 Índice

- [Características](#-características)
- [Instalação Rápida](#-instalação-rápida)
- [Configuração Local](#-configuração-local)
- [Deploy em Produção](#-deploy-em-produção)
- [Configuração de Domínio Cloudflare](#-configuração-cloudflare)
- [API Endpoints](#-api-endpoints)
- [Autenticação](#-autenticação)
- [Banco de Dados](#-banco-de-dados)
- [Monitoramento](#-monitoramento)

## 🚀 Características

### ✅ **Funcionalidades Principais**
- **🔐 Autenticação JWT** com controle de acesso baseado em funções (Admin/Analyst/Sales Rep)
- **💊 Gestão Completa de Produtos** com categorias, preços e dados regulamentares
- **🏪 Gestão de Farmácias** independentes e redes com segmentação de clientes
- **📊 Gestão de Vendas** com tracking completo e gestão de pedidos
- **📈 Analytics Avançados** com métricas de desempenho, análise de market share e previsões
- **📄 Geração de Relatórios** em CSV/Excel/PDF com processamento em background
- **👥 Gestão de Usuários** com sistema completo de administração

### 🛠️ **Stack Técnico**
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL/SQLite
- **Segurança**: JWT, bcrypt, rate limiting, CORS
- **Analytics**: Pandas + NumPy para processamento de dados
- **Containerização**: Docker + Docker Compose
- **Proxy Reverso**: Nginx
- **Cache**: Redis
- **Monitoramento**: Health checks + logs estruturados

---

## 🚀 Instalação Rápida

### **Pré-requisitos**
```bash
- Docker & Docker Compose
- Python 3.11+
- Git
```

### **1. Clone o Repositório**
```bash
git clone https://github.com/seu-usuario/QSDPharmalitics-Py.git
cd QSDPharmalitics-Py
```

### **2. Desenvolvimento Local (Método Simples)**
```bash
# Instalar e iniciar localmente
./scripts/start-local.sh
```

### **3. OU Docker (Método Avançado)**
```bash
# Preparar ambiente
./scripts/setup-production.sh

# Configurar .env (obrigatório)
cp .env.example .env
nano .env  # Editar senhas

# Iniciar com Docker
docker-compose up -d
```

✅ **API estará disponível em**: `http://localhost:8001`
📚 **Documentação**: `http://localhost:8001/api/v1/docs`

---

## ⚙️ Configuração Local

### **Instalação Manual (Desenvolvimento)**

#### **1. Configurar Ambiente Python**
```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt
```

#### **2. Configurar Banco de Dados**
```bash
# PostgreSQL (Recomendado para produção)
DATABASE_URL=postgresql://pharmalitics_user:pharmalitics_pass@localhost:5432/pharmalitics

# ou SQLite (Para desenvolvimento)
DATABASE_URL=sqlite:///./pharmalitics.db
```

#### **3. Configurar Variáveis de Ambiente**
```bash
# Copiar arquivo de configuração
cp .env.example .env

# Editar configurações necessárias
nano .env
```

#### **4. Inicializar Aplicação**
```bash
# Criar tabelas e dados de exemplo
python scripts/init_db.py

# Iniciar servidor de desenvolvimento
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload
```

### **Configuração do .env**
```env
# Aplicação
APP_NAME=QSDPharmalitics
APP_VERSION=2.0.0
ENVIRONMENT=production
SECRET_KEY=sua-chave-super-secreta-mínimo-32-caracteres

# Banco de Dados
DATABASE_URL=postgresql://pharmalitics_user:senha_forte@localhost:5432/pharmalitics

# Redis Cache
REDIS_URL=redis://:senha_redis@localhost:6379

# API Configuration
API_V1_STR=/api/v1
BACKEND_CORS_ORIGINS=["https://pharma.qsdconnect.cloud","https://www.pharma.qsdconnect.cloud"]

# Segurança
ACCESS_TOKEN_EXPIRE_MINUTES=60
PASSWORD_RESET_TOKEN_EXPIRE_HOURS=48

# Rate Limiting
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_PER_HOUR=1000
```

---

## 🌐 Deploy em Produção

### **Configuração para pharma.qsdconnect.cloud**

#### **1. Docker Compose Produção**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: pharmalitics
      POSTGRES_USER: pharmalitics_user  
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  backend:
    build: .
    environment:
      - DATABASE_URL=postgresql://pharmalitics_user:${DB_PASSWORD}@postgres:5432/pharmalitics
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - backend
    restart: unless-stopped

  certbot:
    image: certbot/certbot:latest
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    command: certonly --webroot --webroot-path=/var/www/certbot --email seu@email.com --agree-tos --no-eff-email -d pharma.qsdconnect.cloud

volumes:
  postgres_data:
  redis_data:
```

#### **2. Configuração Nginx para SSL**
```nginx
# nginx/nginx.prod.conf
server {
    listen 80;
    server_name pharma.qsdconnect.cloud www.pharma.qsdconnect.cloud;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name pharma.qsdconnect.cloud www.pharma.qsdconnect.cloud;

    ssl_certificate /etc/letsencrypt/live/pharma.qsdconnect.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pharma.qsdconnect.cloud/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    location /api/ {
        proxy_pass http://backend:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        return 200 '{"message": "QSDPharmalitics API", "docs": "/api/v1/docs"}';
        add_header Content-Type application/json;
    }
}
```

#### **3. Deploy Script**
```bash
#!/bin/bash
# scripts/deploy.sh

echo "🚀 Deploying QSDPharmalitics to Production..."

# Pull latest changes
git pull origin main

# Build and start services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
sleep 30

# Initialize database if needed
docker-compose -f docker-compose.prod.yml exec backend python scripts/init_db.py

# Obtain SSL certificate
docker-compose -f docker-compose.prod.yml exec certbot certbot renew

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx

echo "✅ Deployment completed!"
echo "🌐 API available at: https://pharma.qsdconnect.cloud"
echo "📚 Documentation: https://pharma.qsdconnect.cloud/api/v1/docs"
```

---

## ☁️ Configuração Cloudflare

### **1. DNS Records**
```
Tipo: A
Nome: pharma
Conteúdo: SEU_IP_SERVIDOR
Proxy: ✅ Proxied

Tipo: CNAME  
Nome: www.pharma
Conteúdo: pharma.qsdconnect.cloud
Proxy: ✅ Proxied
```

### **2. SSL/TLS Settings**
```
SSL/TLS encryption mode: Full (strict)
Always Use HTTPS: ✅ On
HTTP Strict Transport Security (HSTS): ✅ Enabled
```

### **3. Security Settings**
```
Security Level: Medium
Bot Fight Mode: ✅ On
DDoS Protection: ✅ Enabled

Page Rules:
- pharma.qsdconnect.cloud/api/*
  - Cache Level: Bypass
  - Security Level: High
```

### **4. Performance Optimization**
```
Caching:
- Browser Cache TTL: 4 hours
- Cloudflare Cache TTL: 2 hours

Speed:
- Auto Minify: CSS, JS, HTML ✅
- Brotli Compression: ✅ On
- Early Hints: ✅ On
```

---

## 🔗 API Endpoints

### **Autenticação**
```http
POST /api/v1/auth/register     # Registro de usuário
POST /api/v1/auth/login        # Login
POST /api/v1/auth/refresh      # Refresh token
POST /api/v1/auth/logout       # Logout
```

### **Usuários**  
```http
GET  /api/v1/users/me          # Perfil atual
PUT  /api/v1/users/me          # Atualizar perfil
GET  /api/v1/users             # Listar usuários (Admin)
PUT  /api/v1/users/{id}        # Atualizar usuário (Admin)
```

### **Produtos**
```http
GET  /api/v1/products          # Listar produtos
POST /api/v1/products          # Criar produto (Admin)
GET  /api/v1/products/{id}     # Obter produto
PUT  /api/v1/products/{id}     # Atualizar produto (Admin)
GET  /api/v1/products/categories # Listar categorias
```

### **Farmácias**
```http
GET  /api/v1/pharmacies        # Listar farmácias
POST /api/v1/pharmacies        # Criar farmácia (Admin)
GET  /api/v1/pharmacies/{id}   # Obter farmácia
PUT  /api/v1/pharmacies/{id}   # Atualizar farmácia (Admin)
```

### **Vendas**
```http
GET  /api/v1/sales             # Listar vendas
POST /api/v1/sales             # Criar venda
GET  /api/v1/sales/{id}        # Obter venda
PUT  /api/v1/sales/{id}        # Atualizar venda
GET  /api/v1/sales/summary/overview # Resumo vendas
```

### **Analytics**
```http
GET  /api/v1/analytics/sales-performance  # Performance vendas
GET  /api/v1/analytics/market-share       # Market share
GET  /api/v1/analytics/dashboard-summary  # Dashboard resumo
GET  /api/v1/analytics/trends            # Análise tendências
```

### **Relatórios**
```http
POST /api/v1/reports/generate             # Gerar relatório
GET  /api/v1/reports                     # Listar relatórios
GET  /api/v1/reports/{id}/download       # Download relatório
```

---

## 🔐 Autenticação

### **Usuários Padrão**
```bash
# Administrador
Usuário: admin
Senha: admin
Função: ADMIN

# Analista  
Usuário: analyst
Senha: analyst
Função: ANALYST

# Representante de Vendas
Usuário: salesrep
Senha: sales  
Função: SALES_REP
```

### **Exemplo de Autenticação**
```bash
# Login
curl -X POST "https://pharma.qsdconnect.cloud/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username_or_email": "admin", "password": "admin"}'

# Resposta
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600
}

# Usar token nas requisições
curl -X GET "https://pharma.qsdconnect.cloud/api/v1/users/me" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💾 Banco de Dados

### **Modelos Principais**
- **Users**: Usuários com controle de acesso
- **Products**: Produtos farmacêuticos com regulamentação
- **ProductCategories**: Categorias de produtos
- **Pharmacies**: Farmácias independentes e redes
- **Sales**: Vendas com tracking completo
- **SalesMetrics**: Métricas agregadas de performance
- **ReportGenerations**: Histórico de relatórios gerados

### **Backup Automatizado**
```bash
# Script de backup (scripts/backup.sh)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup PostgreSQL
docker-compose exec postgres pg_dump \
  -U pharmalitics_user pharmalitics \
  | gzip > $BACKUP_DIR/pharmalitics_$DATE.sql.gz

# Backup arquivos
tar -czf $BACKUP_DIR/files_$DATE.tar.gz ./reports ./uploads

echo "✅ Backup completed: $DATE"
```

### **Restore do Banco**
```bash
# Restore PostgreSQL
gunzip < pharmalitics_20241004.sql.gz | \
docker-compose exec -T postgres psql -U pharmalitics_user -d pharmalitics
```

---

## 📊 Monitoramento

### **Health Checks**
```bash
# Status da API
curl https://pharma.qsdconnect.cloud/api/v1/health

# Status dos serviços
docker-compose ps
docker-compose logs backend
```

### **Métricas de Performance**
```bash
# Logs estruturados
docker-compose logs -f backend | grep "INFO"

# Monitoramento de recursos
docker stats
```

### **Alertas**
```bash
# Script de monitoramento (scripts/monitor.sh)
#!/bin/bash

API_URL="https://pharma.qsdconnect.cloud/api/v1/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE -ne 200 ]; then
    echo "🚨 API Down: HTTP $RESPONSE"
    # Enviar notificação
else
    echo "✅ API Healthy: HTTP $RESPONSE"
fi
```

---

## 🚨 Troubleshooting

### **Problemas Comuns**

#### **1. API não responde**
```bash
# Verificar logs
docker-compose logs backend

# Reiniciar serviços
docker-compose restart backend
```

#### **2. Erro de conexão com banco**
```bash
# Verificar PostgreSQL
docker-compose logs postgres

# Testar conexão
docker-compose exec postgres psql -U pharmalitics_user -d pharmalitics -c "SELECT 1;"
```

#### **3. Erro SSL Cloudflare**
```bash
# Renovar certificado
docker-compose exec certbot certbot renew

# Verificar configuração Nginx
docker-compose exec nginx nginx -t
```

#### **4. Performance lenta**
```bash
# Verificar cache Redis
docker-compose exec redis redis-cli ping

# Monitor de recursos
docker stats
```

---

## 📝 Logs

### **Localização dos Logs**
```bash
# Backend logs
/var/log/supervisor/backend.out.log
/var/log/supervisor/backend.err.log

# Nginx logs  
/var/log/nginx/access.log
/var/log/nginx/error.log

# PostgreSQL logs
docker-compose logs postgres
```

### **Configuração de Log Level**
```env
# .env
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
```

---

## 🤝 Suporte

### **Documentação Adicional**
- 📚 **Swagger UI**: `https://pharma.qsdconnect.cloud/api/v1/docs`
- 📖 **ReDoc**: `https://pharma.qsdconnect.cloud/api/v1/redoc`

### **Contato**
- 📧 Email: suporte@qsdconnect.cloud
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/QSDPharmalitics-Py/issues)

---

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**🏥 QSDPharmalitics v2.0** - *Pharmaceutical Analytics Made Simple*
