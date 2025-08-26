#!/usr/bin/env node

const userAgent = process.env.npm_config_user_agent || '';

if (!userAgent.includes('pnpm')) {
  console.error('\n❌ Este projeto deve usar apenas pnpm como gerenciador de pacotes!\n');
  console.error('🔧 Para instalar as dependências, use: pnpm install\n');
  console.error('📦 Se você não tem o pnpm instalado, execute: npm install -g pnpm\n');
  console.error('📚 Mais informações: https://pnpm.io/\n');
  process.exit(1);
}

console.log('✅ Usando pnpm - correto!\n'); 