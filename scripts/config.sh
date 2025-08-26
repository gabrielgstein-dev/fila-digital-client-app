#!/bin/bash

# 🔧 Configurações do Projeto - Google OAuth Setup
# Edite este arquivo para personalizar a configuração do seu projeto

# Informações do Projeto
export PROJECT_NAME="fila-digital"
export PROJECT_DISPLAY_NAME="Fila Digital - Cliente"

# Informações do App
export APP_NAME="Fila Digital - Cliente"
export PACKAGE_NAME="com.filadigital.client"
export BUNDLE_ID="com.filadigital.client"

# Contato e Suporte
export SUPPORT_EMAIL="contato@filadigital.com"
export DEVELOPER_EMAIL="dev@filadigital.com"

# URLs de Políticas (opcional)
export PRIVACY_POLICY_URL="https://filadigital.com/privacy"
export TERMS_OF_SERVICE_URL="https://filadigital.com/terms"
export APP_WEBSITE="https://filadigital.com"

# Domínios Autorizados
export AUTHORIZED_DOMAINS="filadigital.com,localhost"

# URLs de Redirect para Desenvolvimento
export DEV_REDIRECT_URIS="http://localhost:19006/auth,http://localhost:3000/auth"

# URLs de Redirect para Produção
export PROD_REDIRECT_URIS="https://app.filadigital.com/auth"

# Expo Configuration
export EXPO_USERNAME="filadigital"
export EXPO_APP_SLUG="fila-client-app"

# API Configuration
export API_BASE_URL_DEV="http://localhost:3001"
export API_BASE_URL_PROD="https://api.filadigital.com"

# Configurações Regionais
export GCLOUD_REGION="us-central1"
export GCLOUD_ZONE="us-central1-a"

# Cores do App (para OAuth Consent Screen)
export PRIMARY_COLOR="#007AFF"
export BACKGROUND_COLOR="#FFFFFF"

echo "✅ Configurações carregadas:"
echo "  Projeto: $PROJECT_NAME"
echo "  App: $APP_NAME"
echo "  Package: $PACKAGE_NAME"
echo "  Email: $SUPPORT_EMAIL"
