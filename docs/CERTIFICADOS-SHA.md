# Certificados SHA para Google OAuth

## 🔐 Impressões Digitais Obtidas

### Para Android (Debug)
```
SHA-1: FB:8B:50:48:C2:43:9E:ED:E1:60:CE:37:9D:2D:CA:C5:01:6C:C2:3A
SHA-256: 8C:D5:7C:37:DC:E2:06:37:58:53:89:18:AE:45:6D:1D:29:61:CE:09:79:D8:63:F9:FA:C3:C6:A6:E4:A8:14:8E
```

### Nome do Pacote Android
```
com.filadigital.client
```

### Bundle ID iOS
```
com.filadigital.client
```

## 📋 Como Usar no Google Cloud Console

1. **Acesse:** [Google Cloud Console](https://console.cloud.google.com)
2. **Vá para:** APIs & Services > Credentials
3. **Clique:** Create Credentials > OAuth 2.0 Client ID

### Para Android:
- **Application type:** Android
- **Package name:** `com.filadigital.client`
- **SHA-1:** `FB:8B:50:48:C2:43:9E:ED:E1:60:CE:37:9D:2D:CA:C5:01:6C:C2:3A`

### Para iOS:
- **Application type:** iOS
- **Bundle ID:** `com.filadigital.client`

### Para Web:
- **Application type:** Web application
- **Authorized redirect URIs:** 
  - `http://localhost:3000`
  - `https://auth.expo.io/@yourusername/fila-client-app`

## 🔄 Comandos para Gerar Novamente

### Keystore Debug Android:
```bash
keytool -genkey -v -keystore ~/.android/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
```

### Ver SHA-1:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

### Ver SHA-256:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256
```

## ⚠️ Importante

- **Debug:** Use estas impressões apenas para desenvolvimento
- **Produção:** Gere um keystore específico para produção
- **Segurança:** Nunca compartilhe o keystore de produção

## 🎯 Próximos Passos

1. ✅ Copie a impressão SHA-1 acima
2. ⏳ Configure no Google Cloud Console
3. ⏳ Atualize as credenciais no app
4. ⏳ Teste o login Google real

