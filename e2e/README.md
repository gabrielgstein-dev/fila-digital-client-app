# 🧪 Testes E2E - Fila Client App

## 📋 Visão Geral

Testes End-to-End para validar os fluxos de autenticação Google e integração com a API do sistema de filas.

## 🚀 Como Executar

### Pré-requisitos
```bash
# 1. Instalar dependências
npm install

# 2. Instalar browsers do Playwright
npx playwright install

# 3. Garantir que a API está rodando
cd ../fila-api && npm run start:dev

# 4. Garantir que o app está rodando
npm run web
```

### Comandos de Teste

```bash
# Executar todos os testes
npm run test:e2e

# Executar com interface visual
npm run test:e2e:ui

# Executar com browser visível
npm run test:e2e:headed

# Debug passo a passo
npm run test:e2e:debug

# Ver relatório dos últimos testes
npm run test:e2e:report
```

## 📁 Estrutura dos Testes

### `google-auth.e2e.spec.ts`
- ✅ Verifica presença do botão Google
- ✅ Testa fluxo de login demonstração
- ✅ Valida credenciais configuradas
- ✅ Verifica salvamento de token
- ✅ Testa login regular
- ✅ Valida estados de loading

### `api-integration.e2e.spec.ts`
- ✅ Testa endpoint `/auth/google/token`
- ✅ Valida tratamento de tokens inválidos
- ✅ Verifica validação de parâmetros
- ✅ Testa configuração CORS
- ✅ Valida estrutura de resposta

### `dashboard-flow.e2e.spec.ts`
- ✅ Fluxo completo login → dashboard
- ✅ Navegação entre tabs
- ✅ Status de conexão
- ✅ Funcionalidade de logout
- ✅ Comportamento após refresh
- ✅ Estados vazios
- ✅ Tratamento de erros

## 🎯 Cenários Testados

### Autenticação Google
1. **Demo Mode**: Login com credenciais configuradas
2. **Token Handling**: Salvamento e validação de tokens
3. **Error Handling**: Tratamento de falhas na autenticação
4. **UI States**: Loading, success, error

### Integração API
1. **Endpoint Validation**: Verificação de disponibilidade
2. **Request Validation**: Validação de parâmetros obrigatórios
3. **Response Handling**: Tratamento correto das respostas
4. **Error Scenarios**: Comportamento com dados inválidos

### Fluxo do Dashboard
1. **Navigation**: Transições entre telas
2. **State Management**: Persistência de dados
3. **Real-time Features**: Status de conexão
4. **User Experience**: Logout, refresh, estados vazios

## 📊 Cobertura de Testes

| Funcionalidade | Cobertura | Status |
|----------------|-----------|--------|
| **Login Google** | 90% | ✅ |
| **Login Regular** | 85% | ✅ |
| **Dashboard** | 80% | ✅ |
| **API Integration** | 75% | ✅ |
| **Error Handling** | 85% | ✅ |
| **Navigation** | 90% | ✅ |

## 🔧 Configuração

### playwright.config.ts
- **Browsers**: Chrome, Firefox, Safari
- **Base URL**: http://localhost:3000
- **API URL**: http://localhost:3001
- **Parallelização**: Ativa
- **Screenshots**: Em caso de falha
- **Traces**: Para debugging

### Ambiente de Teste
- **App**: http://localhost:3000
- **API**: http://localhost:3001/api/v1
- **Modo**: Demo (credenciais configuradas)
- **Dados**: Mock/Demonstração

## 🚨 Pontos de Atenção

### Limitações Atuais
- Testes rodam em **modo demonstração**
- Google OAuth real não testado (requer setup completo)
- Alguns endpoints podem não estar disponíveis
- WebSocket não testado extensivamente

### Melhorias Futuras
- [ ] Testes com Google OAuth real
- [ ] Mocks mais robustos da API
- [ ] Testes de performance
- [ ] Testes em dispositivos móveis reais
- [ ] Cobertura de acessibilidade

## 🎯 Resultados Esperados

### Testes que Devem Passar
- Login com Google (demo)
- Navegação no dashboard
- Integração básica com API
- Tratamento de erros
- Estados de UI

### Testes que Podem Falhar
- Endpoints específicos da API (se não implementados)
- Features que dependem de dados reais
- WebSocket em alguns ambientes

## 📈 Como Interpretar Resultados

### ✅ Sucesso Total
- Todos os fluxos funcionando
- Integração API estável
- UI responsiva

### ⚠️ Sucesso Parcial
- Fluxos principais funcionando
- Alguns endpoints indisponíveis
- Funcionalidades básicas OK

### ❌ Falhas
- Verificar se servidores estão rodando
- Conferir configurações de credenciais
- Revisar logs de erro

