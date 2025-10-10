# 📁 Estrutura Completa - QSDPharmalitics

## 📋 **Arquivos Principais**

### **🔧 Configuração**
- `.env` - Configuração de desenvolvimento
- `.env.example` - Template de configuração
- `.env.prod` - Configuração de produção
- `.dockerignore` - Arquivos ignorados no Docker
- `docker-compose.yml` - Docker para desenvolvimento
- `docker-compose.prod.yml` - Docker para produção
- `Dockerfile.backend` - Imagem do backend
- `Dockerfile.frontend` - Imagem do frontend

### **📚 Documentação**
- `README.md` - Documentação completa
- `DEPLOY.md` - Guia de deploy rápido
- `COMMANDS.md` - Comandos úteis
- `FILES.md` - Este arquivo (estrutura)

### **🐍 Backend Python**

#### **Core**
- `backend/main.py` - Aplicação FastAPI principal
- `backend/core/config.py` - Configurações
- `backend/core/security.py` - Autenticação JWT
- `backend/database/base.py` - Conexão banco de dados

#### **Modelos**
- `backend/models/user.py` - Usuários com roles
- `backend/models/products.py` - Produtos farmacêuticos
- `backend/models/pharmacies.py` - Farmácias independentes/redes
- `backend/models/sales.py` - Vendas com tracking
- `backend/models/analytics.py` - Métricas e relatórios

#### **Schemas/APIs**
- `backend/schemas/user.py` - Validação usuários
- `backend/schemas/products.py` - Validação produtos
- `backend/schemas/pharmacies.py` - Validação farmácias
- `backend/schemas/sales.py` - Validação vendas
- `backend/schemas/analytics.py` - Validação analytics
- `backend/schemas/reports.py` - Validação relatórios

#### **Endpoints**
- `backend/api/dependencies.py` - Autenticação/autorização
- `backend/api/v1/auth.py` - Login/registro
- `backend/api/v1/users.py` - Gestão usuários
- `backend/api/v1/products.py` - CRUD produtos
- `backend/api/v1/pharmacies.py` - CRUD farmácias
- `backend/api/v1/sales.py` - CRUD vendas
- `backend/api/v1/analytics.py` - Analytics avançados
- `backend/api/v1/reports.py` - Geração relatórios

### **⚛️ Frontend React**

#### **Estrutura Principal**
- `frontend/src/App.js` - Componente principal
- `frontend/src/App.css` - Estilos globais
- `frontend/package.json` - Dependências Node.js
- `frontend/tailwind.config.js` - Configuração Tailwind

#### **Configurações**
- `frontend/.env` - Variáveis ambiente frontend
- `frontend/craco.config.js` - Configuração build
- `frontend/postcss.config.js` - PostCSS
- `frontend/components.json` - Componentes Shadcn/UI

### **🛠️ Scripts de Automação**

#### **Setup e Deploy**
- `scripts/setup-production.sh` - Setup inicial produção
- `scripts/deploy.sh` - Deploy automatizado
- `scripts/backup.sh` - Backup PostgreSQL

#### **Desenvolvimento**
- `scripts/start-local.sh` - Iniciar desenvolvimento local
- `scripts/init_db.py` - Inicializar banco de dados
- `scripts/test-api.sh` - Testar endpoints

#### **Utilitários**
- `scripts/start_dev.py` - Servidor desenvolvimento

### **🔗 Infraestrutura**

#### **Nginx**
- `nginx/nginx.conf` - Configuração desenvolvimento
- `nginx/nginx.prod.conf` - Configuração produção (criado pelo setup)

#### **Banco de Dados**
- `alembic.ini` - Configuração migrações
- `alembic/env.py` - Environment Alembic
- `alembic/script.py.mako` - Template migrações
- `pharmalitics.db` - SQLite desenvolvimento

#### **Dependências**
- `requirements.txt` - Dependências Python
- `frontend/yarn.lock` - Lock file Node.js

### **📊 Dados e Logs**
- `reports/` - Relatórios gerados
- `uploads/` - Arquivos upload
- `logs/` - Logs aplicação
- `static/` - Arquivos estáticos
- `backups/` - Backups banco

## 🎯 **Funcionalidades Implementadas**

### **✅ Autenticação & Autorização**
- JWT com refresh tokens
- Roles: Admin, Analyst, Sales Rep
- Endpoints protegidos por role
- Password hashing seguro

### **✅ Gestão Completa**
- **Produtos**: Categorias, preços, regulamentação
- **Farmácias**: Independentes/redes, segmentação
- **Vendas**: Tracking completo, orders
- **Usuários**: Gestão de perfis e permissões

### **✅ Analytics Avançados**
- Métricas de performance
- Análise de market share  
- Trends e forecasting
- Dashboard com KPIs

### **✅ Relatórios**
- Geração CSV/Excel/PDF
- Processamento background
- Filtros avançados
- Download seguro

### **✅ Infraestrutura**
- Docker completo (dev + prod)
- PostgreSQL + Redis + Nginx
- SSL/TLS com Let's Encrypt
- Health checks e monitoring

## 🌐 **URLs de Acesso**

### **Desenvolvimento**
- API: `http://localhost:8001`
- Docs: `http://localhost:8001/api/v1/docs`
- Frontend: `http://localhost:3000`

### **Produção**
- API: `https://pharma.qsdconnect.cloud`
- Docs: `https://pharma.qsdconnect.cloud/api/v1/docs`
- Health: `https://pharma.qsdconnect.cloud/api/v1/health`

## 👥 **Usuários Padrão**

```bash
# Administrador
Username: admin
Password: admin
Role: ADMIN

# Analista
Username: analyst  
Password: analyst
Role: ANALYST

# Vendedor
Username: salesrep
Password: sales
Role: SALES_REP
```

## 🚀 **Quick Start**

### **Desenvolvimento Local**
```bash
./scripts/start-local.sh
```

### **Produção Docker**
```bash
./scripts/setup-production.sh
nano .env  # Configure senhas
./scripts/deploy.sh
```

### **Teste da API**
```bash
./scripts/test-api.sh
./scripts/test-api.sh prod  # Para produção
```

## 📈 **Stack Tecnológico**

### **Backend**
- **FastAPI** - Framework API
- **SQLAlchemy** - ORM
- **PostgreSQL** - Banco produção
- **SQLite** - Banco desenvolvimento
- **JWT** - Autenticação
- **Pandas** - Analytics
- **ReportLab** - Geração PDFs

### **Frontend** 
- **React** - Interface
- **Tailwind CSS** - Styling
- **Radix UI** - Componentes
- **Axios** - HTTP client

### **Infraestrutura**
- **Docker** - Containerização
- **Nginx** - Proxy reverso
- **Redis** - Cache
- **Let's Encrypt** - SSL
- **Cloudflare** - CDN/Security

---

**🏥 QSDPharmalitics v2.0** - Pharmaceutical Analytics Made Simple