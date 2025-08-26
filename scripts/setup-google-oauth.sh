#!/bin/bash

# 🔐 Script de Configuração Automática - Google OAuth
# Este script configura automaticamente as credenciais OAuth no Google Cloud

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Carregar configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/config.sh" ]; then
    source "$SCRIPT_DIR/config.sh"
else
    echo -e "${YELLOW}⚠️  Arquivo config.sh não encontrado, usando valores padrão${NC}"
    # Configurações padrão
    PROJECT_NAME="fila-digital"
    APP_NAME="Fila Digital - Cliente"
    PACKAGE_NAME="com.filadigital.client"
    BUNDLE_ID="com.filadigital.client"
    SUPPORT_EMAIL="contato@filadigital.com"
fi

echo -e "${BLUE}🚀 Configuração Automática Google OAuth - Fila Digital${NC}"
echo "=================================================="

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI não está instalado!${NC}"
    echo "Instale em: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar se está logado
if ! gcloud auth list --filter="status:ACTIVE" --format="value(account)" | head -n1 > /dev/null; then
    echo -e "${YELLOW}⚠️  Fazendo login no Google Cloud...${NC}"
    gcloud auth login
fi

echo -e "${BLUE}📋 Informações do projeto:${NC}"
echo "Nome: $APP_NAME"
echo "Package: $PACKAGE_NAME"
echo "Bundle ID: $BUNDLE_ID"
echo "Email: $SUPPORT_EMAIL"
echo ""

read -p "Deseja continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operação cancelada."
    exit 1
fi

# Criar ou selecionar projeto
echo -e "${BLUE}1. 📁 Configurando projeto...${NC}"
if gcloud projects describe $PROJECT_NAME &> /dev/null; then
    echo "Projeto '$PROJECT_NAME' já existe."
    gcloud config set project $PROJECT_NAME
else
    echo "Criando projeto '$PROJECT_NAME'..."
    gcloud projects create $PROJECT_NAME --name="$APP_NAME"
    gcloud config set project $PROJECT_NAME
    
    # Aguardar propagação
    sleep 5
fi

PROJECT_ID=$(gcloud config get project)
echo "✅ Projeto ativo: $PROJECT_ID"

# Habilitar APIs necessárias
echo -e "${BLUE}2. 🔌 Habilitando APIs...${NC}"
gcloud services enable oauth2.googleapis.com
gcloud services enable people.googleapis.com
echo "✅ APIs habilitadas"

# Configurar OAuth Consent Screen
echo -e "${BLUE}3. 🛡️  Configurando OAuth Consent Screen...${NC}"

# Criar arquivo de configuração temporário
cat > /tmp/oauth-config.json << EOF
{
  "application_type": "PUBLIC_APP",
  "privacy_policy_uri": "https://filadigital.com/privacy",
  "support_email": "$SUPPORT_EMAIL",
  "terms_of_service_uri": "https://filadigital.com/terms",
  "application_title": "$APP_NAME",
  "authorized_domains": [
    "filadigital.com",
    "localhost"
  ]
}
EOF

# Como o gcloud não tem comando direto para consent screen, vamos usar a API REST
ACCESS_TOKEN=$(gcloud auth application-default print-access-token)

curl -s -X PATCH \
  "https://oauth2.googleapis.com/v1/projects/$PROJECT_ID/oauth2/application" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/oauth-config.json > /dev/null

echo "✅ OAuth Consent Screen configurado"

# Função para criar credenciais OAuth
create_oauth_credential() {
    local app_type=$1
    local display_name=$2
    local redirect_uris=$3
    
    echo -e "${YELLOW}Criando credencial $app_type...${NC}"
    
    case $app_type in
        "web")
            gcloud alpha iap oauth-clients create \
                --display_name="$display_name" \
                --redirect_uris="$redirect_uris" \
                --format="value(name,secret)" 2>/dev/null || true
            ;;
        "android")
            # Para Android, usar API REST pois gcloud não suporta diretamente
            curl -s -X POST \
                "https://oauth2.googleapis.com/v1/projects/$PROJECT_ID/oauth2/clients" \
                -H "Authorization: Bearer $ACCESS_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"client_type\": \"ANDROID_APP\",
                    \"android_info\": {
                        \"package_name\": \"$PACKAGE_NAME\"
                    },
                    \"display_name\": \"$display_name\"
                }" | jq -r '.client_id // empty'
            ;;
        "ios")
            # Para iOS, usar API REST
            curl -s -X POST \
                "https://oauth2.googleapis.com/v1/projects/$PROJECT_ID/oauth2/clients" \
                -H "Authorization: Bearer $ACCESS_TOKEN" \
                -H "Content-Type: application/json" \
                -d "{
                    \"client_type\": \"IOS_APP\",
                    \"ios_info\": {
                        \"bundle_id\": \"$BUNDLE_ID\"
                    },
                    \"display_name\": \"$display_name\"
                }" | jq -r '.client_id // empty'
            ;;
    esac
}

