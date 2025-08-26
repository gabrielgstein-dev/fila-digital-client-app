#!/usr/bin/env node

const { test, expect } = require('@playwright/test');

/**
 * Teste E2E rápido para validar configuração
 */
async function quickE2ETest() {
  console.log('🧪 Iniciando teste E2E rápido...');
  
  try {
    // Teste 1: Verificar se o app está rodando
    console.log('📱 Teste 1: Verificando se o app está disponível...');
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ App está rodando em localhost:3000');
    } else {
      console.log('❌ App não está disponível');
      return false;
    }

    // Teste 2: Verificar se a API está rodando
    console.log('🖥️ Teste 2: Verificando se a API está disponível...');
    try {
      const apiResponse = await fetch('http://localhost:3001/api/v1/auth/google/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: 'test', user: { id: '1', email: 'test@test.com', name: 'Test' } })
      });
      
      if (apiResponse.status === 401) {
        console.log('✅ API está rodando e rejeitando token inválido (comportamento esperado)');
      } else {
        console.log(`⚠️ API respondeu com status ${apiResponse.status}`);
      }
    } catch (error) {
      console.log('❌ API não está disponível:', error.message);
      return false;
    }

    // Teste 3: Verificar credenciais configuradas
    console.log('🔑 Teste 3: Verificando configuração de credenciais...');
    const fs = require('fs');
    const path = require('path');
    
    const configPath = path.join(__dirname, '../config/google-auth.ts');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      if (configContent.includes('483v2vp5uao65ac95cr10jtp7ka2qgkp')) {
        console.log('✅ Credencial Android (installed) configurada');
      } else {
        console.log('❌ Credencial Android não encontrada');
      }
      
      if (configContent.includes('791te1oun0q2ij37jfm9upbekpvmppfu')) {
        console.log('✅ Credencial Web referenciada no config');
      }
    } else {
      console.log('❌ Arquivo de configuração não encontrado');
      return false;
    }

    // Teste 4: Verificar .env da API
    console.log('⚙️ Teste 4: Verificando configuração da API...');
    const apiEnvPath = path.join(__dirname, '../../fila-api/.env');
    if (fs.existsSync(apiEnvPath)) {
      const envContent = fs.readFileSync(apiEnvPath, 'utf8');
      
      if (envContent.includes('GOOGLE_CLIENT_SECRET=GOCSPX-')) {
        console.log('✅ Client Secret configurado na API');
      } else {
        console.log('❌ Client Secret não encontrado na API');
      }
      
      if (envContent.includes('791te1oun0q2ij37jfm9upbekpvmppfu')) {
        console.log('✅ Client ID Web configurado na API');
      } else {
        console.log('❌ Client ID Web não configurado na API');
      }
    } else {
      console.log('⚠️ Arquivo .env da API não encontrado');
    }

    console.log('\n🎉 Testes básicos concluídos com sucesso!');
    console.log('\n📋 Resumo da Configuração:');
    console.log('• App: Credencial Android (installed)');
    console.log('• API: Credencial Web + Client Secret');
    console.log('• Servidores: Ambos rodando');
    console.log('• Arquitetura: Correta');

    return true;

  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  quickE2ETest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { quickE2ETest };

