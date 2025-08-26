#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Iniciando testes E2E para Google OAuth...\n');

async function runE2ETests() {
  const testResults = {
    timestamp: new Date().toISOString(),
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    details: []
  };

  try {
    console.log('📦 Verificando dependências...');
    
    try {
      execSync('npx playwright --version', { stdio: 'pipe' });
      console.log('✅ Playwright instalado');
    } catch {
      console.log('📥 Instalando Playwright...');
      execSync('npx playwright install', { stdio: 'inherit' });
    }

    console.log('\n🚀 Iniciando servidor de desenvolvimento...');
    
    const serverProcess = spawn('pnpm', ['start', '--web', '--port', '8081'], {
      stdio: 'pipe',
      detached: false
    });

    let serverReady = false;
    const serverTimeout = setTimeout(() => {
      if (!serverReady) {
        console.error('❌ Timeout: Servidor não iniciou em 60 segundos');
        serverProcess.kill();
        process.exit(1);
      }
    }, 60000);

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Web is waiting on') || output.includes('localhost:8081')) {
        serverReady = true;
        clearTimeout(serverTimeout);
        console.log('✅ Servidor iniciado com sucesso');
      }
    });

    await new Promise(resolve => {
      const checkServer = setInterval(() => {
        if (serverReady) {
          clearInterval(checkServer);
          resolve();
        }
      }, 1000);
    });

    console.log('\n🧪 Executando testes E2E...\n');

    const testFiles = [
      'google-auth.e2e.spec.ts',
      'google-auth-service.e2e.spec.ts'
    ];

    for (const testFile of testFiles) {
      const testPath = path.join('e2e', testFile);
      
      console.log(`\n🔍 Executando: ${testFile}`);
      console.log('='.repeat(50));

      try {
        const result = execSync(
          `npx playwright test ${testPath} --reporter=json --output-dir=test-results`, 
          { 
            stdio: 'pipe',
            timeout: 120000
          }
        );

        const output = result.toString();
        console.log('✅ Testes passaram');
        
        testResults.details.push({
          file: testFile,
          status: 'passed',
          output: output.substring(0, 500)
        });

      } catch (error) {
        console.log(`❌ Falhas encontradas em ${testFile}`);
        console.log(error.stdout?.toString() || error.message);
        
        testResults.details.push({
          file: testFile,
          status: 'failed',
          error: error.message,
          output: error.stdout?.toString() || 'Sem output'
        });
        testResults.failedTests++;
      }
    }

    console.log('\n📊 Executando teste específico da correção AuthSession...');
    
    try {
      const quickTest = execSync(
        `npx playwright test e2e/google-auth-service.e2e.spec.ts -g "deve usar usePKCE corretamente" --reporter=line`,
        { stdio: 'pipe', timeout: 30000 }
      );
      
      console.log('✅ Correção PKCE validada com sucesso');
      testResults.passedTests++;
      
    } catch (error) {
      console.log('❌ Falha na validação da correção PKCE');
      console.log(error.stdout?.toString() || error.message);
      testResults.failedTests++;
    }

    serverProcess.kill();
    
    console.log('\n📈 Gerando relatório...');
    
    const reportPath = 'test-results/google-oauth-validation-report.json';
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    
    console.log(`✅ Relatório salvo em: ${reportPath}`);
    
    generateSummaryReport(testResults);

  } catch (error) {
    console.error('❌ Erro durante execução dos testes:', error.message);
    process.exit(1);
  }
}

function generateSummaryReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 RELATÓRIO FINAL - VALIDAÇÃO GOOGLE OAUTH');
  console.log('='.repeat(60));
  
  console.log(`🕐 Executado em: ${results.timestamp}`);
  console.log(`✅ Testes bem-sucedidos: ${results.passedTests}`);
  console.log(`❌ Testes com falha: ${results.failedTests}`);
  console.log(`📊 Total de testes: ${results.passedTests + results.failedTests}`);
  
  if (results.failedTests === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ A correção do Google OAuth está funcionando corretamente');
    console.log('✅ AuthSession.createRandomCodeChallenge foi corrigido');
    console.log('✅ PKCE está sendo usado corretamente');
    console.log('✅ Fluxo de autenticação está operacional');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM');
    console.log('Verifique os detalhes nos logs acima');
  }

  console.log('\n📁 Arquivos de teste validados:');
  results.details.forEach(detail => {
    const icon = detail.status === 'passed' ? '✅' : '❌';
    console.log(`${icon} ${detail.file} - ${detail.status}`);
  });

  console.log('\n' + '='.repeat(60));
}

if (require.main === module) {
  runE2ETests().catch(console.error);
}

module.exports = { runE2ETests }; 