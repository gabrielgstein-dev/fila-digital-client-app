#!/bin/bash

# 🔍 Script de Verificação - Google OAuth Configuration
# Verifica se todas as configurações estão corretas

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verificação Google OAuth - Fila Digital${NC}"
echo "=============================================="

# Verificar se gcloud está instalado
echo -e "${BLUE}1. Verificando gcloud CLI...${NC}"
if command -v gcloud &> /dev/null; then
    GCLOUD_VERSION=$(gcloud version --format="value(Google Cloud SDK)" 2>/dev/null || gcloud version 2>/dev/null | head -1 | cut -d' ' -f4)
    echo -e "${GREEN}✅ gcloud CLI instalado: $GCLOUD_VERSION${NC}"
else
    echo -e "${RED}❌ gcloud CLI não encontrado${NC}"
    echo "Instale seguindo: GCLOUD-SETUP.md"
    exit 1
fi

# Verificar se está logado
echo -e "${BLUE}2. Verificando autenticação...${NC}"
ACTIVE_ACCOUNT=$(gcloud auth list --filter="status:ACTIVE" --format="value(account)" | head -n1)
if [ ! -z "$ACTIVE_ACCOUNT" ]; then
    echo -e "${GREEN}✅ Logado como: $ACTIVE_ACCOUNT${NC}"
else
    echo -e "${RED}❌ Não logado no Google Cloud${NC}"
    echo "Execute: gcloud auth login"
    exit 1
fi

# Verificar projeto ativo
echo -e "${BLUE}3. Verificando projeto...${NC}"
PROJECT_ID=$(gcloud config get project 2>/dev/null || echo "")
if [ ! -z "$PROJECT_ID" ]; then
    echo -e "${GREEN}✅ Projeto ativo: $PROJECT_ID${NC}"
else
    echo -e "${YELLOW}⚠️  Nenhum projeto configurado${NC}"
    echo "Execute: gcloud config set project SEU_PROJECT_ID"
fi

# Verificar dependências
echo -e "${BLUE}4. Verificando dependências...${NC}"

# jq
if command -v jq &> /dev/null; then
    echo -e "${GREEN}✅ jq instalado${NC}"
else
    echo -e "${RED}❌ jq não encontrado${NC}"
    echo "Instale: sudo apt-get install jq (Ubuntu) ou brew install jq (macOS)"
fi

# curl
if command -v curl &> /dev/null; then
    echo -e "${GREEN}✅ curl instalado${NC}"
else
    echo -e "${RED}❌ curl não encontrado${NC}"
    echo "Instale: sudo apt-get install curl"
fi

# Verificar arquivo de configuração
echo -e "${BLUE}5. Verificando configuração do app...${NC}"
if [ -f "config/google-auth.ts" ]; then
    echo -e "${GREEN}✅ Arquivo config/google-auth.ts existe${NC}"
    
    # Verificar se está configurado
    if grep -q "YOUR_" config/google-auth.ts; then
        echo -e "${YELLOW}⚠️  Configuração ainda contém placeholders${NC}"
        echo "Execute: ./scripts/setup-google-oauth.sh"
    else
        echo -e "${GREEN}✅ Configuração parece estar preenchida${NC}"
        
        # Mostrar client IDs configurados
        WEB_ID=$(grep "WEB_CLIENT_ID:" config/google-auth.ts | cut -d"'" -f2)
        ANDROID_ID=$(grep "ANDROID_CLIENT_ID:" config/google-auth.ts | cut -d"'" -f2)
        IOS_ID=$(grep "IOS_CLIENT_ID:" config/google-auth.ts | cut -d"'" -f2)
        
        echo "  Web Client ID: ${WEB_ID:0:20}..."
        echo "  Android Client ID: ${ANDROID_ID:0:20}..."
        echo "  iOS Client ID: ${IOS_ID:0:20}..."
    fi
else
    echo -e "${RED}❌ Arquivo config/google-auth.ts não encontrado${NC}"
