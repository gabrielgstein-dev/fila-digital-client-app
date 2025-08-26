# 🌍 Sistema de Ambientes - Fila Digital

Sistema simples para separar configurações entre desenvolvimento, staging e produção usando apenas arquivo `.env`.

## 🚀 Como Usar

### 1. **Desenvolvimento**
```bash
# No arquivo .env, mantenha:
EXPO_ENV=development

# Execute normalmente:
pnpm start
```

### 2. **Staging**
```bash
# No arquivo .env, mude para:
EXPO_ENV=staging

# Execute normalmente:
pnpm start
```

### 3. **Produção**
```bash
# No arquivo .env, mude para:
EXPO_ENV=production

# Execute normalmente:
pnpm start
```

## 🔧 Como Funciona

1. **Arquivo `.env`**: Contém todas as configurações para todos os ambientes
2. **Variável `EXPO_ENV`**: Controla qual ambiente está ativo
3. **Carregamento automático**: O Expo carrega o `.env` automaticamente
4. **Detecção inteligente**: O `config/environment.ts` detecta o ambiente e usa as variáveis corretas

## 📝 Variáveis Disponíveis

### **Ambiente Atual**
- `EXPO_ENV`: Ambiente ativo (development, staging, production)

### **Desenvolvimento**
- `API_BASE_URL_DEV`: URL da API de desenvolvimento
- `WEBSOCKET_URL_DEV`: URL do WebSocket de desenvolvimento

### **Staging**
- `API_BASE_URL_STAGING`: URL da API de staging
- `WEBSOCKET_URL_STAGING`: URL do WebSocket de staging

### **Produção**
- `API_BASE_URL_PROD`: URL da API de produção
- `WEBSOCKET_URL_PROD`: URL do WebSocket de produção

### **Configurações Globais**
- `APP_NAME`: Nome do app
- `LOG_LEVEL`: Nível de log (debug, info, warn, error)
- `ENABLE_NETWORK_LOGS`: Habilitar logs de rede (true/false)

## 🛠️ Personalização

### **Mudar Ambiente**
Para mudar de ambiente, edite apenas a variável `EXPO_ENV` no arquivo `.env`:

```bash
# Para desenvolvimento
EXPO_ENV=development

# Para staging
EXPO_ENV=staging

# Para produção
EXPO_ENV=production
```

### **Adicionar Nova Variável**
1. Adicione no arquivo `.env` com sufixo do ambiente:
   ```bash
   # Desenvolvimento
   MINHA_VARIAVEL_DEV=valor_dev
   
   # Staging
   MINHA_VARIAVEL_STAGING=valor_staging
   
   # Produção
   MINHA_VARIAVEL_PROD=valor_prod
   ```

2. Use no código via `process.env.MINHA_VARIAVEL_DEV`

### **Mudar URLs**
Edite diretamente no arquivo `.env`:

```bash
# Desenvolvimento
API_BASE_URL_DEV=http://localhost:3001/api/v1
WEBSOCKET_URL_DEV=ws://localhost:3001

# Staging
API_BASE_URL_STAGING=https://meu-staging.com/api/v1
WEBSOCKET_URL_STAGING=wss://meu-staging.com

# Produção
API_BASE_URL_PROD=https://minha-producao.com/api/v1
WEBSOCKET_URL_PROD=wss://minha-producao.com
```

## 🔍 Troubleshooting

### **Variáveis não carregam**
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Confirme se `EXPO_ENV` está definido corretamente
3. Reinicie o Expo após mudanças no `.env`

### **Ambiente incorreto detectado**
1. Verifique o valor de `EXPO_ENV` no arquivo `.env`
2. Confirme se não há espaços extras ou caracteres especiais
3. Use `echo $EXPO_ENV` para verificar no terminal

### **Erro de carregamento**
1. Verifique sintaxe do arquivo `.env` (sem espaços em variáveis)
2. Confirme se não há caracteres especiais
3. Verifique se o arquivo está na raiz do projeto

## 🌟 **Vantagens desta Abordagem**

- ✅ **Simples**: Apenas um arquivo para configurar
- ✅ **Flexível**: Mude ambiente editando uma variável
- ✅ **Padrão**: Usa o sistema padrão do Expo
- ✅ **Sem scripts**: Não precisa de scripts complexos
- ✅ **Fácil manutenção**: Tudo centralizado em um lugar

## 📚 **Referências**

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Node.js Process Environment](https://nodejs.org/api/process.html#processenv)
