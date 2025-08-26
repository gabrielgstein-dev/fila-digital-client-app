# 🧪 Instruções para Testes E2E - Google OAuth

## 🚨 PROBLEMA IDENTIFICADO

Pelos logs que você mostrou, **a correção do Google Auth ainda não foi aplicada** porque a aplicação não foi recarregada. Você precisa seguir estes passos:

## 📋 Passo a Passo para Resolver

### 1. **Parar o Servidor Atual**
No terminal onde o Expo está rodando, pressione:
```
Ctrl + C
```

### 2. **Verificar a Correção**
A correção já foi feita no arquivo `services/google-auth.ts`. Confira se está assim:
```typescript
// ❌ VERSÃO ANTIGA (que causa erro)
const request = new AuthSession.AuthRequest({
  // ...
  codeChallenge: await this.generateCodeChallenge(),
  codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
});

// ✅ VERSÃO CORRIGIDA (nossa implementação)
const request = new AuthSession.AuthRequest({
  // ...
  usePKCE: true,
});
```

### 3. **Reiniciar o Servidor com Cache Limpo**
```bash
pnpm start --clear
```

### 4. **Aguardar o Carregamento Completo**
Aguarde até ver:
```
› Web is waiting on http://localhost:8081
```

### 5. **Executar os Testes**

#### Teste Básico (verificar se aplicação carrega):
```bash
pnpm test:e2e e2e/basic-test.e2e.spec.ts
```

#### Teste Completo do Google Auth:
```bash
pnpm test:e2e:google
```

#### Teste Rápido da Correção:
```bash
pnpm test:e2e:google-quick
```

## 🔍 O Que os Testes Verificam

### ✅ Teste Básico
- Aplicação carrega sem erros
- Elementos da interface estão presentes
- **Detecta se o erro do Google Auth ainda existe**

### ✅ Teste Completo
- Correção PKCE funcionando
- Login Google completo
- Navegação para dashboard
- Token salvo corretamente
- Sem erros críticos

## 📊 Interpretando os Resultados

### ❌ Se o Erro Ainda Aparece:
```
⚠️  DETECTADO: Erro do Google Auth ainda presente
💡 SOLUÇÃO: Reinicie o servidor Expo para aplicar a correção
```

**Ação:** Repetir passos 1-4 (parar e reiniciar servidor)

### ✅ Se a Correção Funcionou:
```
✅ Erro do Google Auth foi corrigido!
🎉 TESTE PASSOU: Correção Google Auth funcionando!
```

**Resultado:** Tudo funcionando corretamente!

## 🛠️ Comandos de Diagnóstico

### Verificar se Servidor Está Rodando:
```bash
curl http://localhost:8081
```

### Verificar Logs em Tempo Real:
```bash
# No terminal do Expo, observe se ainda aparece:
ERROR  Erro na autenticação Google: [TypeError: AuthSession.AuthRequest.createRandomCodeChallenge is not a function]
```

### Executar Teste Manual:
```bash
node scripts/test-google-auth-fix.js
```

## 🎯 Checklist de Verificação

- [ ] Servidor Expo parado completamente
- [ ] Arquivo `services/google-auth.ts` tem `usePKCE: true`
- [ ] Servidor reiniciado com `--clear`
- [ ] Aplicação carrega em `http://localhost:8081`
- [ ] Logs não mostram erro `createRandomCodeChallenge`
- [ ] Testes E2E passam

## 🚀 Execução Completa

Se quiser executar tudo automaticamente:

```bash
# Terminal 1: Parar servidor atual e reiniciar
# Ctrl+C, depois:
pnpm start --clear

# Terminal 2: Aguardar servidor subir, depois executar:
pnpm test:e2e:google
```

## 📈 Relatórios

Os testes geram relatórios em:
- `test-results/` - Screenshots e logs
- `test-results/google-oauth-validation-report.json` - Relatório JSON

## 🆘 Solução de Problemas

### Erro: "net::ERR_CONNECTION_REFUSED"
- **Causa:** Servidor Expo não está rodando
- **Solução:** Execute `pnpm start` primeiro

### Erro: "createRandomCodeChallenge is not a function"
- **Causa:** Aplicação não foi recarregada
- **Solução:** Pare e reinicie o servidor com `--clear`

### Playwright não encontra elementos
- **Causa:** Interface mudou ou carregamento lento
- **Solução:** Aguarde mais tempo ou ajuste timeouts

---

## ✅ Status Atual

✅ **Correção implementada** em `services/google-auth.ts`
✅ **Testes E2E criados** e configurados
⏳ **Aguardando:** Reinicialização do servidor para aplicar correção
⏳ **Próximo passo:** Executar testes após reiniciar servidor 