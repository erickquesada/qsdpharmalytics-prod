# 🚀 Instruções de Deploy - QSD Pharmalytics

## ✅ Correções Aplicadas

### 1. **Erro BACKEND_CORS_ORIGINS Corrigido** ✅
- Adicionado validador robusto em `backend/core/config.py`
- Agora aceita:
  - JSON válido: `["https://exemplo.com"]`
  - String vazia (usa valor default)
  - Lista separada por vírgulas: `"https://exemplo1.com,https://exemplo2.com"`

### 2. **Imports Corrigidos** ✅
- `alembic/env.py`: Usa `settings.get_database_url()` corretamente
- `scripts/docker-entrypoint.sh`: Imports atualizados para `core.*` e `models.*`
- Adicionado melhor tratamento de erros com traceback

### 3. **Docker Compose Atualizado** ✅
- Variáveis de ambiente passadas corretamente
- Removido hardcoding de `BACKEND_CORS_ORIGINS`
- PostgreSQL configurado via variáveis individuais

### 4. **Logs Melhorados** ✅
- Emojis para fácil identificação de status
- Mensagens mais descritivas
- Melhor tratamento de erros

---

## 📦 Deploy no Servidor de Produção

### **No seu servidor (qsd-svc1):**

#### 1. Navegue até o diretório do projeto
```bash
cd /opt/qsdpharma
```

#### 2. Faça pull das atualizações
```bash
git pull origin main
```

#### 3. Configure o arquivo .env

**Se ainda não existe**, crie o arquivo:
```bash
cp .env.production.example .env
```

**Edite o arquivo .env:**
```bash
nano .env
```

**Configure estas variáveis OBRIGATÓRIAS:**

```bash
# ============================================
# DATABASE
# ============================================
POSTGRES_DB=pharmalitics
POSTGRES_USER=pharmalitics_user
POSTGRES_PASSWORD=MUDE_PARA_UMA_SENHA_FORTE_123!@#

# ============================================
# APPLICATION
# ============================================
APP_NAME=QSDPharmalitics
APP_VERSION=2.0.0
ENVIRONMENT=production
DEBUG=False

# Gere uma chave secreta com: openssl rand -hex 32
SECRET_KEY=cole_aqui_a_chave_gerada_de_32_caracteres

# ============================================
# DOMAIN
# ============================================
DOMAIN=qsdpharma.qsdconnect.cloud
BACKEND_URL=https://qsdpharma.qsdconnect.cloud
FRONTEND_URL=https://qsdpharma.qsdconnect.cloud

# ============================================
# CORS - IMPORTANTE: FORMATO JSON!
# ============================================
BACKEND_CORS_ORIGINS=["https://qsdpharma.qsdconnect.cloud"]

# ============================================
# API
# ============================================
API_V1_STR=/api/v1

# ============================================
# SECURITY
# ============================================
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALGORITHM=HS256

# ============================================
# TIMEZONE
# ============================================
TIMEZONE=America/Sao_Paulo
```

**Salve e feche**: `Ctrl+X`, depois `Y`, depois `Enter`

#### 4. Gerar SECRET_KEY (se ainda não tiver)
```bash
openssl rand -hex 32
```
Copie o resultado e cole no `.env` na variável `SECRET_KEY=`

#### 5. Parar containers existentes
```bash
docker-compose -f docker-compose.production.yml down
```

#### 6. Reconstruir e iniciar
```bash
docker-compose -f docker-compose.production.yml up --build -d
```

#### 7. Verificar logs
```bash
# Ver logs do backend
docker logs qsdpharma_backend -f

# Em outro terminal, ver logs do frontend
docker logs qsdpharma_frontend -f

# Verificar status dos containers
docker ps
```

#### 8. Teste de funcionamento

**Teste da API:**
```bash
curl http://localhost:8001/api/v1/health
```
Deve retornar: `{"status":"healthy"}`

**Teste do Frontend:**
```bash
curl http://localhost:3000
```
Deve retornar HTML da aplicação

---

## 🎯 Saída Esperada dos Logs

