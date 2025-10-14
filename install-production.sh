#!/bin/bash

# QSD Pharmalytics - Script de Instala\u00e7\u00e3o Automatizada
# Para Ubuntu Server 24.04 LTS

set -e

echo "======================================"
echo "QSD Pharmalytics - Instala\u00e7\u00e3o"
echo "======================================"
echo ""

# Verificar se \u00e9 root ou tem sudo
if [ "$EUID" -ne 0 ] && ! sudo -v &> /dev/null; then
  echo "Este script precisa de permiss\u00f5es sudo"
  exit 1
fi

# Verificar Ubuntu
if [ ! -f /etc/lsb-release ]; then
  echo "Este script \u00e9 apenas para Ubuntu"
  exit 1
fi

echo "1. Verificando Docker..."
if ! command -v docker &> /dev/null; then
  echo "   Docker n\u00e3o encontrado. Instalando..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  rm get-docker.sh
  echo "   \u2705 Docker instalado!"
else
  echo "   \u2705 Docker j\u00e1 instalado"
fi

echo ""
echo "2. Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
  echo "   Instalando Docker Compose..."
  sudo apt update
  sudo apt install -y docker-compose
  echo "   \u2705 Docker Compose instalado!"
else
  echo "   \u2705 Docker Compose j\u00e1 instalado"
fi

echo ""
echo "3. Configurando ambiente..."

# Criar arquivo .env se n\u00e3o existir
if [ ! -f .env ]; then
  echo "   Criando arquivo .env..."
  cp .env.production.example .env
  
  # Gerar SECRET_KEY
  SECRET_KEY=$(openssl rand -hex 32)
  sed -i "s/YOUR_SECRET_KEY_HERE_USE_openssl_rand_hex_32/$SECRET_KEY/" .env
  
  echo ""
  echo "   \u26a0\ufe0f  IMPORTANTE: Edite o arquivo .env e configure:"
  echo "   - POSTGRES_PASSWORD (senha segura para o banco)"
  echo ""
  echo "   SECRET_KEY j\u00e1 foi gerada automaticamente"
  echo ""
  read -p "   Pressione ENTER para editar o .env agora..."
  ${EDITOR:-nano} .env
else
  echo "   \u2705 Arquivo .env j\u00e1 existe"
fi

echo ""
echo "4. Construindo containers..."
docker-compose -f docker-compose.production.yml build

echo ""
echo "5. Iniciando containers..."
docker-compose -f docker-compose.production.yml up -d

echo ""
echo "6. Aguardando containers iniciarem..."
sleep 10

echo ""
echo "7. Verificando status..."
docker-compose -f docker-compose.production.yml ps

echo ""
echo "======================================"
echo "\u2705 Instala\u00e7\u00e3o Conclu\u00edda!"
echo "======================================"
echo ""
echo "Pr\u00f3ximos passos:"
echo ""
echo "1. Verifique se os containers est\u00e3o rodando:"
echo "   docker-compose -f docker-compose.production.yml ps"
echo ""
echo "2. Teste o backend:"
echo "   curl http://localhost:8001/api/v1/health"
echo ""
echo "3. Configure seu Cloudflare Tunnel para:"
echo "   qsdpharma.qsdconnect.cloud -> http://localhost:8001"
echo ""
echo "4. Acesse: https://qsdpharma.qsdconnect.cloud"
echo ""
echo "5. Login padr\u00e3o:"
echo "   Email: admin@qsdpharma.com"
echo "   Senha: admin123"
echo "   \u26a0\ufe0f  MUDE A SENHA IMEDIATAMENTE!"
echo ""
echo "Para ver logs:"
echo "   docker-compose -f docker-compose.production.yml logs -f"
echo ""
echo "Para mais informa\u00e7\u00f5es, leia: README.PRODUCTION.md"
echo ""