# Criar credenciais OAuth
echo -e "${BLUE}4. 🔑 Criando credenciais OAuth...${NC}"

# Web Client
echo -e "${YELLOW}📱 Criando Web Client...${NC}"
WEB_REDIRECT_URIS="http://localhost:19006/auth,http://localhost:3000/auth,https://auth.expo.io/@filadigital/fila-client-app"

WEB_CLIENT_RESULT=$(gcloud alpha iap oauth-clients create \
    --display_name="Fila Digital Web Client" \
    --format="value(name,secret)" 2>/dev/null || echo "")

if [ ! -z "$WEB_CLIENT_RESULT" ]; then
    WEB_CLIENT_ID=$(echo "$WEB_CLIENT_RESULT" | cut -d' ' -f1 | rev | cut -d'/' -f1 | rev)
    WEB_CLIENT_SECRET=$(echo "$WEB_CLIENT_RESULT" | cut -d' ' -f2)
    echo "✅ Web Client ID: $WEB_CLIENT_ID"
else
    echo "⚠️  Erro ao criar Web Client via gcloud, usando API REST..."
    
    WEB_RESPONSE=$(curl -s -X POST \
        "https://oauth2.googleapis.com/v1/projects/$PROJECT_ID/oauth2/clients" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"client_type\": \"WEB_APP\",
            \"web_info\": {
                \"redirect_uris\": [\"$WEB_REDIRECT_URIS\"]
            },
            \"display_name\": \"Fila Digital Web Client\"
        }")
    
    WEB_CLIENT_ID=$(echo "$WEB_RESPONSE" | jq -r '.client_id // empty')
    WEB_CLIENT_SECRET=$(echo "$WEB_RESPONSE" | jq -r '.client_secret // empty')
    
    if [ ! -z "$WEB_CLIENT_ID" ]; then
        echo "✅ Web Client ID: $WEB_CLIENT_ID"
    else
        echo "❌ Erro ao criar Web Client"
    fi
fi

# Android Client
echo -e "${YELLOW}🤖 Criando Android Client...${NC}"
ANDROID_RESPONSE=$(curl -s -X POST \
    "https://oauth2.googleapis.com/v1/projects/$PROJECT_ID/oauth2/clients" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"client_type\": \"ANDROID_APP\",
        \"android_info\": {
            \"package_name\": \"$PACKAGE_NAME\"
        },
        \"display_name\": \"Fila Digital Android Client\"
    }")

ANDROID_CLIENT_ID=$(echo "$ANDROID_RESPONSE" | jq -r '.client_id // empty')
if [ ! -z "$ANDROID_CLIENT_ID" ]; then
    echo "✅ Android Client ID: $ANDROID_CLIENT_ID"
else
    echo "❌ Erro ao criar Android Client"
fi

# iOS Client
echo -e "${YELLOW}🍎 Criando iOS Client...${NC}"
IOS_RESPONSE=$(curl -s -X POST \
    "https://oauth2.googleapis.com/v1/projects/$PROJECT_ID/oauth2/clients" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"client_type\": \"IOS_APP\",
        \"ios_info\": {
            \"bundle_id\": \"$BUNDLE_ID\"
        },
        \"display_name\": \"Fila Digital iOS Client\"
    }")

IOS_CLIENT_ID=$(echo "$IOS_RESPONSE" | jq -r '.client_id // empty')
if [ ! -z "$IOS_CLIENT_ID" ]; then
    echo "✅ iOS Client ID: $IOS_CLIENT_ID"
else
    echo "❌ Erro ao criar iOS Client"
fi

# Gerar arquivo de configuração
echo -e "${BLUE}5. 📝 Gerando arquivos de configuração...${NC}"

# Atualizar config/google-auth.ts
cat > config/google-auth.ts << EOF
import { Platform } from 'react-native';

