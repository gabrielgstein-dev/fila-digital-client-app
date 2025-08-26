import { test, expect } from '@playwright/test';

test.describe('Google Auth - Teste Real do App', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];
  let apiRequests: any[] = [];

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    consoleErrors = [];
    apiRequests = [];
    
    // Capturar logs do console
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
        console.log('🔴 CONSOLE ERROR:', text);
      } else {
        consoleLogs.push(text);
        console.log('📝 CONSOLE LOG:', text);
      }
    });

    // Capturar requisições de rede especificamente para a API
    page.on('request', request => {
      if (request.url().includes('localhost:3001')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          timestamp: new Date().toISOString()
        });
        console.log('🌐 REQUISIÇÃO PARA API:', request.method(), request.url());
      }
    });

    // Capturar respostas da API
    page.on('response', response => {
      if (response.url().includes('localhost:3001')) {
        console.log('📡 RESPOSTA DA API:', response.status(), response.url());
      }
    });
  });

  test('deve fazer login Google real e chamar a API', async ({ page }) => {
    console.log('🚀 Iniciando teste real do login Google...');
    
    // Ir para o app
    await page.goto('http://localhost:8081/');
    await page.waitForLoadState('networkidle');
    
    console.log('📱 App carregado, procurando botão Google...');
    
    // Verificar se o botão do Google existe
    const googleButton = page.locator('text=Continuar com Google');
    await expect(googleButton).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Botão Google encontrado, clicando...');
    
    // Clicar no botão do Google
    await googleButton.click();
    
    // Aguardar processamento
    await page.waitForTimeout(5000);
    
    console.log('⏳ Aguardando logs e requisições...');
    
    // Verificar logs detalhadamente
    console.log('📋 TOTAL DE LOGS CAPTURADOS:', consoleLogs.length);
    console.log('🔴 TOTAL DE ERROS CAPTURADOS:', consoleErrors.length);
    console.log('🌐 TOTAL DE REQUISIÇÕES PARA API:', apiRequests.length);
    
    // Imprimir todos os logs relevantes
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('Google') || 
      log.includes('auth') || 
      log.includes('API') ||
      log.includes('localhost:3001') ||
      log.includes('🚀') ||
      log.includes('🔍') ||
      log.includes('📍')
    );
    
    console.log('📝 LOGS RELEVANTES:', relevantLogs);
    
    // Imprimir erros não relacionados ao Expo
    const relevantErrors = consoleErrors.filter(error => 
      !error.includes('expo-notifications') && 
      !error.includes('development build') &&
      !error.includes('New Architecture')
    );
    
    console.log('🔴 ERROS RELEVANTES:', relevantErrors);
    
    // Verificar se houve requisições para a API
    if (apiRequests.length > 0) {
      console.log('🎉 SUCCESS: App fez requisições para a API!');
      apiRequests.forEach(req => {
        console.log(`  - ${req.method} ${req.url} em ${req.timestamp}`);
      });
    } else {
      console.log('❌ PROBLEMA: Nenhuma requisição para a API foi detectada');
      console.log('🔍 Verificando se o app está configurado corretamente...');
      
      // Verificar se há logs de configuração
      const hasConfigLogs = consoleLogs.some(log => 
        log.includes('Configuração atual') || log.includes('URL da API')
      );
      
      if (hasConfigLogs) {
        console.log('✅ App tem logs de configuração');
      } else {
        console.log('❌ App não mostra logs de configuração - pode estar em modo mock');
      }
    }
    
    // Aguardar mais um pouco para capturar requisições tardias
    await page.waitForTimeout(3000);
    
    // Verificação final
    expect(apiRequests.length).toBeGreaterThan(0);
  });

  test('deve verificar se app está em modo mock vs real', async ({ page }) => {
    console.log('🔍 Verificando modo do app...');
    
    await page.goto('http://localhost:8081/');
    await page.waitForLoadState('networkidle');
    
    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();
    
    await page.waitForTimeout(3000);
    
    // Verificar se está em modo mock
    const isMockMode = consoleLogs.some(log => 
      log.includes('mock') || 
      log.includes('demo') ||
      log.includes('configuração não encontrada')
    );
    
    // Verificar se está em modo real
    const isRealMode = consoleLogs.some(log => 
      log.includes('AuthRequest') ||
      log.includes('descoberta do Google') ||
      log.includes('localhost:3001')
    );
    
    console.log('🤖 Modo Mock:', isMockMode);
    console.log('🔄 Modo Real:', isRealMode);
    
    if (isMockMode) {
      console.log('⚠️ App está rodando em modo MOCK - não vai chamar API real');
    } else if (isRealMode) {
      console.log('✅ App está rodando em modo REAL - deveria chamar API');
    } else {
      console.log('❓ Modo do app não identificado');
    }
    
    // Se está em modo real mas não fez requisições, há um problema
    if (isRealMode && apiRequests.length === 0) {
      console.log('🔴 PROBLEMA: App em modo real mas não fez requisições para API');
    }
  });

  test('deve monitorar todo o fluxo de autenticação', async ({ page }) => {
    console.log('🕵️ Monitorando fluxo completo...');
    
    let oauthStarted = false;
    let oauthCompleted = false;
    
    await page.goto('http://localhost:8081/');
    await page.waitForLoadState('networkidle');
    
    const googleButton = page.locator('text=Continuar com Google');
    await googleButton.click();
    
    // Monitorar por 10 segundos
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(1000);
      
      // Verificar se OAuth iniciou
      if (!oauthStarted && consoleLogs.some(log => log.includes('Iniciando login com Google'))) {
        oauthStarted = true;
        console.log(`✅ OAuth iniciado após ${i + 1} segundos`);
      }
      
      // Verificar se fez requisição para API
      if (apiRequests.length > 0) {
        oauthCompleted = true;
        console.log(`🎉 Requisição para API detectada após ${i + 1} segundos`);
        break;
      }
      
      console.log(`⏳ Segundo ${i + 1}: ${consoleLogs.length} logs, ${apiRequests.length} requisições API`);
    }
    
    console.log('📊 RESULTADO FINAL:');
    console.log(`  - OAuth iniciado: ${oauthStarted}`);
    console.log(`  - API chamada: ${oauthCompleted}`);
    console.log(`  - Total logs: ${consoleLogs.length}`);
    console.log(`  - Total erros: ${consoleErrors.length}`);
    console.log(`  - Requisições API: ${apiRequests.length}`);
    
    // O teste deveria detectar pelo menos o início do OAuth
    expect(oauthStarted).toBeTruthy();
  });
});
