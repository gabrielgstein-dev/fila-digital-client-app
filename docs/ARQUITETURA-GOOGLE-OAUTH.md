# 📱 Arquitetura Google OAuth: Mobile App + API Backend

## 🏗️ Como Funciona

```
📱 App Mobile          🔄 Google OAuth          🖥️ API Backend
(Android/iOS)          (Validação)              (NestJS)
     │                       │                       │
     │ 1. Login Google       │                       │
     ├─────────────────────→ │                       │
     │                       │                       │
     │ 2. Access Token       │                       │
     ← ─────────────────────┤                       │
     │                       │                       │
     │ 3. Enviar Token para API                      │
     ├─────────────────────────────────────────────→ │
     │                       │                       │
     │                       │ 4. Validar Token     │
     │                       ← ─────────────────────┤
     │                       │                       │
     │ 5. JWT da nossa aplicação                     │
     ← ─────────────────────────────────────────────┤
```

## 🔑 Tipos de Credenciais Necessárias

### Para o App Mobile (Cliente)
- ✅ **Android OAuth Client** - sem client_secret
- ✅ **iOS OAuth Client** - sem client_secret

### Para a API Backend (Servidor)
- ✅ **Web Application OAuth Client** - COM client_secret
- 🎯 **Motivo**: Para validar tokens recebidos do app mobile

## 📱 Fluxo Detalhado

### 1. App Mobile (Android/iOS)
```typescript
// App usa credencial Android/iOS (sem client_secret)
const result = await GoogleSignIn.signIn();
const accessToken = result.accessToken; // Token do Google
```

### 2. App Envia Token para API
```typescript
// App envia o token Google para nossa API
fetch('/api/auth/google/token', {
  method: 'POST',
  body: JSON.stringify({
    access_token: accessToken,
    user: result.user
  })
});
```

### 3. API Valida Token Google
```typescript
// API usa credencial Web (COM client_secret) para validar
async validateGoogleToken(token: string) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
  );
  // Precisa do client_secret para algumas validações avançadas
}
```

## ✅ Solução Recomendada

**Crie 3 credenciais no Google Console:**

### 1. Android Application
```
Type: Android
Package name: com.filadigital.client
SHA-1: FB:8B:50:48:C2:43:9E:ED:E1:60:CE:37:9D:2D:CA:C5:01:6C:C2:3A
```

### 2. iOS Application  
```
Type: iOS
Bundle ID: com.filadigital.client
```

### 3. Web Application (para API Backend)
```
Type: Web application
Name: Fila API Backend
Authorized redirect URIs: http://localhost:3001/api/v1/auth/google/callback
```

## 🎯 Configuração Final

**App Mobile:**
```typescript
// config/google-auth.ts
ANDROID_CLIENT_ID: 'xxx-android.apps.googleusercontent.com'
IOS_CLIENT_ID: 'xxx-ios.apps.googleusercontent.com'
```

**API Backend:**
```bash
# .env
GOOGLE_CLIENT_ID=xxx-web.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-web-client-secret
```

## 🚀 Vantagens

- ✅ App mobile usa credenciais específicas da plataforma
- ✅ API pode validar tokens de forma segura
- ✅ Melhor segurança (client_secret fica só no servidor)
- ✅ Suporte completo a todas as funcionalidades Google OAuth

## 🔄 Alternativa Simples (Para Testes)

Se quiser apenas testar, pode usar a credencial "installed" atual:
- App usa o client_id atual
- API faz validação básica sem client_secret
- Funcional mas com limitações de segurança