### Backend (qsdpharma_backend):
```
🔧 Initializing QSD Pharmalytics...

📊 Waiting for PostgreSQL...
✅ PostgreSQL is ready!
🔄 Running database migrations...
✅ Migrations completed successfully!
👤 Creating initial admin user...
✅ Admin user created successfully!

🚀 Starting application...
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

### Frontend (qsdpharma_frontend):
```
/docker-entrypoint.sh: Configuration complete; ready for start up
```

---

## 🔧 Comandos Úteis

### Ver todos os containers
```bash
docker ps -a
```

### Ver logs em tempo real
```bash
docker logs qsdpharma_backend -f --tail 50
```

### Reiniciar um container específico
```bash
docker restart qsdpharma_backend
docker restart qsdpharma_frontend
```

### Limpar tudo e recomeçar
```bash
# CUIDADO: Isso apaga o banco de dados!
docker-compose -f docker-compose.production.yml down -v
docker-compose -f docker-compose.production.yml up --build -d
```

### Entrar no container do backend
```bash
docker exec -it qsdpharma_backend bash
```

### Ver variáveis de ambiente no container
```bash
docker exec qsdpharma_backend env | grep -E "(POSTGRES|CORS|SECRET)"
```

---

## 🆘 Solução de Problemas

### Erro: "pg_isready: command not found"
O PostgreSQL não está instalado no container. Verifique o Dockerfile.

### Erro: "No module named 'backend'"
Os imports estão incorretos. Verifique se você fez o `git pull` corretamente.

### Erro: "error parsing value for field BACKEND_CORS_ORIGINS"
Verifique o formato no `.env`:
- ✅ CORRETO: `BACKEND_CORS_ORIGINS=["https://qsdpharma.qsdconnect.cloud"]`
- ❌ ERRADO: `BACKEND_CORS_ORIGINS=https://qsdpharma.qsdconnect.cloud`
- ❌ ERRADO: `BACKEND_CORS_ORIGINS=`

### Container reiniciando constantemente
```bash
# Ver o erro específico
docker logs qsdpharma_backend --tail 100

# Verificar se o .env está correto
cat /opt/qsdpharma/.env | grep -E "(POSTGRES_PASSWORD|SECRET_KEY|BACKEND_CORS_ORIGINS)"
```

### Frontend não abre no navegador
1. Verifique se o container está rodando: `docker ps`
2. Verifique os logs: `docker logs qsdpharma_frontend`
3. Verifique se o Nginx está configurado no servidor para redirecionar para a porta 3000

---

## 📊 Portas Utilizadas

- **3000**: Frontend (Nginx)
- **8001**: Backend (FastAPI/Uvicorn)
- **5432**: PostgreSQL (apenas interno, não exposto)

---

## 👤 Usuário Admin Padrão

Após o deploy bem-sucedido, você pode fazer login com:

- **Email**: `admin@qsdpharma.com`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Altere a senha após o primeiro login!

---

## 📝 Checklist Final

- [ ] `git pull origin main` executado
- [ ] Arquivo `.env` criado e configurado
- [ ] `SECRET_KEY` gerada e configurada
- [ ] `POSTGRES_PASSWORD` configurada (senha forte!)
- [ ] `BACKEND_CORS_ORIGINS` no formato JSON correto
- [ ] Containers parados: `docker-compose down`
- [ ] Containers reconstruídos: `docker-compose up --build -d`
- [ ] Logs verificados sem erros
- [ ] API testada: `curl http://localhost:8001/api/v1/health`
- [ ] Frontend testado: `curl http://localhost:3000`
- [ ] Aplicação acessível via `https://qsdpharma.qsdconnect.cloud`

---

## 🎉 Pronto!

Se todos os passos foram seguidos corretamente, sua aplicação deve estar rodando em:

**🌐 https://qsdpharma.qsdconnect.cloud**

---

## 📞 Suporte

Se encontrar problemas, envie:
1. Logs do backend: `docker logs qsdpharma_backend --tail 100 > backend_logs.txt`
2. Logs do frontend: `docker logs qsdpharma_frontend --tail 100 > frontend_logs.txt`
3. Conteúdo do .env (SEM as senhas!): `cat .env | grep -v PASSWORD`
