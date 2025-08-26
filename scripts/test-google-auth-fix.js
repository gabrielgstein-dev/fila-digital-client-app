#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testGoogleAuthFix() {
  console.log('🧪 Testando correção do Google Auth...\n');
  
  let browser = null;
  let success = false;
  
  try {
    console.log('🚀 Iniciando browser...');
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    console.log('📱 Navegando para aplicação...');
    await page.goto('http://localhost:8081', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    console.log('🔍 Procurando botão do Google...');
    await page.waitForSelector('text=Continuar com Google', { timeout: 15000 });
    
    // Aceitar diálogos automaticamente
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    console.log('🖱️  Clicando no botão do Google...');
    await page.click('text=Continuar com Google');
    
    // Aguardar processamento
    await page.waitForTimeout(5000);
    
    console.log('📊 Analisando resultados...\n');
    
    // Verificar se o erro antigo apareceu
    const hasOldError = consoleErrors.some(error => 
      error.includes('AuthSession.AuthRequest.createRandomCodeChallenge is not a function')
    );
    
    // Filtrar erros críticos (ignorar warnings conhecidos)
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('expo-notifications') && 
      !error.includes('development build') &&
      !error.includes('New Architecture') &&
      !error.includes('shadow')
    );
    
    console.log('='.repeat(60));
    console.log('📋 RESULTADO DO TESTE');
    console.log('='.repeat(60));
    
    if (hasOldError) {
      console.log('❌ FALHA: Erro createRandomCodeChallenge ainda presente');
      console.log('⚠️  A correção não foi aplicada ou a aplicação não foi recarregada');
    } else {
      console.log('✅ SUCESSO: Erro createRandomCodeChallenge foi corrigido');
      success = true;
    }
    
    console.log(`📈 Total de erros críticos: ${criticalErrors.length}`);
    
    if (criticalErrors.length > 0) {
      console.log('\n🚨 Erros críticos encontrados:');
      criticalErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ Nenhum erro crítico encontrado');
    }
    
    // Verificar se conseguiu navegar (indicativo de sucesso)
    const currentUrl = page.url();
    if (currentUrl.includes('tabs')) {
      console.log('✅ Navegação para dashboard bem-sucedida');
      success = true;
    }
    
    console.log('='.repeat(60));
    
    if (success && criticalErrors.length === 0) {
      console.log('🎉 TESTE PASSOU: Correção Google Auth funcionando!');
    } else {
      console.log('⚠️  ATENÇÃO: Verificar correções necessárias');
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
    
    if (error.message.includes('ERR_CONNECTION_REFUSED')) {
      console.log('\n💡 Dica: Certifique-se que o servidor está rodando:');
      console.log('   pnpm start');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testGoogleAuthFix().catch(console.error);
}

module.exports = { testGoogleAuthFix }; 