# 🌍 Configuração de Ambiente - Fila Digital Client App

## 📋 **Visão Geral**

Este projeto usa variáveis de ambiente para configurar diferentes ambientes (desenvolvimento, staging e produção) sem necessidade de mocks ou configurações hardcoded.

## 🔧 **Configuração Rápida**

### **1. Copiar arquivo de exemplo**
```bash
cp config/environment.example .env
```

### **2. Editar variáveis de ambiente**
Edite o arquivo `.env` com suas configurações específicas.

### **3. Usar scripts de ambiente**
```bash
# Desenvolvimento (RECOMENDADO)
pnpm start:dev

# Staging/QA
pnpm start:staging

# Produção
pnpm start:prod

# Ou usar scripts diretamente:
./scripts/start-dev.sh
./scripts/start-staging.sh
./scripts/start-prod.sh
```

## 🚀 **Scripts Disponíveis**

### **Desenvolvimento** (`pnpm start:dev` ou `./scripts/start-dev.sh`)
- ✅ Conecta com `localhost:3001`
- ✅ Logs detalhados ativados
- ✅ Nível de log: `debug`
- ✅ Logs de rede ativados

### **Staging/QA** (`pnpm start:staging` ou `./scripts/start-staging.sh`)
- ✅ Conecta com `fila-api-stage.cloudrun.app`
- ✅ Logs informativos ativados
- ✅ Nível de log: `info`
- ✅ Logs de rede ativados

### **Produção** (`pnpm start:prod` ou `./scripts/start-prod.sh`)
- ✅ Conecta com `fila-api-prod.cloudrun.app`
- ✅ Logs mínimos (apenas warnings/erros)
- ✅ Nível de log: `warn`
- ✅ Logs de rede desativados

## 📝 **Variáveis de Ambiente**

### **🔧 Desenvolvimento**
```bash
NODE_ENV=development
EXPO_ENV=development
API_BASE_URL_DEV=http://localhost:3001/api/v1
WEBSOCKET_URL_DEV=ws://localhost:3001
LOG_LEVEL=debug
ENABLE_NETWORK_LOGS=true
```

### **🧪 Staging/QA**
```bash
NODE_ENV=staging
EXPO_ENV=staging
API_BASE_URL_STAGING=https://fila-api-stage.cloudrun.app/api/v1
WEBSOCKET_URL_STAGING=wss://fila-api-stage.cloudrun.app
LOG_LEVEL=info
ENABLE_NETWORK_LOGS=true
```

### **🚀 Produção**
```bash
NODE_ENV=production
EXPO_ENV=production
API_BASE_URL_PROD=https://fila-api-prod.cloudrun.app/api/v1
WEBSOCKET_URL_PROD=wss://fila-api-prod.cloudrun.app
LOG_LEVEL=warn
ENABLE_NETWORK_LOGS=false
```

## 🎯 **Como Funciona**

### **1. Detecção Automática**
O app detecta automaticamente o ambiente baseado em:
- `EXPO_ENV` (prioridade alta)
- `NODE_ENV` (fallback)
- `__DEV__` (fallback para desenvolvimento)

### **2. Configuração Dinâmica**
- URLs da API são carregadas dinamicamente
- CORS origins são configurados automaticamente
- Níveis de log são ajustados por ambiente

### **3. Fallbacks Seguros**
Se algo der errado, o app usa configurações de emergência para desenvolvimento.

## 🔐 **Segurança**

### **✅ Boas Práticas**
- Arquivo `.env` está no `.gitignore`
- Nenhuma credencial hardcoded
- Configurações sensíveis via variáveis de ambiente
- Fallbacks seguros para desenvolvimento

### **⚠️ Importante**
- **NUNCA** commite o arquivo `.env`
- Use `.env.example` como template
- Configure credenciais reais em produção

## 🧪 **Testando**

### **1. Verificar configuração atual**
```typescript
import { environmentService } from './config/environment';

console.log('Ambiente:', environmentService.getEnvironment());
console.log('API URL:', environmentService.getApiBaseUrl());
console.log('Log Level:', environmentService.getLogLevel());
```

### **2. Debug completo**
```typescript
const debugInfo = environmentService.getDebugInfo();
console.log('Debug Info:', debugInfo);
```

## 🚀 **Deploy**

### **Desenvolvimento Local**
```bash
pnpm start:dev
```

### **Staging/QA**
```bash
pnpm start:staging
```

### **Produção**
```bash
pnpm start:prod
```

## 📊 **Estrutura de Arquivos**

```
config/
├── environment.ts          # Serviço de configuração
├── environment.example     # Template de variáveis
└── google-auth.ts         # Configuração Google OAuth

scripts/
├── start-dev.sh           # Script desenvolvimento
├── start-staging.sh       # Script staging
└── start-prod.sh          # Script produção

.env                       # Variáveis de ambiente (não commitado)
```

## 🔄 **Atualizações**

### **Adicionar nova variável**
1. Adicione no `config/environment.example`
2. Atualize a interface `EnvironmentConfig`
3. Configure nos scripts de ambiente
4. Documente aqui

### **Novo ambiente**
1. Crie script `start-{ambiente}.sh`
2. Configure variáveis específicas
3. Atualize `app.config.ts`
4. Teste a detecção automática

## ✅ **Status**

- ✅ **Variáveis de ambiente** configuradas
- ✅ **Detecção automática** de ambiente
- ✅ **Scripts** para cada ambiente
- ✅ **Fallbacks seguros** implementados
- ✅ **Logs configuráveis** por ambiente
- ✅ **CORS automático** por ambiente
- ✅ **Sem mocks** - apenas configuração real
