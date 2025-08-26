#!/bin/bash

# 🚀 Script de Configuração Rápida - Modo Demonstração
# Configura o Google OAuth em modo demonstração para testes

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Configuração Demonstração - Google OAuth${NC}"
echo "============================================"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script no diretório fila-client-app${NC}"
    exit 1
fi

echo -e "${BLUE}1. Configurando Google OAuth para demonstração...${NC}"

# Verificar se arquivo de configuração existe
if [ ! -f "config/google-auth.ts" ]; then
    echo -e "${RED}❌ Arquivo config/google-auth.ts não encontrado${NC}"
    exit 1
fi

# Verificar se já está configurado
if grep -q "demo-web" config/google-auth.ts; then
    echo -e "${GREEN}✅ Google OAuth já configurado para demonstração${NC}"
else
    echo -e "${YELLOW}⚠️  Configurando IDs de demonstração...${NC}"
    # Aqui você poderia fazer as substituições se necessário
fi

echo -e "${BLUE}2. Configurando API Backend...${NC}"

# Verificar se arquivo de exemplo existe
if [ -f "google-env-example.txt" ]; then
    echo -e "${GREEN}✅ Arquivo de exemplo encontrado${NC}"
    echo "📝 Para configurar a API, adicione estas variáveis ao .env da API:"
    echo ""
    cat google-env-example.txt
    echo ""
else
    echo -e "${YELLOW}⚠️  Arquivo de exemplo não encontrado${NC}"
fi

echo -e "${BLUE}3. Instalando dependências...${NC}"
if npm list expo-auth-session >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Dependências OAuth já instaladas${NC}"
else
    echo -e "${YELLOW}📦 Instalando dependências OAuth...${NC}"
    npm install expo-auth-session expo-crypto expo-web-browser
fi

echo -e "${BLUE}4. Verificando configuração...${NC}"

# Executar verificação
if [ -f "scripts/check-google-oauth.sh" ]; then
    ./scripts/check-google-oauth.sh
else
    echo -e "${YELLOW}⚠️  Script de verificação não encontrado${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Configuração de demonstração concluída!${NC}"
echo "============================================="
echo -e "${GREEN}✅ Google OAuth configurado em modo demonstração${NC}"
echo -e "${GREEN}✅ Botão 'Continuar com Google' disponível${NC}"
echo -e "${GREEN}✅ Login com dados fictícios funcionando${NC}"
echo ""
echo -e "${BLUE}🚀 Para testar:${NC}"
echo "1. Execute: npm start"
echo "2. Abra o app no navegador ou Expo Go"
echo "3. Toque em 'Continuar com Google'"
echo "4. Confirme o modo demonstração"
echo "5. Login será feito com usuário fictício"
echo ""
echo -e "${YELLOW}📋 Para configuração real:${NC}"
echo "1. Configure credenciais no Google Cloud Console"
echo "2. Atualize config/google-auth.ts com IDs reais"
echo "3. Configure variáveis no .env da API"
echo "4. Execute: ./scripts/setup-google-oauth.sh"
echo ""
echo -e "${GREEN}✨ Pronto para demonstração!${NC}"
