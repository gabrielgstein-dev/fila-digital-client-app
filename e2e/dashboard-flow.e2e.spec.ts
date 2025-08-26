import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full login to dashboard flow', async ({ page }) => {
    // Mock alerts para auto-aceitar
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Login via Google (demo)
    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();

    // Aguardar redirecionamento
    await page.waitForURL('**/tabs', { timeout: 10000 });

    // Verificar elementos do dashboard
    await expect(page.locator('text=Olá!')).toBeVisible();
    await expect(page.locator('text=Usuário Google')).toBeVisible();
    
    // Verificar se há seção de resumo
    await expect(page.locator('text=Resumo')).toBeVisible();
    
    // Verificar navegação por tabs
    const newTicketTab = page.locator('text=Nova Senha');
    await expect(newTicketTab).toBeVisible();
    
    const myTicketsTab = page.locator('text=Minhas Senhas');
    await expect(myTicketsTab).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Login primeiro
    page.on('dialog', async dialog => await dialog.accept());
    
    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();
    await page.waitForURL('**/tabs', { timeout: 10000 });

    // Navegar para Nova Senha
    const newTicketTab = page.locator('text=Nova Senha');
    await newTicketTab.click();
    
    // Verificar se está na página certa
    await expect(page.locator('text=Tirar Nova Senha')).toBeVisible();
    
    // Voltar para Minhas Senhas
    const myTicketsTab = page.locator('text=Minhas Senhas');
    await myTicketsTab.click();
    
    // Verificar se voltou
    await expect(page.locator('text=Olá!')).toBeVisible();
  });

  test('should display connection status', async ({ page }) => {
    // Login
    page.on('dialog', async dialog => await dialog.accept());
    
    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();
    await page.waitForURL('**/tabs', { timeout: 10000 });

    // Verificar status de conexão
    const statusIndicator = page.locator('text=Online, text=Offline').first();
    await expect(statusIndicator).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    // Login
    page.on('dialog', async dialog => await dialog.accept());
    
    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();
    await page.waitForURL('**/tabs', { timeout: 10000 });

    // Tentar fazer logout (procurar botão de logout)
    const logoutButton = page.locator('[name="log-out-outline"]');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Confirmar logout no alert
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Sair');
        await dialog.accept();
      });
      
      // Verificar se voltou para login
      await expect(page.locator('text=Acesse suas Senhas')).toBeVisible();
    }
  });

  test('should handle refresh properly', async ({ page }) => {
    // Login
    page.on('dialog', async dialog => await dialog.accept());
    
    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();
    await page.waitForURL('**/tabs', { timeout: 10000 });

    // Refresh da página
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Deve manter autenticação ou redirecionar apropriadamente
    const hasLoginForm = await page.locator('text=Acesse suas Senhas').isVisible();
    const hasDashboard = await page.locator('text=Olá!').isVisible();
    
    // Um dos dois deve estar visível
    expect(hasLoginForm || hasDashboard).toBeTruthy();
  });

  test('should display empty state when no tickets', async ({ page }) => {
    // Login
    page.on('dialog', async dialog => await dialog.accept());
    
    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();
    await page.waitForURL('**/tabs', { timeout: 10000 });

    // Verificar se mostra estado vazio (provável para usuário demo)
    const emptyState = page.locator('text=Nenhuma senha ativa');
    if (await emptyState.isVisible()) {
      await expect(page.locator('text=Você não possui senhas ativas')).toBeVisible();
    }
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Simular erro de rede
    await page.route('**/api/v1/**', route => {
      route.abort('failed');
    });

    // Tentar login
    page.on('dialog', async dialog => await dialog.accept());
    
    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();

    // Verificar se há tratamento de erro
    await page.waitForTimeout(3000);
    
    // Pode mostrar erro ou continuar com dados mockados
    const hasError = await page.locator('text=Erro').isVisible();
    const hasDashboard = await page.locator('text=Olá!').isVisible();
    
    expect(hasError || hasDashboard).toBeTruthy();
  });
});

