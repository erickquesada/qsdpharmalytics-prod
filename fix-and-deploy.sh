#!/bin/bash

echo "🔧 Corrigindo e fazendo deploy do QSD Pharmalytics..."
echo ""

# Parar containers existentes se houver
echo "1. Parando containers existentes..."
docker-compose -f docker-compose.production.yml down 2>/dev/null || true

# Limpar imagens antigas
echo "2. Limpando imagens antigas..."
docker image prune -f

# Rebuild
echo "3. Construindo containers..."
docker-compose -f docker-compose.production.yml build --no-cache

# Iniciar
echo "4. Iniciando containers..."
docker-compose -f docker-compose.production.yml up -d

# Aguardar
echo "5. Aguardando containers iniciarem..."
sleep 15

# Status
echo "6. Verificando status..."
docker-compose -f docker-compose.production.yml ps

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "Teste o backend:"
echo "  curl http://localhost:8001/api/v1/health"
echo ""
echo "Ver logs:"
echo "  docker-compose -f docker-compose.production.yml logs -f"
echo ""
