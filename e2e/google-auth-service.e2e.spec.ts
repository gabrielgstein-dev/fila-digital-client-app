import { test, expect } from '@playwright/test';

test.describe('Google Auth Service - Validação Técnica', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.testResults = {};
      window.originalConsoleError = console.error;
      window.capturedErrors = [];
      
      console.error = (...args) => {
        window.capturedErrors.push(args.join(' '));
        window.originalConsoleError(...args);
      };
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('deve usar usePKCE corretamente no AuthSession', async ({ page }) => {
    let authSessionCreated = false;
    let usedCorrectPKCE = false;

    await page.addInitScript(() => {
      const originalAuthRequest = window.AuthSession?.AuthRequest;
      if (originalAuthRequest) {
        window.AuthSession.AuthRequest = function(config) {
          window.testResults.authRequestConfig = config;
          window.testResults.usedPKCE = config.usePKCE === true;
          window.testResults.hasCodeChallenge = 'codeChallenge' in config;
          return new originalAuthRequest(config);
        };
      }
    });

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();

    await page.waitForTimeout(3000);

    const testResults = await page.evaluate(() => window.testResults);
    const capturedErrors = await page.evaluate(() => window.capturedErrors);

    expect(testResults.usedPKCE).toBeTruthy();
    expect(testResults.hasCodeChallenge).toBeFalsy();
    
    const hasOldPKCEError = capturedErrors.some(error => 
      error.includes('createRandomCodeChallenge')
    );
    
    expect(hasOldPKCEError).toBeFalsy();
  });

  test('deve usar fetchDiscoveryAsync corretamente', async ({ page }) => {
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.apiCalls = [];
      
      window.fetch = function(...args) {
        if (args[0].includes('well-known')) {
          window.apiCalls.push({
            url: args[0],
            type: 'discovery'
          });
        }
        return originalFetch(...args);
      };
    });

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();

    await page.waitForTimeout(3000);

    const apiCalls = await page.evaluate(() => window.apiCalls || []);
    
    const hasDiscoveryCall = apiCalls.some(call => 
      call.type === 'discovery' && 
      call.url.includes('well-known/openid_configuration')
    );

    expect(hasDiscoveryCall).toBeTruthy();
  });

  test('deve funcionar em modo desenvolvimento sem credenciais', async ({ page }) => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Google OAuth Configurado!');
      await dialog.accept();
    });

    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();

    await page.waitForTimeout(5000);

    const capturedErrors = await page.evaluate(() => window.capturedErrors);
    
    const criticalErrors = capturedErrors.filter(error => 
      !error.includes('expo-notifications') && 
      !error.includes('development build') &&
      !error.includes('New Architecture') &&
      !error.includes('shadow')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('deve processar mock login corretamente', async ({ page }) => {
    let mockUserData = null;

    await page.addInitScript(() => {
      window.mockLoginCompleted = false;
      window.mockUserInfo = null;
    });

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();

    await page.waitForTimeout(3000);
    await page.waitForURL('**/tabs', { timeout: 10000 });

    const userInfo = await page.evaluate(() => {
      return {
        hasAuthToken: localStorage.getItem('authToken') !== null,
        currentUrl: window.location.pathname
      };
    });

    expect(userInfo.hasAuthToken).toBeTruthy();
    expect(userInfo.currentUrl).toContain('tabs');
  });

  test('deve validar estrutura do token salvo', async ({ page }) => {
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();

    await page.waitForTimeout(3000);

    const tokenInfo = await page.evaluate(() => {
      const token = localStorage.getItem('authToken');
      return {
        hasToken: token !== null,
        tokenType: typeof token,
        tokenPrefix: token ? token.substring(0, 10) : null,
        timestamp: Date.now()
      };
    });

    expect(tokenInfo.hasToken).toBeTruthy();
    expect(tokenInfo.tokenType).toBe('string');
    expect(tokenInfo.tokenPrefix).toContain('demo_token');
  });

  test('deve limpar dados no logout', async ({ page }) => {
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();

    await page.waitForTimeout(3000);
    await page.waitForURL('**/tabs', { timeout: 10000 });

    const hasTokenBeforeLogout = await page.evaluate(() => {
      return localStorage.getItem('authToken') !== null;
    });

    expect(hasTokenBeforeLogout).toBeTruthy();

    await page.evaluate(() => {
      if (window.googleAuthService) {
        window.googleAuthService.signOut();
      }
    });

    await page.waitForTimeout(1000);

    const hasTokenAfterLogout = await page.evaluate(() => {
      return localStorage.getItem('authToken') !== null;
    });

    expect(hasTokenAfterLogout).toBeFalsy();
  });

  test('deve configurar redirectUri corretamente', async ({ page }) => {
    await page.addInitScript(() => {
      window.redirectUriInfo = {};
      
      const originalMakeRedirectUri = window.AuthSession?.makeRedirectUri;
      if (originalMakeRedirectUri) {
        window.AuthSession.makeRedirectUri = function(config) {
          window.redirectUriInfo = config;
          return originalMakeRedirectUri(config);
        };
      }
    });

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();

    await page.waitForTimeout(3000);

    const redirectInfo = await page.evaluate(() => window.redirectUriInfo);

    expect(redirectInfo.scheme).toBe('filaclientapp');
    expect(redirectInfo.path).toBe('auth');
  });

  test('deve validar configuração de scopes', async ({ page }) => {
    await page.addInitScript(() => {
      window.authConfig = {};
      
      const originalAuthRequest = window.AuthSession?.AuthRequest;
      if (originalAuthRequest) {
        window.AuthSession.AuthRequest = function(config) {
          window.authConfig = config;
          return new originalAuthRequest(config);
        };
      }
    });

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();

    await page.waitForTimeout(3000);

    const config = await page.evaluate(() => window.authConfig);

    expect(config.scopes).toEqual(['openid', 'profile', 'email']);
    expect(config.responseType).toBe('code');
    expect(config.usePKCE).toBe(true);
  });
}); 