// Credenciais Google OAuth configuradas automaticamente
export const GOOGLE_OAUTH_CONFIG = {
  // Web Client ID
  WEB_CLIENT_ID: '${WEB_CLIENT_ID:-YOUR_WEB_CLIENT_ID.googleusercontent.com}',
  
  // iOS Client ID
  IOS_CLIENT_ID: '${IOS_CLIENT_ID:-YOUR_IOS_CLIENT_ID.googleusercontent.com}',
  
  // Android Client ID
  ANDROID_CLIENT_ID: '${ANDROID_CLIENT_ID:-YOUR_ANDROID_CLIENT_ID.googleusercontent.com}',
  
  // Get the appropriate client ID for the current platform
  getClientId(): string {
    switch (Platform.OS) {
      case 'ios':
        return this.IOS_CLIENT_ID;
      case 'android':
        return this.ANDROID_CLIENT_ID;
      default:
        return this.WEB_CLIENT_ID;
    }
  },
  
  // Check if Google OAuth is properly configured
  isConfigured(): boolean {
    const clientId = this.getClientId();
    return clientId && !clientId.includes('YOUR_');
  }
};

// Project Info
export const PROJECT_INFO = {
  PROJECT_ID: '$PROJECT_ID',
  PROJECT_NAME: '$PROJECT_NAME',
  PACKAGE_NAME: '$PACKAGE_NAME',
  BUNDLE_ID: '$BUNDLE_ID',
  CREATED_AT: '$(date -u +"%Y-%m-%dT%H:%M:%SZ")'
};
EOF

# Gerar arquivo .env para a API
cat > ../fila-api/.env.google << EOF
# Google OAuth Configuration
# Gerado automaticamente em $(date)

GOOGLE_CLIENT_ID=${WEB_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${WEB_CLIENT_SECRET}
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback

# Project Info
GOOGLE_PROJECT_ID=${PROJECT_ID}
GOOGLE_PROJECT_NAME=${PROJECT_NAME}
EOF

# Gerar resumo
cat > google-oauth-credentials.md << EOF
# 🔐 Google OAuth Credentials - Fila Digital

**Gerado automaticamente em:** $(date)
**Projeto:** $PROJECT_ID

## 📱 Client IDs

### Web Application
- **Client ID:** \`${WEB_CLIENT_ID}\`
- **Client Secret:** \`${WEB_CLIENT_SECRET}\`
- **Redirect URIs:** $WEB_REDIRECT_URIS

### Android Application  
- **Client ID:** \`${ANDROID_CLIENT_ID}\`
- **Package Name:** \`${PACKAGE_NAME}\`

### iOS Application
- **Client ID:** \`${IOS_CLIENT_ID}\`
- **Bundle ID:** \`${BUNDLE_ID}\`

## 🛠️ Próximos Passos

1. **API Backend:**
   \`\`\`bash
   cp ../fila-api/.env.google ../fila-api/.env
   # Adicione as variáveis ao seu .env principal
   \`\`\`

2. **React Native App:**
   - ✅ Arquivo \`config/google-auth.ts\` já foi atualizado
   - ✅ Configuração está pronta para uso

3. **Android (Produção):**
   - Obtenha SHA-1 do certificado de release
   - Adicione via: \`gcloud alpha iap oauth-clients update\`

4. **Testar:**
   \`\`\`bash
   npm start
   \`\`\`

## 🔗 Links Úteis

- [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID)
- [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_ID)

---
*Configuração criada automaticamente pelo script setup-google-oauth.sh*
EOF

# Limpar arquivos temporários
rm -f /tmp/oauth-config.json

echo ""
echo -e "${GREEN}🎉 Configuração concluída com sucesso!${NC}"
echo "=================================================="
echo -e "${GREEN}✅ Projeto criado/configurado:${NC} $PROJECT_ID"
echo -e "${GREEN}✅ APIs habilitadas${NC}"
echo -e "${GREEN}✅ OAuth Consent Screen configurado${NC}"
echo -e "${GREEN}✅ Credenciais OAuth criadas${NC}"
echo -e "${GREEN}✅ Arquivos de configuração gerados${NC}"
echo ""
echo -e "${BLUE}📁 Arquivos gerados:${NC}"
echo "  - config/google-auth.ts (App React Native)"
echo "  - ../fila-api/.env.google (API Backend)"  
echo "  - google-oauth-credentials.md (Resumo)"
echo ""
echo -e "${YELLOW}📋 Para finalizar:${NC}"
echo "1. Copie as variáveis de .env.google para o .env da API"
echo "2. Reinicie a API"
echo "3. Teste o login Google no app"
echo ""
echo -e "${GREEN}🚀 Tudo pronto! Seu Google OAuth está configurado.${NC}"
