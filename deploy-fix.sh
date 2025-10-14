#!/bin/bash

# Script de correção rápida para o erro BACKEND_CORS_ORIGINS
# QSD Pharmalytics - Outubro 2024

set -e

echo "🚀 Script de Correção - QSD Pharmalytics"
echo "========================================"
echo ""

# Verificar se está no diretório correto
if [ ! -f "docker-compose.production.yml" ]; then
    echo "❌ Erro: Este script deve ser executado no diretório /opt/qsdpharma"
    echo "   Execute: cd /opt/qsdpharma && ./deploy-fix.sh"
    exit 1
fi

# Passo 1: Atualizar código
echo "📥 Passo 1: Atualizando código do repositório..."
git pull origin main
echo "✅ Código atualizado!"
echo ""

# Passo 2: Verificar arquivo .env
echo "🔍 Passo 2: Verificando arquivo .env..."
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando a partir do exemplo..."
    cp .env.production.example .env
    echo "📝 IMPORTANTE: Edite o arquivo .env agora!"
    echo "   Execute: nano .env"
    echo ""
    echo "   Variáveis OBRIGATÓRIAS:"
    echo "   - POSTGRES_PASSWORD=SuaSenhaForte123"
    echo "   - SECRET_KEY=cole_aqui_chave_de_32_caracteres"
    echo "   - BACKEND_CORS_ORIGINS=[\"https://qsdpharma.qsdconnect.cloud\"]"
    echo ""
    read -p "Pressione ENTER após editar o arquivo .env..."
else
    echo "✅ Arquivo .env encontrado!"
fi
echo ""

# Passo 3: Validar variáveis críticas
echo "🔍 Passo 3: Validando variáveis críticas..."

# Verificar POSTGRES_PASSWORD
if ! grep -q "^POSTGRES_PASSWORD=.\+" .env; then
    echo "❌ Erro: POSTGRES_PASSWORD não está configurada no .env"
    echo "   Edite o arquivo: nano .env"
    exit 1
fi

# Verificar SECRET_KEY
if ! grep -q "^SECRET_KEY=.\+" .env; then
    echo "❌ Erro: SECRET_KEY não está configurada no .env"
    echo "   Gere uma com: openssl rand -hex 32"
    echo "   Depois edite o arquivo: nano .env"
    exit 1
fi

# Verificar BACKEND_CORS_ORIGINS
if ! grep -q "^BACKEND_CORS_ORIGINS=" .env; then
    echo "⚠️  BACKEND_CORS_ORIGINS não encontrada. Adicionando..."
    echo 'BACKEND_CORS_ORIGINS=["https://qsdpharma.qsdconnect.cloud"]' >> .env
fi

echo "✅ Variáveis validadas!"
echo ""

# Passo 4: Parar containers
echo "🛑 Passo 4: Parando containers existentes..."
docker-compose -f docker-compose.production.yml down
echo "✅ Containers parados!"
echo ""

# Passo 5: Reconstruir e iniciar
echo "🔨 Passo 5: Reconstruindo e iniciando containers..."
docker-compose -f docker-compose.production.yml up --build -d
echo "✅ Containers iniciados!"
echo ""

# Passo 6: Aguardar inicialização
echo "⏳ Passo 6: Aguardando inicialização dos containers..."
sleep 10

# Passo 7: Verificar status
echo "🔍 Passo 7: Verificando status..."
echo ""
docker ps --filter "name=qsdpharma" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Passo 8: Testar API
echo "🧪 Passo 8: Testando API..."
sleep 5
if curl -f -s http://localhost:8001/api/v1/health > /dev/null 2>&1; then
    echo "✅ API está respondendo!"
else
    echo "⚠️  API ainda não está respondendo. Aguarde alguns segundos e verifique os logs."
fi
echo ""

# Passo 9: Mostrar logs
echo "📊 Passo 9: Últimas linhas dos logs:"
echo ""
echo "--- Backend ---"
docker logs qsdpharma_backend --tail 15
echo ""
echo "--- Frontend ---"
docker logs qsdpharma_frontend --tail 5
echo ""

# Resumo final
echo "========================================"
echo "✅ Deploy concluído!"
echo ""
echo "🌐 Acesse sua aplicação em:"
echo "   https://qsdpharma.qsdconnect.cloud"
echo ""
echo "👤 Login padrão:"
echo "   Email: admin@qsdpharma.com"
echo "   Senha: admin123"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs backend:  docker logs qsdpharma_backend -f"
echo "   Ver logs frontend: docker logs qsdpharma_frontend -f"
echo "   Reiniciar backend: docker restart qsdpharma_backend"
echo "   Status: docker ps"
echo ""
echo "🆘 Se houver problemas:"
echo "   Leia: cat INSTRUCOES_DEPLOY.md"
echo "   ou:   cat CORRECAO_RAPIDA.md"
echo ""
