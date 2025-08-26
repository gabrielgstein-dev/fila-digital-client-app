# 🌐 Configuração de CORS para Produção na Cloud Run

## 📋 **Configuração Atual**

A API já está configurada para detectar automaticamente o ambiente e aplicar configurações de CORS apropriadas:

### 🔧 **Código Implementado** (`src/main.ts`)

```typescript
// Configuração de CORS baseada no ambiente
const nodeEnv = configService.get('NODE_ENV') || 'development';
let corsOrigins: string[];

if (nodeEnv === 'production') {
  // Em produção, usar apenas domínios HTTPS seguros
  const productionOrigins = configService.get('CORS_ORIGIN') || '';
  if (productionOrigins) {
    corsOrigins = productionOrigins.split(',').map((origin) => origin.trim());
  } else {
    // Fallback para domínios padrão de produção
    corsOrigins = [
      'https://fila-digital.com',
      'https://www.fila-digital.com',
      'https://app.fila-digital.com'
    ];
  }
  
  // Validar que todas as origens são HTTPS em produção
  corsOrigins = corsOrigins.filter(
    (origin) =>
      origin.startsWith('https://') &&
      !origin.includes('localhost') &&
      !origin.includes('127.0.0.1'),
  );
} else {
  // Em desenvolvimento, permitir origens locais
  const devOrigins = configService.get('CORS_ORIGIN') || 'http://localhost:3000';
  corsOrigins = devOrigins.split(',').map((origin) => origin.trim());
}
```

## 🚀 **Para Deploy na Cloud Run**

### 1️⃣ **Configurar Variáveis de Ambiente**

No Cloud Run, definir:

```bash
NODE_ENV=production
CORS_ORIGIN=https://seu-dominio.com,https://app.seu-dominio.com
```

### 2️⃣ **Usar GitHub Actions EXISTENTE** ✅

Vocês já têm workflows profissionais configurados:

#### **Staging** (`.github/workflows/cloudrun-deploy-stage.yml`)
- ✅ Deploy automático com tags `*-stage`
- ✅ Usa `Dockerfile.qa`
- ✅ Ambiente de teste/validação

#### **Produção** (`.github/workflows/cloudrun-deploy-prod.yml`)
- ✅ Deploy automático com tags `X.Y.Z` (sem sufixo)
- ✅ Usa `Dockerfile.production`
- ✅ Requer aprovação manual
- ✅ Ambiente de produção

### 3️⃣ **Secrets Já Configurados**

```bash
# Staging
GCP_PROJECT_ID_STAGE=seu-projeto-staging
GCP_SA_KEY_STAGE=chave-staging
GCP_REGION_STAGE=us-central1
BACKEND_SERVICE_NAME_STAGE=fila-api-stage

# Produção  
GCP_PROJECT_ID_PROD=seu-projeto-prod
GCP_SA_KEY_PROD=chave-prod
GCP_REGION_PROD=us-central1
BACKEND_SERVICE_NAME_PROD=fila-api-prod
```

## 🛡️ **Segurança Automática**

### **Em Desenvolvimento:**
- ✅ Permite `localhost` e IPs locais
- ✅ CORS mais permissivo
- ✅ Logs detalhados

### **Em Staging:**
- ✅ Usa `Dockerfile.qa`
- ✅ Ambiente de validação
- ✅ CORS configurável

### **Em Produção:**
- ✅ **SOMENTE** domínios HTTPS
- ✅ **BLOQUEIA** `localhost` e IPs locais
- ✅ Headers de segurança adicionais
- ✅ Rate limiting mais restritivo
- ✅ **Requer aprovação manual**

## 📱 **Configuração do App Mobile**

### **Para Staging:**
```typescript
// services/api.ts
const API_BASE_URL = 'https://fila-api-stage.cloudrun.app/api/v1';

// services/websocket.ts  
const serverUrl = 'wss://fila-api-stage.cloudrun.app';
```

### **Para Produção:**
```typescript
// services/api.ts
const API_BASE_URL = 'https://fila-api-prod.cloudrun.app/api/v1';

// services/websocket.ts
const serverUrl = 'wss://fila-api-prod.cloudrun.app';
```

### **Para Desenvolvimento:**
```typescript
// services/api.ts
const API_BASE_URL = 'http://192.168.1.111:3001/api/v1';

// services/websocket.ts
const serverUrl = 'ws://192.168.1.111:3001';
```

## 🔄 **Deploy Automático**

### **Staging:**
1. **Tag com `-stage`** → Deploy automático
2. **Usa `Dockerfile.qa`** → Build otimizado para QA
3. **CORS configurado** → Ambiente de teste

### **Produção:**
1. **Tag sem sufixo** → Deploy de produção
2. **Usa `Dockerfile.production`** → Build otimizado para prod
3. **Requer aprovação** → Segurança adicional
4. **CORS restritivo** → Apenas HTTPS

## ✅ **Vantagens da Configuração Existente**

- 🚀 **Workflows profissionais** já configurados
- 🛡️ **Segurança em camadas** (staging → produção)
- 🔄 **Deploy automático** por tags
- 📱 **Configuração automática** para mobile
- 🧪 **Ambiente de validação** antes da produção
- 🔒 **Aprovação manual** para produção

## 🎯 **Resumo**

**Vocês já têm tudo configurado profissionalmente!** 

1. **CORS se adapta automaticamente** ao ambiente
2. **GitHub Actions existentes** fazem deploy automático
3. **Segurança em camadas** (staging → produção)
4. **App mobile se configura** baseado no ambiente

**Só usar as tags corretas:**
- `v1.0.0-stage` → Deploy em staging
- `v1.0.0` → Deploy em produção (com aprovação)

**A configuração está 100% pronta e profissional!** 🚀
