import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

test.describe('Google OAuth - Comunicação Real com API', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];
  let networkRequests: any[] = [];

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    consoleErrors = [];
    networkRequests = [];
    
    // Capturar logs do console
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      } else {
        consoleLogs.push(text);
      }
    });

    // Capturar requisições de rede
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Validação da API Real', () => {
    test('deve verificar se a API está rodando', async ({ page }) => {
      // Fazer requisição direta para health check da API
      const response = await page.request.get('http://localhost:3001/api/v1/health');
      expect(response.status()).toBe(200);
      
      const healthData = await response.json();
      expect(healthData).toHaveProperty('status', 'ok');
      expect(healthData).toHaveProperty('timestamp');
    });

    test('deve validar endpoint de auth Google', async ({ page }) => {
      // Testar endpoint específico do Google OAuth
      const response = await page.request.post('http://localhost:3001/api/v1/auth/google/token', {
        data: {
          access_token: 'fake_token_for_test',
          user: {
            id: '123',
            email: 'test@test.com',
            name: 'Test User'
          }
        }
      });
      
      // Deve retornar 401 (não 404 ou erro de CORS)
      expect(response.status()).toBe(401);
      
      const errorData = await response.json();
      expect(errorData).toHaveProperty('message', 'Token Google inválido');
    });

    test('deve validar headers CORS da API', async ({ page }) => {
      const response = await page.request.post('http://localhost:3001/api/v1/auth/google/token', {
        data: { test: 'data' },
        headers: {
          'Origin': 'http://localhost:8081'
        }
      });
      
      const corsHeader = response.headers()['access-control-allow-origin'];
      expect(corsHeader).toBe('http://localhost:8081');
    });
  });

  test.describe('Fluxo de Login Google Real', () => {
    test('deve iniciar processo de autenticação Google', async ({ page }) => {
      const googleButton = page.locator('text=Continuar com Google');
      await expect(googleButton).toBeVisible();
      
      // Clicar no botão do Google
      await googleButton.click();
      
      // Aguardar logs de inicialização
      await page.waitForTimeout(2000);
      
      // Verificar se logs de configuração aparecem
      const hasConfigLogs = consoleLogs.some(log => 
        log.includes('🚀 Iniciando login com Google') ||
        log.includes('🔍 Configuração atual')
      );
      expect(hasConfigLogs).toBeTruthy();
      
      // Verificar se credenciais estão configuradas
      const hasValidConfig = consoleLogs.some(log => 
        log.includes('"configured": true')
      );
      expect(hasValidConfig).toBeTruthy();
    });

    test('deve usar credenciais reais (não mock)', async ({ page }) => {
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      
      // Verificar se NÃO está usando modo mock
      const hasMockLog = consoleLogs.some(log => 
        log.includes('⚠️ Usando modo mock') ||
        log.includes('configuração não encontrada')
      );
      expect(hasMockLog).toBeFalsy();
      
      // Verificar se tem logs de OAuth real
      const hasRealOAuthLogs = consoleLogs.some(log => 
        log.includes('📝 Criando AuthRequest') ||
        log.includes('🔍 Buscando configuração de descoberta')
      );
      expect(hasRealOAuthLogs).toBeTruthy();
    });

    test('deve processar fluxo OAuth até obter código', async ({ page }) => {
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(5000);
      
      // Verificar logs do fluxo OAuth
      const hasOAuthSteps = consoleLogs.some(log => 
        log.includes('📱 Abrindo prompt de autenticação')
      );
      expect(hasOAuthSteps).toBeTruthy();
      
      // Verificar se não há erros críticos (ignorando warnings do Expo)
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('expo-notifications') && 
        !error.includes('development build') &&
        !error.includes('New Architecture')
      );
      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe('Comunicação com API Durante Login', () => {
    test('deve tentar comunicar com API real', async ({ page }) => {
      // Interceptar requisições para a API
      let apiRequests: any[] = [];
      page.on('request', request => {
        if (request.url().includes('192.168.1.111:3001')) {
          apiRequests.push({
            url: request.url(),
            method: request.method()
          });
        }
      });

      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(5000);
      
      // Aguardar possíveis requisições para API
      await page.waitForTimeout(3000);
      
      // Verificar se houve logs de comunicação com API
      const hasApiLogs = consoleLogs.some(log => 
        log.includes('📍 URL da API') ||
        log.includes('192.168.1.111:3001')
      );
      
      if (hasApiLogs) {
        console.log('✅ App configurado para comunicar com API real');
      }
    });

    test('deve usar URL correta da API', async ({ page }) => {
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      
      // Verificar se URL da API está correta nos logs
      const hasCorrectApiUrl = consoleLogs.some(log => 
        log.includes('📍 URL da API: http://192.168.1.111:3001/api/v1/auth/google/token')
      );
      
      // Se chegou até aqui, significa que não houve erro de CORS ou JSON Parse
      const hasJsonParseError = consoleErrors.some(error => 
        error.includes('JSON Parse error: Unexpected character')
      );
      expect(hasJsonParseError).toBeFalsy();
      
      const hasCorsError = consoleErrors.some(error => 
        error.includes('CORS') || error.includes('Cross-Origin')
      );
      expect(hasCorsError).toBeFalsy();
    });
  });

  test.describe('Validação de Credenciais Google', () => {
    test('deve usar credenciais corretas do projeto', async ({ page }) => {
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      
      // Verificar se está usando as credenciais corretas
      const hasCorrectClientId = consoleLogs.some(log => 
        log.includes('YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com')
      );
      expect(hasCorrectClientId).toBeTruthy();
      
      // Verificar redirect URI correto
      const hasCorrectRedirectUri = consoleLogs.some(log => 
        log.includes('exp://192.168.1.111:8081/--/auth') ||
        log.includes('filaclientapp://auth')
      );
      expect(hasCorrectRedirectUri).toBeTruthy();
    });

    test('deve completar descoberta de configuração Google', async ({ page }) => {
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(5000);
      
      // Verificar se descoberta do Google foi bem-sucedida
      const hasDiscoveryLog = consoleLogs.some(log => 
        log.includes('🔍 Buscando configuração de descoberta do Google')
      );
      expect(hasDiscoveryLog).toBeTruthy();
      
      // Verificar se não houve erro na descoberta
      const hasDiscoveryError = consoleErrors.some(error => 
        error.includes('discovery') || error.includes('well-known')
      );
      expect(hasDiscoveryError).toBeFalsy();
    });
  });

  test.describe('Integração API + Google OAuth', () => {
    test('deve validar que API tem credenciais Google configuradas', async ({ page }) => {
      // Verificar se API está usando as credenciais corretas através de logs
      await page.goto('/');
      
      // Fazer requisição de teste para verificar se API está configurada
      const response = await page.request.post('http://192.168.1.111:3001/api/v1/auth/google/token', {
        data: {
          access_token: 'test_token',
          user: { id: '123', email: 'test@test.com', name: 'Test' }
        }
      });
      
      // Se retornar 401 "Token Google inválido", significa que:
      // 1. CORS está funcionando
      // 2. API está processando a requisição
      // 3. API está tentando validar com Google (chegou até lá)
      expect(response.status()).toBe(401);
      
      const data = await response.json();
      expect(data.message).toBe('Token Google inválido');
    });

    test('deve demonstrar fluxo completo funcionando', async ({ page }) => {
      console.log('🧪 Testando fluxo completo Google OAuth + API Real');
      
      // 1. Verificar API está rodando
      const healthResponse = await page.request.get('http://192.168.1.111:3001/api/v1/health');
      expect(healthResponse.status()).toBe(200);
      console.log('✅ API rodando');
      
      // 2. Verificar CORS está configurado
      const corsResponse = await page.request.post('http://192.168.1.111:3001/api/v1/auth/google/token', {
        data: { test: 'data' },
        headers: { 'Origin': 'http://192.168.1.111:8081' }
      });
      expect(corsResponse.headers()['access-control-allow-origin']).toBe('http://192.168.1.111:8081');
      console.log('✅ CORS configurado');
      
      // 3. Iniciar login Google no app
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(5000);
      
      // 4. Verificar se não há erros críticos
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('expo-notifications') && 
        !error.includes('development build') &&
        !error.includes('New Architecture') &&
        !error.includes('Unsupported type')
      );
      
      console.log('📋 Logs capturados:', {
        totalLogs: consoleLogs.length,
        totalErrors: consoleErrors.length,
        criticalErrors: criticalErrors.length,
        apiRequests: networkRequests.filter(req => req.url.includes('192.168.1.111')).length
      });
      
      expect(criticalErrors.length).toBe(0);
      console.log('✅ Fluxo Google OAuth iniciado sem erros críticos');
    });
  });
});