fi

# Verificar configuração da API
echo -e "${BLUE}6. Verificando configuração da API...${NC}"
if [ -f "../fila-api/.env" ]; then
    if grep -q "GOOGLE_CLIENT_ID" ../fila-api/.env; then
        echo -e "${GREEN}✅ Variáveis Google configuradas no .env da API${NC}"
    else
        echo -e "${YELLOW}⚠️  Variáveis Google não encontradas no .env da API${NC}"
        if [ -f "../fila-api/.env.google" ]; then
            echo "Arquivo .env.google existe. Copie as variáveis para .env"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Arquivo .env da API não encontrado${NC}"
fi

# Verificar APIs habilitadas (se projeto configurado)
if [ ! -z "$PROJECT_ID" ]; then
    echo -e "${BLUE}7. Verificando APIs habilitadas...${NC}"
    
    # OAuth2 API
    if gcloud services list --enabled --filter="name:oauth2.googleapis.com" --format="value(name)" | grep -q "oauth2"; then
        echo -e "${GREEN}✅ OAuth2 API habilitada${NC}"
    else
        echo -e "${YELLOW}⚠️  OAuth2 API não habilitada${NC}"
        echo "Execute: gcloud services enable oauth2.googleapis.com"
    fi
    
    # People API
    if gcloud services list --enabled --filter="name:people.googleapis.com" --format="value(name)" | grep -q "people"; then
        echo -e "${GREEN}✅ People API habilitada${NC}"
    else
        echo -e "${YELLOW}⚠️  People API não habilitada${NC}"
        echo "Execute: gcloud services enable people.googleapis.com"
    fi
fi

# Verificar credenciais OAuth (se componente alpha disponível)
if gcloud components list --filter="id:alpha" --format="value(state)" | grep -q "Installed"; then
    if [ ! -z "$PROJECT_ID" ]; then
        echo -e "${BLUE}8. Verificando credenciais OAuth...${NC}"
        
        OAUTH_CLIENTS=$(gcloud alpha iap oauth-clients list --format="value(name)" 2>/dev/null | wc -l)
        if [ "$OAUTH_CLIENTS" -gt 0 ]; then
            echo -e "${GREEN}✅ $OAUTH_CLIENTS credenciais OAuth encontradas${NC}"
        else
            echo -e "${YELLOW}⚠️  Nenhuma credencial OAuth encontrada${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Componente gcloud alpha não instalado${NC}"
    echo "Execute: gcloud components install alpha"
fi

echo ""
echo -e "${BLUE}📋 Resumo da Verificação:${NC}"
echo "=========================="

# Calcular status geral
ISSUES=0

if ! command -v gcloud &> /dev/null; then ((ISSUES++)); fi
if [ -z "$ACTIVE_ACCOUNT" ]; then ((ISSUES++)); fi
if ! command -v jq &> /dev/null; then ((ISSUES++)); fi
if ! command -v curl &> /dev/null; then ((ISSUES++)); fi
if [ ! -f "config/google-auth.ts" ]; then ((ISSUES++)); fi
if [ -f "config/google-auth.ts" ] && grep -q "YOUR_" config/google-auth.ts; then ((ISSUES++)); fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 Tudo configurado corretamente!${NC}"
    echo -e "${GREEN}✅ Pronto para usar Google OAuth${NC}"
    echo ""
    echo -e "${BLUE}🚀 Próximos passos:${NC}"
    echo "1. Execute: npm start"
    echo "2. Teste o login Google no app"
else
    echo -e "${YELLOW}⚠️  $ISSUES problema(s) encontrado(s)${NC}"
    echo ""
    echo -e "${BLUE}🔧 Para resolver:${NC}"
    echo "1. Siga as instruções acima"
    echo "2. Execute: ./scripts/setup-google-oauth.sh"
    echo "3. Execute novamente: ./scripts/check-google-oauth.sh"
fi

echo ""
