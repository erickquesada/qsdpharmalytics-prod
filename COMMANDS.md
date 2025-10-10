# 📋 Comandos Úteis - QSDPharmalitics

## 🚀 **Início Rápido**

### **Desenvolvimento Local**
```bash
# Método mais simples
./scripts/start-local.sh

# Teste da API
./scripts/test-api.sh
```

### **Produção com Docker**
```bash
# Setup inicial
./scripts/setup-production.sh

# Editar configurações
nano .env

# Deploy
./scripts/deploy.sh

# Teste produção
./scripts/test-api.sh prod
```

## 🔧 **Comandos de Desenvolvimento**

### **Backend**
```bash
# Instalar dependências
pip install -r requirements.txt

# Inicializar banco
python scripts/init_db.py

# Rodar servidor
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload

# Testar endpoints
curl http://localhost:8001/api/v1/health
```

### **Banco de Dados**
```bash
# SQLite (desenvolvimento)
sqlite3 pharmalitics.db ".tables"
sqlite3 pharmalitics.db "SELECT * FROM users;"

# PostgreSQL (produção)
docker exec -it pharmalitics_db_prod psql -U pharmalitics_user -d pharmalitics
```

## 🐳 **Comandos Docker**

### **Desenvolvimento**
```bash
# Subir serviços
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar tudo
docker-compose down
```

### **Produção**
```bash
# Subir produção
docker-compose -f docker-compose.prod.yml up -d

# Status dos serviços
docker-compose -f docker-compose.prod.yml ps

# Logs específicos
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs postgres
docker-compose -f docker-compose.prod.yml logs nginx

# Entrar no container
docker-compose -f docker-compose.prod.yml exec backend bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U pharmalitics_user -d pharmalitics

# Reiniciar serviço específico
docker-compose -f docker-compose.prod.yml restart backend

# Parar tudo
docker-compose -f docker-compose.prod.yml down
```

## 🔍 **Debug e Troubleshooting**

### **Verificar API**
```bash
# Health check
curl https://pharma.qsdconnect.cloud/api/v1/health
curl http://localhost:8001/api/v1/health

# Documentação
curl https://pharma.qsdconnect.cloud/api/v1/docs
```

### **Verificar Logs**
```bash
# Logs do backend
docker-compose logs backend
tail -f logs/backend.log

# Logs do nginx
docker-compose logs nginx

# Logs do PostgreSQL
docker-compose logs postgres
```

### **Verificar Conexões**
```bash
# Testar PostgreSQL
docker exec pharmalitics_db_prod pg_isready -U pharmalitics_user

# Testar Redis
docker exec pharmalitics_redis_prod redis-cli ping

# Testar backend
curl -f http://localhost:8001/api/v1/health
```

## 🔐 **Autenticação e Testes**

### **Login de Teste**
```bash
# Admin
curl -X POST "http://localhost:8001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username_or_email": "admin", "password": "admin"}'

# Analyst
curl -X POST "http://localhost:8001/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username_or_email": "analyst", "password": "analyst"}'
```

### **Teste com Token**
```bash
# Salvar token
TOKEN="seu_token_aqui"

# Testar endpoint protegido
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/v1/users/me
```

## 💾 **Backup e Restore**

### **Backup**
```bash
# Backup automático
./scripts/backup.sh

# Backup manual PostgreSQL
docker exec pharmalitics_db_prod pg_dump -U pharmalitics_user pharmalitics > backup.sql
```

### **Restore**
```bash
# Restore PostgreSQL
cat backup.sql | docker exec -i pharmalitics_db_prod psql -U pharmalitics_user -d pharmalitics
```

## 📊 **Monitoramento**

### **Performance**
```bash
# Recursos do Docker
docker stats

# Espaço em disco
df -h
du -sh ./reports ./uploads ./logs

# Processos
ps aux | grep uvicorn
```

### **SSL e Certificados**
```bash
# Verificar SSL
openssl s_client -connect pharma.qsdconnect.cloud:443 -servername pharma.qsdconnect.cloud

# Renovar certificado
docker-compose -f docker-compose.prod.yml exec certbot certbot renew

# Verificar nginx config
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

## 🧹 **Limpeza**

### **Docker**
```bash
# Limpar containers parados
docker container prune

# Limpar imagens não utilizadas
docker image prune

# Limpar volumes não utilizados
docker volume prune

# Limpeza geral
docker system prune -a
```

### **Logs**
```bash
# Limpar logs antigos
find ./logs -name "*.log" -mtime +7 -delete

# Rotacionar logs do Docker
docker-compose -f docker-compose.prod.yml exec backend sh -c "echo '' > /var/log/app.log"
```

## ⚙️ **Configuração**

### **Variáveis de Ambiente**
```bash
# Ver variáveis atuais
docker-compose -f docker-compose.prod.yml exec backend env | grep -E "(DATABASE|REDIS|SECRET)"

# Editar configuração
nano .env
```

### **Nginx**
```bash
# Testar configuração
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Recarregar configuração
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

## 🆘 **Comandos de Emergência**

### **Restart Completo**
```bash
# Parar tudo
docker-compose -f docker-compose.prod.yml down

# Limpar
docker system prune -f

# Subir novamente
docker-compose -f docker-compose.prod.yml up -d
```

### **Reset do Banco**
```bash
# ⚠️ CUIDADO: Apaga todos os dados!
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml exec backend python scripts/init_db.py
```