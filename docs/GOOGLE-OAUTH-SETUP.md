# 🔐 Configuração Google OAuth - Fila Digital App

Este guia explica como configurar a autenticação Google OAuth para o app cliente da Fila Digital.

## 📋 Pré-requisitos

- Conta Google com acesso ao Google Cloud Console
- Projeto no Google Cloud Console
- Conhecimento básico de OAuth 2.0

## 🛠️ Configuração no Google Cloud Console

### 1. Criar/Selecionar Projeto

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o **Project ID**

### 2. Habilitar APIs

1. Vá para **APIs & Services > Library**
2. Habilite as seguintes APIs:
   - Google+ API (ou Google People API)
   - Google OAuth2 API

### 3. Configurar OAuth Consent Screen

1. Vá para **APIs & Services > OAuth consent screen**
2. Escolha **External** (para usuários públicos)
3. Preencha as informações obrigatórias:
   - **App name**: Fila Digital - Cliente
   - **User support email**: seu-email@exemplo.com
   - **Developer contact information**: seu-email@exemplo.com
4. Adicione os scopes necessários:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
5. Salve e continue

### 4. Criar Credenciais OAuth 2.0

Você precisará criar **3 tipos** de credenciais:

#### 4.1 Web Application (Para desenvolvimento/teste)
1. **APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client IDs**
2. **Application type**: Web application
3. **Name**: Fila Digital Web Client
4. **Authorized redirect URIs**: 
   - `http://localhost:19006/auth` (Expo development)
   - `https://auth.expo.io/@your-username/fila-client-app` (Expo hosted)
5. Copie o **Client ID**

#### 4.2 Android Application
1. **Create Credentials > OAuth 2.0 Client IDs**
2. **Application type**: Android
3. **Name**: Fila Digital Android Client
4. **Package name**: `com.filadigital.client`
5. **SHA-1 certificate fingerprint**:
   
   **Para desenvolvimento (debug):**
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
   
   **Para produção (release):**
   ```bash
   keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
   ```
6. Copie o **Client ID**

#### 4.3 iOS Application
1. **Create Credentials > OAuth 2.0 Client IDs**
2. **Application type**: iOS
3. **Name**: Fila Digital iOS Client
4. **Bundle ID**: `com.filadigital.client`
5. Copie o **Client ID**

## ⚙️ Configuração no App React Native

### 1. Configurar Client IDs

Edite o arquivo `config/google-auth.ts`:

```typescript
export const GOOGLE_OAUTH_CONFIG = {
  // Substitua pelos seus Client IDs reais
  WEB_CLIENT_ID: 'SEU_WEB_CLIENT_ID.googleusercontent.com',
  IOS_CLIENT_ID: 'SEU_IOS_CLIENT_ID.googleusercontent.com', 
  ANDROID_CLIENT_ID: 'SEU_ANDROID_CLIENT_ID.googleusercontent.com',
  
  // ... resto da configuração
};
```

### 2. Configurar Redirect URI

O app já está configurado com o scheme `filaclientapp://auth`. Se quiser alterar:

1. Edite `app.json` na seção `plugins`:
```json
{
  "plugins": [
    ["expo-auth-session", {
      "schemes": ["SEU_SCHEME_PERSONALIZADO"]
    }]
  ]
}
```

2. Atualize `services/google-auth.ts`:
```typescript
redirectUri: AuthSession.makeRedirectUri({
  scheme: 'SEU_SCHEME_PERSONALIZADO',
  path: 'auth',
})
```

## 🔧 Configuração da API Backend

### 1. Variáveis de Ambiente

Configure no arquivo `.env` da API:

```env
# Google OAuth
GOOGLE_CLIENT_ID=SEU_WEB_CLIENT_ID.googleusercontent.com
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
```

### 2. Configurar Redirect URL na API

No Google Cloud Console, adicione a URL de callback da API:
- `http://localhost:3001/api/v1/auth/google/callback` (desenvolvimento)
- `https://sua-api.com/api/v1/auth/google/callback` (produção)

## 🧪 Testando a Configuração

### 1. Verificar Configuração

No app, a tela de login deve mostrar o botão "Continuar com Google" apenas se configurado corretamente.

### 2. Teste de Fluxo

1. Abra o app
2. Toque em "Continuar com Google"
3. Deve abrir o navegador com a tela de login do Google
4. Após autorizar, deve retornar ao app e fazer login automaticamente

### 3. Debug

Para debug, verifique os logs:
```bash
# App React Native
npx expo start

# API Backend  
npm run start:dev
```

## 🚀 Deploy em Produção

### 1. Build do App

```bash
# Android
npx expo build:android

# iOS  
npx expo build:ios
```

### 2. Atualizar Redirect URIs

Para produção, adicione as URLs reais:
- Android: `com.filadigital.client://auth`
- iOS: `com.filadigital.client://auth`
- Web: `https://sua-app.com/auth`

### 3. Certificados de Produção

Para Android, gere e configure o SHA-1 do certificado de release:

```bash
# Gerar keystore de release
keytool -genkey -v -keystore release-key.keystore -alias release-alias -keyalg RSA -keysize 2048 -validity 10000

# Obter SHA-1 do release
keytool -list -v -keystore release-key.keystore -alias release-alias
```

## ❗ Solução de Problemas

### Erro: "invalid_client"
- Verifique se o Client ID está correto
- Confirme se o bundle ID/package name está correto
- Verifique se o SHA-1 foi adicionado (Android)

### Erro: "redirect_uri_mismatch"  
- Verifique se a redirect URI está configurada no Google Cloud Console
- Confirme se o scheme do app está correto

### Botão Google não aparece
- Verifique se `GOOGLE_OAUTH_CONFIG.isConfigured()` retorna `true`
- Confirme se os Client IDs não contêm "YOUR_"

### Token inválido na API
- Verifique se as variáveis de ambiente da API estão corretas
- Confirme se o Client Secret está configurado
- Teste a validação do token manualmente

## 📚 Recursos Adicionais

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Expo AuthSession Documentation](https://docs.expo.dev/guides/authentication/#google)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Importante**: Mantenha os Client Secrets seguros e nunca os commite no controle de versão!
