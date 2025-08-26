import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navegar para a página de login
  await page.goto('http://localhost:3000');
  
  // Aguardar a página carregar
  await page.waitForLoadState('networkidle');
  
  // Verificar se a página de login está carregada
  await expect(page.locator('text=Acesse suas Senhas')).toBeVisible();
  
  // Salvar estado autenticado
  await page.context().storageState({ path: authFile });
});

