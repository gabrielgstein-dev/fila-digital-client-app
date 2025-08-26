# 🔐 Como Obter o GOOGLE_CLIENT_SECRET

## Método Manual (Recomendado)

### 1. Acesse o Google Cloud Console
```
https://console.cloud.google.com/apis/credentials?project=fila-digital-qa
```

### 2. Localize sua Credencial OAuth 2.0
- Procure por: `397713505626-483v2vp5uao65ac95cr10jtp7ka2qgkp.apps.googleusercontent.com`
- Tipo: "Web client"

### 3. Clique no Nome da Credencial
- Clique no nome/ícone de edição da credencial
- Você verá:
  - ✅ **Client ID**: `397713505626-483v2vp5uao65ac95cr10jtp7ka2qgkp.apps.googleusercontent.com`
  - 🔑 **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxx`

### 4. Copie o Client Secret
- Copie o valor que começa com `GOCSPX-`
- **NUNCA** compartilhe este valor publicamente

## 🔧 Método Alternativo: Download JSON

### 1. No Google Cloud Console
- Vá em **APIs & Services > Credentials**
- Clique no ícone de **download** (⬇️) ao lado da sua credencial
- Baixe o arquivo JSON

### 2. O arquivo terá esta estrutura:
```json
{
  "web": {
    "client_id": "397713505626-483v2vp5uao65ac95cr10jtp7ka2qgkp.apps.googleusercontent.com",
    "client_secret": "GOCSPX-seu-client-secret-aqui",
    "project_id": "fila-digital-qa",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
  }
}
```

## ⚠️ Importante

1. **Segurança**: O client secret é sensível - nunca commit no Git
2. **Ambiente**: Use apenas em variáveis de ambiente (.env)
3. **Produção**: Gere credenciais separadas para produção

## 🎯 Configuração no Backend

Após obter o client secret, adicione no arquivo `.env` da API:

```bash
GOOGLE_CLIENT_SECRET=GOCSPX-seu-client-secret-aqui
```

## 📱 Link Direto

[Acessar Credenciais OAuth do Projeto](https://console.cloud.google.com/apis/credentials?project=fila-digital-qa)

