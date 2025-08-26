# ⚡ Quick Start - Google OAuth

Configuração rápida do Google OAuth em 3 passos!

## 🚀 Configuração Automática

### 1. Instalar gcloud CLI

```bash
# Ubuntu/Debian
sudo apt-get install google-cloud-cli

# macOS
brew install --cask google-cloud-sdk

# Ou via script
curl https://sdk.cloud.google.com | bash
```

### 2. Executar Script de Configuração

```bash
cd fila-client-app

# Personalizar configurações (opcional)
cp scripts/config.sh scripts/config.local.sh
nano scripts/config.local.sh

# Executar configuração automática
./scripts/setup-google-oauth.sh
```

### 3. Verificar Configuração

```bash
./scripts/check-google-oauth.sh
```

## ✅ Pronto!

Se tudo deu certo, você deve ver:

- ✅ 3 Client IDs criados (Web, Android, iOS)
- ✅ Arquivo `config/google-auth.ts` atualizado
- ✅ Arquivo `../fila-api/.env.google` criado
- ✅ Botão "Continuar com Google" no app

## 🧪 Testar

```bash
# API Backend
cd ../fila-api
cp .env.google .env  # Adicione as variáveis ao seu .env
npm run start:dev

# App React Native
cd ../fila-client-app
npm start
```

## 🔧 O que o Script Faz

1. **Cria projeto** no Google Cloud (se não existir)
2. **Habilita APIs** necessárias (OAuth2, People)
3. **Configura OAuth Consent Screen**
4. **Cria 3 credenciais OAuth:**
   - Web Application
   - Android Application  
   - iOS Application
5. **Gera arquivos de configuração:**
   - `config/google-auth.ts` (App)
   - `../fila-api/.env.google` (API)
   - `google-oauth-credentials.md` (Resumo)

## 🆘 Problemas?

```bash
# Verificar status
./scripts/check-google-oauth.sh

# Ver logs detalhados
gcloud auth list
gcloud config list
gcloud projects list
```

### Erros Comuns

**❌ "gcloud not found"**
```bash
# Instalar gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

**❌ "Not authenticated"**
```bash
gcloud auth login
```

**❌ "Project not found"**
```bash
gcloud projects create fila-digital
gcloud config set project fila-digital
```

**❌ "Permission denied"**
```bash
# Verificar se tem permissões de projeto
gcloud projects get-iam-policy PROJECT_ID
```

## 📚 Documentação Completa

- [GCLOUD-SETUP.md](./GCLOUD-SETUP.md) - Instalação detalhada do gcloud CLI
- [GOOGLE-OAUTH-SETUP.md](./GOOGLE-OAUTH-SETUP.md) - Configuração manual completa
- [README.md](./README.md) - Documentação principal do app

---

**⚡ Total: ~5 minutos para configurar Google OAuth completo!**
