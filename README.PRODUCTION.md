# QSD Pharmalytics - Guia de Instalação em Produção

## 📦 Pré-requisitos

- Ubuntu Server 24.04 LTS
- Docker e Docker Compose instalados
- Cloudflare Tunnel configurado para `qsdpharma.qsdconnect.cloud`
- Mínimo 2GB RAM
- Mínimo 10GB de espaço em disco

## 🚀 Instalação Rápida

### Passo 1: Instalar Docker (se ainda não estiver instalado)

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose -y

# Verificar instalação
docker --version
docker-compose --version
```

**IMPORTANTE**: Faça logout e login novamente para aplicar as permissões do grupo docker.

### Passo 2: Clonar o Repositório

```bash
cd /opt
sudo git clone https://github.com/erickquesada/qsdpharmalytics-prod.git qsdpharma
cd qsdpharma
sudo chown -R $USER:$USER .
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.production.example .env

# Gerar SECRET_KEY segura
SECRET_KEY=$(openssl rand -hex 32)
echo "SECRET_KEY gerado: $SECRET_KEY"

# Editar arquivo .env
nano .env
```

**Configure os seguintes valores no `.env`:**

```bash
POSTGRES_DB=pharmalitics
POSTGRES_USER=pharmalitics_user
POSTGRES_PASSWORD=SUA_SENHA_SUPER_SEGURA_AQUI  # Mude isso!
SECRET_KEY=cole_a_chave_gerada_acima_aqui
ENVIRONMENT=production
DEBUG=False
DOMAIN=qsdpharma.qsdconnect.cloud
BACKEND_URL=https://qsdpharma.qsdconnect.cloud
BACKEND_CORS_ORIGINS=https://qsdpharma.qsdconnect.cloud
```

### Passo 4: Configurar Cloudflare Tunnel

Certifique-se de que seu Cloudflare Tunnel está configurado para:

```yaml
ingress:
  # Backend API
  - hostname: qsdpharma.qsdconnect.cloud
    service: http://localhost:8001
    originRequest:
      noTLSVerify: true
  
  # Frontend (opcional, se quiser servir o frontend separadamente)
  # - hostname: qsdpharma.qsdconnect.cloud
  #   service: http://localhost:3000
  
  - service: http_status:404
```

**OU configure para usar o backend como proxy reverso:**

```yaml
ingress:
  - hostname: qsdpharma.qsdconnect.cloud
    service: http://localhost:8001
```

### Passo 5: Build e Deploy

```bash
# Build das imagens
docker-compose -f docker-compose.production.yml build

# Iniciar containers
docker-compose -f docker-compose.production.yml up -d

# Verificar status
docker-compose -f docker-compose.production.yml ps

# Ver logs
docker-compose -f docker-compose.production.yml logs -f
```

### Passo 6: Verificar Instalação

```bash
# Testar backend
curl http://localhost:8001/api/v1/health

# Testar frontend
curl http://localhost:3000

# Testar via domínio (depois do Cloudflare Tunnel)
curl https://qsdpharma.qsdconnect.cloud/api/v1/health
```

## 🔐 Usuário Admin Padrão

Após a instalação, um usuário admin é criado automaticamente:

- **Email:** admin@qsdpharma.com
- **Username:** admin
- **Senha:** admin123

**⚠️ IMPORTANTE: Mude a senha do admin imediatamente após o primeiro login!**

## 🛠️ Comandos Úteis

### Gerenciamento de Containers

```bash
# Parar todos os containers
docker-compose -f docker-compose.production.yml stop

# Iniciar containers
docker-compose -f docker-compose.production.yml start

# Reiniciar containers
docker-compose -f docker-compose.production.yml restart

# Parar e remover containers
docker-compose -f docker-compose.production.yml down

# Ver logs em tempo real
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend
```

### Backup do Banco de Dados

```bash
# Criar backup
docker exec qsdpharma_postgres pg_dump -U pharmalitics_user pharmalitics > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
cat backup_20240101_120000.sql | docker exec -i qsdpharma_postgres psql -U pharmalitics_user pharmalitics
```

### Atualizar Aplicação

```bash
# Parar containers
docker-compose -f docker-compose.production.yml down

# Puxar atualizações do Git
git pull origin main

# Rebuild e restart
docker-compose -f docker-compose.production.yml up -d --build
```

## ⚠️ Troubleshooting

### Problema 1: Containers não iniciam

```bash
# Verificar logs
docker-compose -f docker-compose.production.yml logs

# Verificar status do Docker
sudo systemctl status docker

# Reiniciar Docker
sudo systemctl restart docker
```

### Problema 2: Backend não conecta ao PostgreSQL

```bash
# Verificar se o PostgreSQL está rodando
docker-compose -f docker-compose.production.yml ps postgres

# Ver logs do PostgreSQL
docker-compose -f docker-compose.production.yml logs postgres

# Verificar conexão manual
docker exec -it qsdpharma_postgres psql -U pharmalitics_user -d pharmalitics
```

### Problema 3: Erro de CORS

```bash
# Verificar se BACKEND_CORS_ORIGINS está correto no .env
cat .env | grep CORS

# Deve conter: BACKEND_CORS_ORIGINS=https://qsdpharma.qsdconnect.cloud
```

### Problema 4: Frontend não carrega

```bash
# Verificar se o build foi bem-sucedido
docker-compose -f docker-compose.production.yml logs frontend

# Rebuild do frontend
docker-compose -f docker-compose.production.yml up -d --build frontend
```

### Problema 5: Cloudflare Tunnel não funciona

```bash
# Verificar status do cloudflared
sudo systemctl status cloudflared

# Ver logs do cloudflared
sudo journalctl -u cloudflared -f

# Reiniciar cloudflared
sudo systemctl restart cloudflared
```

## 🔒 Segurança

### Recomendações de Segurança

1. **Mude senhas padrão**
   - Admin do sistema
   - PostgreSQL

2. **Use HTTPS sempre**
   - Cloudflare Tunnel já provê HTTPS

3. **Configure firewall**
```bash
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP (opcional)
sudo ufw allow 443/tcp # HTTPS (opcional)
sudo ufw enable
```

4. **Backups regulares**
   - Configure cron job para backups automáticos

5. **Monitore logs**
```bash
# Configurar logrotate para evitar logs grandes
sudo nano /etc/logrotate.d/docker-containers
```

## 📊 Monitoramento

### Verificar Uso de Recursos

```bash
# Uso de recursos dos containers
docker stats

# Espaço em disco
df -h
docker system df

# Limpar recursos não utilizados
docker system prune -a --volumes
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose -f docker-compose.production.yml logs`
2. Verifique este guia de troubleshooting
3. Verifique se todas as variáveis de ambiente estão corretas
4. Verifique se o Cloudflare Tunnel está funcionando

## ✅ Checklist de Instalação

- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado
- [ ] Arquivo .env configurado com senhas seguras
- [ ] SECRET_KEY gerada
- [ ] Cloudflare Tunnel configurado
- [ ] Containers iniciados com sucesso
- [ ] Health check do backend retorna OK
- [ ] Frontend acessível via navegador
- [ ] Login funciona corretamente
- [ ] Senha do admin alterada
- [ ] Backup do banco configurado

---

**🎉 Parabéns! Seu QSD Pharmalytics está rodando em produção!**

Acesse: https://qsdpharma.qsdconnect.cloud
