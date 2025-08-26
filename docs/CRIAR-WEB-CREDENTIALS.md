# 🌐 Criar Credenciais Web Application (com Client Secret)

## ❌ Problema Atual
Sua credencial atual é tipo **"Installed application"** e não tem `client_secret`:
```json
{"installed": {...}}  // ← SEM client_secret
```

## ✅ Solução: Criar "Web Application"

### 1. Acesse o Google Cloud Console
```
https://console.cloud.google.com/apis/credentials?project=fila-digital-qa
```

### 2. Criar Nova Credencial
- Clique em **"+ CREATE CREDENTIALS"**
- Selecione **"OAuth 2.0 Client ID"**

### 3. Configure como Web Application
- **Application type**: `Web application`
- **Name**: `Fila Digital Web Client`

### 4. Configure Redirect URIs
Adicione estas URLs autorizadas:
```
http://localhost:3000
http://localhost:3001/api/v1/auth/google/callback
https://auth.expo.io/@yourusername/fila-client-app
```

### 5. Resultado Esperado
Você receberá um JSON assim:
```json
{
  "web": {
    "client_id": "397713505626-NOVO-ID.apps.googleusercontent.com",
    "client_secret": "GOCSPX-seu-client-secret-aqui",
    "project_id": "fila-digital-qa",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "redirect_uris": ["http://localhost:3001/api/v1/auth/google/callback"]
  }
}
```

## 🔧 Diferenças Importantes

| Tipo | Tem Client Secret? | Uso |
|------|-------------------|-----|
| **Installed** | ❌ Não | Apps desktop/mobile |
| **Web** | ✅ Sim | Aplicações web/servidor |

## 🎯 Configuração Final

Após criar, atualize os arquivos:

**1. Client App (`config/google-auth.ts`):**
```typescript
WEB_CLIENT_ID: 'SEU-NOVO-WEB-CLIENT-ID'
```

**2. API Backend (`.env`):**
```bash
GOOGLE_CLIENT_ID=SEU-NOVO-WEB-CLIENT-ID
GOOGLE_CLIENT_SECRET=GOCSPX-seu-client-secret
```

## 📱 Link Direto para Criar
[Criar OAuth 2.0 Client ID](https://console.cloud.google.com/apis/credentials/oauthclient?project=fila-digital-qa)

## ⚡ Comando Rápido
Depois de criar, volte aqui e execute:
```bash
# Atualizar client app
echo "NOVO_CLIENT_ID=seu-novo-id" > temp-config.txt

# Atualizar API backend  
cd ../fila-api
echo "GOOGLE_CLIENT_SECRET=GOCSPX-seu-secret" >> .env
```

