#!/bin/bash

# QSD Pharmalytics - Setup Environment Script
# Cria e configura o arquivo .env para produção

set -e

echo "========================================"
echo "QSD Pharmalytics - Setup Environment"
echo "========================================"
echo ""

# Verificar se .env já existe
if [ -f .env ]; then
  echo "⚠️  Arquivo .env já existe!"
  read -p "Deseja sobrescrever? (s/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
  fi
fi

# Copiar template
echo "📋 Copiando template..."
cp .env.production.example .env

# Gerar SECRET_KEY
echo ""
echo "🔑 Gerando SECRET_KEY..."
SECRET_KEY=$(openssl rand -hex 32)
sed -i "s/COLE_AQUI_A_SECRET_KEY_GERADA/$SECRET_KEY/" .env
echo "✅ SECRET_KEY gerada!"

# Solicitar senha do PostgreSQL
echo ""
echo "🔐 Configure a senha do PostgreSQL:"
read -s -p "Digite uma senha forte para o banco de dados: " POSTGRES_PASSWORD
echo ""
read -s -p "Confirme a senha: " POSTGRES_PASSWORD_CONFIRM
echo ""

if [ "$POSTGRES_PASSWORD" != "$POSTGRES_PASSWORD_CONFIRM" ]; then
  echo "❌ As senhas não coincidem!"
  exit 1
fi

# Validar senha
if [ ${#POSTGRES_PASSWORD} -lt 12 ]; then
  echo "⚠️  AVISO: Senha muito curta! Recomendado: mínimo 12 caracteres"
  read -p "Continuar mesmo assim? (s/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
  fi
fi

# Aplicar senha
sed -i "s/MUDE_ESTA_SENHA_PARA_ALGO_FORTE_E_SEGURO/$POSTGRES_PASSWORD/" .env
echo "✅ Senha do PostgreSQL configurada!"

# Perguntar sobre domínio
echo ""
echo "🌐 Configuração de Domínio:"
read -p "Seu domínio é qsdpharma.qsdconnect.cloud? (S/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
  read -p "Digite seu domínio (ex: meusite.com): " DOMAIN
  sed -i "s/qsdpharma.qsdconnect.cloud/$DOMAIN/g" .env
  echo "✅ Domínio atualizado para: $DOMAIN"
else
  echo "✅ Mantendo domínio padrão: qsdpharma.qsdconnect.cloud"
fi

# Resumo
echo ""
echo "========================================"
echo "✅ Configuração Concluída!"
echo "========================================"
echo ""
echo "📝 Arquivo .env criado com:"
echo "  - SECRET_KEY: gerada automaticamente"
echo "  - POSTGRES_PASSWORD: configurada"
echo "  - DOMAIN: $(grep "^DOMAIN=" .env | cut -d'=' -f2)"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  1. Revise o arquivo .env se necessário"
echo "  2. NUNCA commite o .env no Git!"
echo "  3. Faça backup da sua senha em local seguro"
echo ""
echo "🚀 Próximo passo:"
echo "  ./install-production.sh"
echo ""
