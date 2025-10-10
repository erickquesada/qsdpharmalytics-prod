# 🚀 Deploy Rápido - QSDPharmalitics

## Passo a Passo Simples

### 1️⃣ **Preparar Ambiente**
```bash
# No seu servidor
cd /opt/QSDPharmalitics-Py

# Executar setup
./scripts/setup-production.sh
```

### 2️⃣ **Configurar Variáveis (IMPORTANTE)**
```bash
# Editar arquivo .env
nano .env

# Alterar OBRIGATORIAMENTE estas linhas:
DB_PASSWORD=sua_senha_forte_aqui
REDIS_PASSWORD=sua_senha_redis_aqui  
SECRET_KEY=sua_chave_jwt_super_secreta_32_caracteres_minimo
```

### 3️⃣ **Deploy Automático**
```bash
# Executar deploy
./scripts/deploy.sh
```

### 4️⃣ **Verificar Status**
```bash
# Ver se tudo está funcionando
docker compose -f docker-compose.prod.yml ps

# Testar API
curl https://pharma.qsdconnect.cloud/api/v1/health
```

## ⚠️ **Solução para o Erro Atual**

O erro que você teve é porque faltam pastas e configurações. Execute:

```bash
# 1. Parar containers
docker compose -f docker-compose.prod.yml down

# 2. Executar setup
./scripts/setup-production.sh

# 3. Configurar .env (OBRIGATÓRIO)
nano .env
# Altere as senhas conforme indicado acima

# 4. Deploy novamente
./scripts/deploy.sh
```

## 🌐 **URLs Finais**
- **API**: https://pharma.qsdconnect.cloud
- **Documentação**: https://pharma.qsdconnect.cloud/api/v1/docs  
- **Health Check**: https://pharma.qsdconnect.cloud/api/v1/health

## 👥 **Usuários Padrão**
- **Admin**: `admin` / `admin`
- **Analista**: `analyst` / `analyst`  
- **Vendedor**: `salesrep` / `sales`

## 🆘 **Comandos Úteis**
```bash
# Ver logs
docker compose -f docker-compose.prod.yml logs backend

# Reiniciar serviço
docker compose -f docker-compose.prod.yml restart backend

# Backup
./scripts/backup.sh

# Parar tudo
docker compose -f docker-compose.prod.yml down
```