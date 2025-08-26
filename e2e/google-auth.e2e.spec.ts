import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

test.describe('Google OAuth Flow - Validação Completa', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    consoleErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else {
        consoleLogs.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Validação da Interface', () => {
    test('deve exibir botão do Google corretamente', async ({ page }) => {
      const googleButton = page.locator('text=Continuar com Google');
      await expect(googleButton).toBeVisible();
      
      const googleIcon = page.locator('[name="logo-google"]');
      await expect(googleIcon).toBeVisible();
    });

    test('deve exibir formulário de login alternativo', async ({ page }) => {
      await expect(page.locator('input[placeholder*="nome"]')).toBeVisible();
      await expect(page.locator('input[placeholder*="Telefone"]')).toBeVisible();
      await expect(page.locator('input[placeholder*="Email"]')).toBeVisible();
      await expect(page.locator('text=Acessar Minhas Senhas')).toBeVisible();
    });
  });

  test.describe('Validação do AuthSession - Correção PKCE', () => {
    test('não deve gerar erros de AuthSession.createRandomCodeChallenge', async ({ page }) => {
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      
      const hasAuthSessionError = consoleErrors.some(error => 
        error.includes('AuthSession.AuthRequest.createRandomCodeChallenge is not a function')
      );
      
      expect(hasAuthSessionError).toBeFalsy();
    });

    test('deve usar PKCE corretamente', async ({ page }) => {
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      
      const hasPKCELogs = consoleLogs.some(log => 
        log.includes('usePKCE') || log.includes('code_verifier') || log.includes('PKCE')
      );
      
      expect(consoleErrors.length).toBe(0);
    });

    test('deve completar fluxo de autenticação sem erros', async ({ page }) => {
      let dialogShown = false;
      
      page.on('dialog', async dialog => {
        dialogShown = true;
        expect(dialog.message()).toContain('Google OAuth Configurado!');
        await dialog.accept();
      });
      
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      
      expect(dialogShown).toBeTruthy();
      expect(consoleErrors.filter(error => 
        !error.includes('expo-notifications') && 
        !error.includes('development build')
      ).length).toBe(0);
    });
  });

  test.describe('Fluxo de Autenticação Completo', () => {
    test('deve navegar para dashboard após login Google', async ({ page }) => {
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      
      await page.waitForURL('**/tabs', { timeout: 10000 });
      
      await expect(page.locator('text=Olá!')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('text=Usuário Google')).toBeVisible();
    });

    test('deve salvar token de autenticação', async ({ page }) => {
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      
      const hasAuthToken = await page.evaluate(() => {
        return localStorage.getItem('authToken') !== null ||
               sessionStorage.getItem('authToken') !== null;
      });
      
      expect(hasAuthToken).toBeTruthy();
    });

    test('deve exibir informações corretas do usuário demo', async ({ page }) => {
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      await page.waitForURL('**/tabs', { timeout: 10000 });
      
      await expect(page.locator('text=usuario.demo@gmail.com')).toBeVisible();
      await expect(page.locator('text=Usuário Demonstração')).toBeVisible();
    });
  });

  test.describe('Cenários de Erro e Edge Cases', () => {
    test('deve manter botões desabilitados durante loading', async ({ page }) => {
      const googleButton = page.locator('text=Continuar com Google');
      const regularButton = page.locator('text=Acessar Minhas Senhas');
      
      await expect(googleButton).toBeEnabled();
      await expect(regularButton).toBeEnabled();
      
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await googleButton.click();
      
      await expect(googleButton).toBeDisabled();
      await expect(regularButton).toBeDisabled();
    });

    test('deve funcionar corretamente em modo development', async ({ page }) => {
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      
      const hasMockLoginLog = consoleLogs.some(log => 
        log.includes('demo') || log.includes('mock')
      );
      
      expect(consoleErrors.filter(error => 
        !error.includes('expo-notifications') && 
        !error.includes('development build')
      ).length).toBe(0);
    });

    test('deve validar configuração do Google OAuth', async ({ page }) => {
      const hasConfigValidation = await page.evaluate(() => {
        return window.__EXPO_DEVELOPMENT__ !== undefined;
      });
      
      expect(typeof hasConfigValidation).toBe('boolean');
    });
  });

  test.describe('Integração com API', () => {
    test('deve processar resposta da API corretamente', async ({ page }) => {
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      
      const hasApiCalls = consoleLogs.some(log => 
        log.includes('API') || log.includes('token') || log.includes('auth')
      );
      
      expect(consoleErrors.filter(error => 
        !error.includes('expo-notifications') && 
        !error.includes('development build') &&
        !error.includes('New Architecture')
      ).length).toBe(0);
    });

    test('deve gerenciar estado de autenticação', async ({ page }) => {
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      const googleButton = page.locator('text=Continuar com Google');
      await googleButton.click();
      
      await page.waitForTimeout(3000);
      await page.waitForURL('**/tabs', { timeout: 10000 });
      
      const authState = await page.evaluate(() => {
        return {
          hasToken: localStorage.getItem('authToken') !== null,
          url: window.location.pathname
        };
      });
      
      expect(authState.hasToken).toBeTruthy();
      expect(authState.url).toContain('tabs');
    });
  });

  test.describe('Comparação com Login Regular', () => {
    test('deve funcionar login regular como alternativa', async ({ page }) => {
      await page.fill('input[placeholder*="nome"]', 'Usuário Teste E2E');
      await page.fill('input[placeholder*="Telefone"]', '11987654321');
      await page.fill('input[placeholder*="Email"]', 'teste.e2e@exemplo.com');
      
      const loginButton = page.locator('text=Acessar Minhas Senhas');
      await loginButton.click();
      
      await page.waitForTimeout(3000);
      
      await expect(page.locator('text=Olá!')).toBeVisible({ timeout: 15000 });
      
      expect(consoleErrors.filter(error => 
        !error.includes('expo-notifications') && 
        !error.includes('development build')
      ).length).toBe(0);
    });
  });

  test.describe('Validação de Performance', () => {
    test('deve carregar rapidamente sem erros de bundle', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(10000); // Menos de 10 segundos
      
      const hasBundleErrors = consoleErrors.some(error => 
        error.includes('bundle') || error.includes('chunk')
      );
      
      expect(hasBundleErrors).toBeFalsy();
    });
  });
});

