# 📱 Fila Digital - App Cliente

Aplicativo React Native desenvolvido com Expo para que clientes possam acompanhar suas senhas de fila em tempo real.

## 🚀 Funcionalidades

- **Autenticação Flexível**: Login com telefone/email ou Google OAuth
- **Dashboard Intuitivo**: Visualização rápida de todas as senhas ativas
- **Tempo Real**: Atualizações automáticas via WebSocket
- **Notificações Push**: Alertas quando a senha é chamada
- **Detalhes Completos**: Informações detalhadas de cada senha
- **Nova Senha**: Interface para tirar senhas em filas disponíveis

## 🛠️ Tecnologias

- **React Native** + **Expo**
- **TypeScript** para tipagem robusta
- **Socket.io** para comunicação em tempo real
- **Expo Notifications** para push notifications
- **Expo Auth Session** para Google OAuth
- **AsyncStorage** para persistência local
- **Expo Router** para navegação

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- API do Fila Digital rodando em `http://localhost:3001`

## 🏃‍♂️ Como Executar

### 1. Instalar dependências
```bash
cd fila-client-app
npm install
```

### 2. Configurar API
Certifique-se de que a API esteja rodando em `localhost:3001`. Se necessário, altere a URL em `services/api.ts`:

```typescript
const API_BASE_URL = 'http://SEU_IP:3001/api/v1';
```

### 3. Executar o app
```bash
# Web (desenvolvimento)
npm run web

# iOS (requer macOS)
npm run ios

# Android
npm run android

# Expo Go (recomendado para testes)
npx expo start
```

## 📱 Como Usar

### 1. **Login/Identificação**
- **Opção 1**: Informe seu telefone ou email (nome é opcional)
- **Opção 2**: Use "Continuar com Google" (se configurado)
- Toque em "Acessar Minhas Senhas"

### 2. **Dashboard Principal**
- Veja resumo das suas senhas
- Status de conexão (Online/Offline)
- Lista de todas as senhas ativas
- Pull to refresh para atualizar

### 3. **Detalhes da Senha**
- Toque em qualquer senha para ver detalhes
- Posição na fila e tempo estimado
- Informações da fila e estabelecimento
- Atualizações em tempo real

### 4. **Tirar Nova Senha**
- Aba "Nova Senha"
- Selecione um estabelecimento e fila
- Informe nome (opcional) e prioridade
- Toque em "Tirar Senha"

## 🔔 Notificações

O app envia notificações automáticas quando:
- Sua senha é chamada
- Status da senha muda
- Atualizações importantes da fila

**Nota**: Para receber notificações, permita quando solicitado.

## 🌐 Comunicação em Tempo Real

O app conecta automaticamente via WebSocket para:
- Atualizações automáticas das senhas
- Notificações instantâneas
- Sincronização com outros dispositivos

## 🎨 Interface

- **Design System**: iOS Human Interface Guidelines
- **Cores**: Azul (#007AFF) como cor primária
- **Tipografia**: San Francisco (iOS) / Roboto (Android)
- **Componentes**: Nativos do React Native

## 📊 Estado da Aplicação

O app mantém estado local para:
- Informações do cliente (telefone/email/nome)
- Cache das senhas atuais
- Configurações de notificação
- Histórico de uso

## 🔧 Configurações de Desenvolvimento

### Variáveis de Ambiente
Crie um arquivo `.env` se necessário:
```
API_BASE_URL=http://localhost:3001/api/v1
WEBSOCKET_URL=ws://localhost:3001
```

### Debug
- Use Flipper para debug (opcional)
- Console logs aparecem no terminal
- React DevTools disponível

## 📦 Build para Produção

### Android (APK)
```bash
npx expo build:android
```

### iOS (IPA)
```bash
npx expo build:ios
```

### Publicação na Store
```bash
npx expo submit
```

## 🔐 Configuração Google OAuth (Opcional)

### 🚀 Configuração Automática (Recomendado)

Use o script automatizado para configurar tudo via linha de comando:

```bash
# 1. Instalar gcloud CLI (se não tiver)
# Siga: GCLOUD-SETUP.md

# 2. Executar configuração automática
./scripts/setup-google-oauth.sh

# 3. Verificar se tudo está correto
./scripts/check-google-oauth.sh
```

### 📝 Configuração Manual

Para configuração manual, siga o guia completo em [`GOOGLE-OAUTH-SETUP.md`](./GOOGLE-OAUTH-SETUP.md).

**Resumo rápido:**
1. Configure credenciais no Google Cloud Console
2. Edite `config/google-auth.ts` com seus Client IDs
3. Configure variáveis na API backend

## 🧪 Testes

Para executar em dispositivo físico:
1. Instale o app Expo Go
2. Execute `npx expo start`
3. Escaneie o QR code

## 🐛 Solução de Problemas

### App não conecta com a API
- Verifique se a API está rodando
- Confirme o IP correto (não use localhost em dispositivo físico)
- Verifique firewall/proxy

### Notificações não funcionam
- Permita notificações quando solicitado
- Funciona apenas em dispositivo físico
- Não disponível no simulador iOS

### WebSocket não conecta
- Verifique se a API suporta WebSocket
- Confirme se não há proxy bloqueando
- Teste a conexão manualmente

## 📄 Licença

Este projeto faz parte do sistema Fila Digital.

## 🤝 Contribuição

Para contribuir:
1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

**Desenvolvido com ❤️ para modernizar o atendimento ao cliente**
