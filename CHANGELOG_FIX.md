# 📝 Changelog - Correção de Bugs de Deploy

**Data:** 14 de Outubro de 2024
**Versão:** 2.0.1
**Tipo:** Bug Fix - Deploy Production

---

## 🐛 Problemas Identificados

### 1. **Erro BACKEND_CORS_ORIGINS - CRÍTICO**
```
pydantic_settings.sources.SettingsError: error parsing value for field "BACKEND_CORS_ORIGINS"
JSONDecodeError: Expecting value: line 1 column 1 (char 0)
```

**Causa:** 
- Pydantic tentava parsear `BACKEND_CORS_ORIGINS` como JSON
- Quando a variável estava vazia ou mal formatada, causava crash
- Faltava validador para tratar diferentes formatos de entrada

**Impacto:** Backend não iniciava, causando restart loop do container

### 2. **ModuleNotFoundError no docker-entrypoint.sh**
```
ModuleNotFoundError: No module named 'backend.core.database'
```

**Causa:**
- Imports usando `backend.core.database` quando o path correto é `core.database`
- PYTHONPATH não estava configurado corretamente no script

**Impacto:** Admin user não era criado durante a inicialização

### 3. **DATABASE_URL não configurada no Alembic**
**Causa:**
- Alembic tentava usar `settings.DATABASE_URL` diretamente
- Deveria usar o método `settings.get_database_url()`

**Impacto:** Migrations falhavam silenciosamente

---

## ✅ Correções Aplicadas

### 1. **backend/core/config.py**

**Antes:**
```python
BACKEND_CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    ...
]
```

**Depois:**
```python
from pydantic import field_validator
import json

BACKEND_CORS_ORIGINS: Union[List[str], str] = [
    "http://localhost:3000",
    ...
]

@field_validator('BACKEND_CORS_ORIGINS', mode='before')
@classmethod
def parse_cors_origins(cls, v):
    """Parse CORS origins from string or list"""
    if isinstance(v, str):
        if v.strip():
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(',') if origin.strip()]
        return ["http://localhost:3000"]
    return v
```

**Benefícios:**
- ✅ Aceita JSON válido: `["https://exemplo.com"]`
- ✅ Aceita string vazia: retorna default
- ✅ Aceita lista separada por vírgula: `"https://ex1.com,https://ex2.com"`
- ✅ Tratamento robusto de erros

---

### 2. **scripts/docker-entrypoint.sh**

**Antes:**
```python
from backend.core.database import SessionLocal
from backend.models.user import User
```

**Depois:**
```python
import sys
sys.path.insert(0, '/app')
sys.path.insert(0, '/app/backend')

from core.database import SessionLocal
from models.user import User
```

**Benefícios:**
- ✅ Imports corretos para ambiente Docker
- ✅ PYTHONPATH configurado adequadamente
- ✅ Melhor tratamento de erros com traceback
- ✅ Logs com emojis para fácil identificação

**Logs melhorados:**
```
🔧 Initializing QSD Pharmalytics...
📊 Waiting for PostgreSQL...
✅ PostgreSQL is ready!
🔄 Running database migrations...
✅ Migrations completed successfully!
👤 Creating initial admin user...
✅ Admin user created successfully!
🚀 Starting application...
```

---

### 3. **alembic/env.py**

**Antes:**
```python
config.set_main_option('sqlalchemy.url', settings.DATABASE_URL)
```

**Depois:**
```python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
config.set_main_option('sqlalchemy.url', settings.get_database_url())
```

**Benefícios:**
- ✅ Usa o método correto que constrói a URL dinamicamente
- ✅ Suporta PostgreSQL e SQLite automaticamente
- ✅ Path correto para imports

---

### 4. **docker-compose.production.yml**

**Antes:**
```yaml
environment:
  - DATABASE_URL=postgresql://...
  - BACKEND_CORS_ORIGINS=https://qsdpharma.qsdconnect.cloud
```

**Depois:**
```yaml
environment:
  - POSTGRES_SERVER=postgres
  - POSTGRES_DB=${POSTGRES_DB}
  - POSTGRES_USER=${POSTGRES_USER}
  - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
  - POSTGRES_PORT=5432
  # BACKEND_CORS_ORIGINS vem do .env
```

**Benefícios:**
- ✅ Sem hardcoding de valores
- ✅ Todas as variáveis vêm do arquivo .env
- ✅ Mais fácil de configurar e manter
- ✅ Segue boas práticas de 12-factor app

---

## 📊 Arquivos Modificados

```
backend/core/config.py           | +20 -3   (validador CORS)
scripts/docker-entrypoint.sh     | +40 -20  (imports e logs)
alembic/env.py                   | +2  -1   (método correto)
docker-compose.production.yml    | +6  -2   (env vars)
```

---

## 📚 Arquivos Novos (Documentação)

```
LEIA-ME-PRIMEIRO.md     - Quick start para deploy
INSTRUCOES_DEPLOY.md    - Guia completo passo a passo
CORRECAO_RAPIDA.md      - Troubleshooting e soluções
CHANGELOG_FIX.md        - Este arquivo
deploy-fix.sh           - Script automatizado de deploy
```

---

## 🧪 Testes Realizados

### Teste 1: Config com JSON válido
```bash
BACKEND_CORS_ORIGINS='["https://exemplo.com"]'
```
✅ **Resultado:** Parseado corretamente como lista

### Teste 2: Config com string vazia
```bash
BACKEND_CORS_ORIGINS=''
```
✅ **Resultado:** Usa default ["http://localhost:3000"]

### Teste 3: Config com múltiplos valores
```bash
BACKEND_CORS_ORIGINS='["https://ex1.com","https://ex2.com"]'
```
✅ **Resultado:** Parseado corretamente como lista

### Teste 4: Imports no entrypoint
```bash
docker exec qsdpharma_backend python3 -c "from core.database import SessionLocal"
```
✅ **Resultado:** Import bem-sucedido

---

## 🔄 Compatibilidade

- **Python:** 3.11+
- **PostgreSQL:** 15+
- **Docker:** 20.10+
- **Docker Compose:** 2.0+

---

## 🚀 Deploy

### Versão Anterior (com bugs):
```bash
❌ Backend crash loop
❌ Erro de parsing JSON
❌ Admin user não criado
❌ Migrations falhando
```

### Versão Atual (corrigida):
```bash
✅ Backend inicia corretamente
✅ CORS configurado via .env
✅ Admin user criado automaticamente
✅ Migrations executadas com sucesso
✅ Logs claros e informativos
```

---

## 📝 Notas de Migração

### Para atualizar de v2.0.0 para v2.0.1:

1. Fazer backup do .env atual (se existir)
2. Executar `git pull origin main`
3. Verificar/atualizar .env com formato correto de BACKEND_CORS_ORIGINS
4. Executar `./deploy-fix.sh` ou rebuild manual
5. Verificar logs para confirmar inicialização

**Não há breaking changes.** A atualização é compatível com configurações anteriores.

---

## 🙏 Agradecimentos

Correções implementadas com base no feedback do usuário e análise dos logs de produção.

---

## 📞 Suporte

Para problemas relacionados a estas correções:
1. Consulte `INSTRUCOES_DEPLOY.md`
2. Consulte `CORRECAO_RAPIDA.md`
3. Verifique logs: `docker logs qsdpharma_backend --tail 100`
4. Execute health check: `curl http://localhost:8001/api/v1/health`
