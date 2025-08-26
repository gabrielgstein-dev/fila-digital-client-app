# 🌥️ Configuração Google Cloud CLI

Este guia explica como instalar e configurar o `gcloud CLI` para automação da configuração OAuth.

## 📋 Instalação do gcloud CLI

### Ubuntu/Debian

```bash
# Adicionar repositório oficial do Google Cloud
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# Importar chave GPG
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -

# Instalar
sudo apt-get update && sudo apt-get install google-cloud-cli
```

### macOS

```bash
# Homebrew
brew install --cask google-cloud-sdk

# Ou download direto
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Windows

1. Baixe o instalador: https://cloud.google.com/sdk/docs/install-sdk#windows
2. Execute o instalador
3. Reinicie o terminal

### Instalação Manual (Linux/macOS)

```bash
# Download
curl https://sdk.cloud.google.com | bash

# Reiniciar shell
exec -l $SHELL

# Inicializar
gcloud init
```

## ⚙️ Configuração Inicial

### 1. Login no Google Cloud

```bash
gcloud auth login
```

Isso abrirá o navegador para autenticação.

### 2. Configurar Projeto Padrão

```bash
# Listar projetos existentes
gcloud projects list

# Definir projeto padrão
gcloud config set project SEU_PROJECT_ID
```

### 3. Habilitar APIs Alpha (Necessário para OAuth)

```bash
gcloud components install alpha
```

### 4. Verificar Instalação

```bash
gcloud version
gcloud auth list
gcloud config list
```

## 🔧 Dependências Adicionais

### jq (para processamento JSON)

```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq

# CentOS/RHEL
sudo yum install jq
```

### curl (geralmente já instalado)

```bash
# Ubuntu/Debian
sudo apt-get install curl

# macOS (via Homebrew)
brew install curl
```

## 🚀 Executar Script de Configuração

Após instalar o gcloud CLI e dependências:

```bash
cd fila-client-app
./scripts/setup-google-oauth.sh
```

O script irá:
1. ✅ Verificar se gcloud está instalado
2. ✅ Fazer login (se necessário)
3. ✅ Criar/configurar projeto
4. ✅ Habilitar APIs necessárias
5. ✅ Configurar OAuth Consent Screen
6. ✅ Criar credenciais para Web, Android e iOS
7. ✅ Gerar arquivos de configuração

## 🔍 Comandos Úteis

### Verificar Credenciais Criadas

```bash
# Listar credenciais OAuth
gcloud alpha iap oauth-clients list

# Detalhes de uma credencial
gcloud alpha iap oauth-clients describe CLIENT_ID
```

### Gerenciar Projetos

```bash
# Criar novo projeto
gcloud projects create PROJECT_ID --name="Nome do Projeto"

# Listar projetos
gcloud projects list

# Definir projeto ativo
gcloud config set project PROJECT_ID
```

### APIs e Serviços

```bash
# Listar APIs habilitadas
gcloud services list --enabled

# Habilitar API
gcloud services enable oauth2.googleapis.com

# Desabilitar API
gcloud services disable oauth2.googleapis.com
```

### Configurações

```bash
# Ver configurações atuais
gcloud config list

# Definir região padrão
gcloud config set compute/region us-central1

# Definir zona padrão
gcloud config set compute/zone us-central1-a
```

## 🛠️ Solução de Problemas

### Erro: "gcloud: command not found"

Adicione o gcloud ao PATH:

```bash
# Adicionar ao ~/.bashrc ou ~/.zshrc
export PATH="$HOME/google-cloud-sdk/bin:$PATH"

# Recarregar
source ~/.bashrc  # ou ~/.zshrc
```

### Erro: "Project does not exist"

```bash
# Verificar se projeto existe
gcloud projects describe PROJECT_ID

# Criar se não existe
gcloud projects create PROJECT_ID
```

### Erro: "API not enabled"

```bash
# Habilitar APIs necessárias
gcloud services enable oauth2.googleapis.com people.googleapis.com
```

### Erro: "Permission denied"

```bash
# Verificar permissões do usuário
gcloud auth list

# Fazer login novamente
gcloud auth login

# Verificar IAM roles
gcloud projects get-iam-policy PROJECT_ID
```

### Script falha com erro de permissão

```bash
# Verificar se componente alpha está instalado
gcloud components list

# Instalar se necessário
gcloud components install alpha

# Atualizar componentes
gcloud components update
```

## 📚 Recursos Adicionais

- [Google Cloud SDK Documentation](https://cloud.google.com/sdk/docs)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)
- [OAuth 2.0 Setup](https://cloud.google.com/docs/authentication/client-libraries)
- [IAP OAuth Configuration](https://cloud.google.com/iap/docs/programmatic-oauth-clients)

## 🎯 Próximos Passos

Após a instalação bem-sucedida:

1. Execute o script: `./scripts/setup-google-oauth.sh`
2. Siga as instruções na tela
3. Copie as credenciais geradas para os arquivos de configuração
4. Teste o login Google no app

---

**Dica**: Mantenha o gcloud CLI atualizado com `gcloud components update`
