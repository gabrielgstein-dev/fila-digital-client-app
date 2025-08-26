import { test, expect } from '@playwright/test';

test.describe('Validação API Google OAuth - Testes Isolados', () => {

  test.describe('Validação da API Real', () => {
    test('deve verificar se a API está rodando', async ({ request }) => {
      const response = await request.get('http://192.168.1.111:3001/api/v1/health');
      expect(response.status()).toBe(200);
      
      const healthData = await response.json();
      expect(healthData).toHaveProperty('status', 'ok');
      expect(healthData).toHaveProperty('timestamp');
      
      console.log('✅ API está rodando e respondendo corretamente');
    });

    test('deve validar endpoint de auth Google retorna erro correto', async ({ request }) => {
      const response = await request.post('http://192.168.1.111:3001/api/v1/auth/google/token', {
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
      
      console.log('✅ Endpoint Google OAuth está funcionando (retornou 401 como esperado)');
    });

    test('deve validar headers CORS estão corretos', async ({ request }) => {
      const response = await request.post('http://192.168.1.111:3001/api/v1/auth/google/token', {
        data: { test: 'data' },
        headers: {
          'Origin': 'http://192.168.1.111:8081'
        }
      });
      
      const corsHeader = response.headers()['access-control-allow-origin'];
      expect(corsHeader).toBe('http://192.168.1.111:8081');
      
      console.log('✅ CORS está configurado corretamente para origin do app');
    });

    test('deve validar que API processa JSON corretamente', async ({ request }) => {
      const response = await request.post('http://192.168.1.111:3001/api/v1/auth/google/token', {
        data: {
          access_token: 'test_token_123',
          user: {
            id: 'user123',
            email: 'user@example.com',
            name: 'Test User'
          }
        },
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://192.168.1.111:8081'
        }
      });
      
      // API deve processar e retornar JSON válido (não HTML)
      expect(response.status()).toBe(401);
      expect(response.headers()['content-type']).toContain('application/json');
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('message');
      expect(responseData).toHaveProperty('error');
      expect(responseData).toHaveProperty('statusCode');
      
      console.log('✅ API está retornando JSON válido (não HTML)');
      console.log('📄 Resposta da API:', responseData);
    });

    test('deve testar diferentes origins CORS', async ({ request }) => {
      const origins = [
        'http://localhost:19006',
        'http://192.168.1.111:19006', 
        'http://192.168.1.111:8081'
      ];

      for (const origin of origins) {
        const response = await request.post('http://192.168.1.111:3001/api/v1/auth/google/token', {
          data: { test: 'data' },
          headers: { 'Origin': origin }
        });
        
        const corsHeader = response.headers()['access-control-allow-origin'];
        expect(corsHeader).toBe(origin);
        console.log(`✅ CORS funcionando para origin: ${origin}`);
      }
    });

    test('deve validar fluxo completo de validação de token', async ({ request }) => {
      console.log('🧪 Testando fluxo completo de validação');
      
      // 1. Testar com token claramente inválido
      const response1 = await request.post('http://192.168.1.111:3001/api/v1/auth/google/token', {
        data: {
          access_token: 'clearly_invalid_token',
          user: {
            id: 'test123',
            email: 'test@test.com',
            name: 'Test User'
          }
        }
      });
      
      expect(response1.status()).toBe(401);
      const data1 = await response1.json();
      expect(data1.message).toBe('Token Google inválido');
      console.log('✅ Token inválido rejeitado corretamente');
      
      // 2. Testar sem access_token
      const response2 = await request.post('http://192.168.1.111:3001/api/v1/auth/google/token', {
        data: {
          user: {
            id: 'test123',
            email: 'test@test.com',
            name: 'Test User'
          }
        }
      });
      
      expect(response2.status()).toBeGreaterThanOrEqual(400);
      console.log('✅ Requisição sem access_token rejeitada corretamente');
      
      // 3. Testar com dados malformados
      const response3 = await request.post('http://192.168.1.111:3001/api/v1/auth/google/token', {
        data: { invalid: 'data' }
      });
      
      expect(response3.status()).toBeGreaterThanOrEqual(400);
      console.log('✅ Dados malformados rejeitados corretamente');
    });

    test('deve demonstrar que problemas de CORS e JSON Parse estão resolvidos', async ({ request }) => {
      console.log('🎯 Validando correções implementadas');
      
      // Este teste demonstra que os problemas originais foram resolvidos:
      // 1. JSON Parse error: Unexpected character: <
      // 2. CORS blocking requests
      
      const response = await request.post('http://192.168.1.111:3001/api/v1/auth/google/token', {
        data: {
          access_token: 'demo_token',
          user: {
            id: 'demo_user',
            email: 'demo@example.com',
            name: 'Demo User'
          }
        },
        headers: {
          'Origin': 'http://192.168.1.111:8081'
        }
      });
      
      // Se chegou aqui sem erro, significa:
      // ✅ CORS está funcionando (não há erro de Cross-Origin)
      // ✅ API está retornando JSON válido (não HTML com <)
      
      expect(response.status()).toBe(401); // Esperado para token inválido
      expect(response.headers()['content-type']).toContain('application/json');
      expect(response.headers()['access-control-allow-origin']).toBe('http://192.168.1.111:8081');
      
      const responseData = await response.json();
      expect(typeof responseData).toBe('object');
      expect(responseData.message).toBe('Token Google inválido');
      
      console.log('🎉 PROBLEMAS RESOLVIDOS:');
      console.log('  ✅ Não há mais "JSON Parse error: Unexpected character: <"');
      console.log('  ✅ CORS está funcionando corretamente');
      console.log('  ✅ API está retornando JSON válido');
      console.log('  ✅ Comunicação app <-> API funcionando');
      
      console.log('📊 Detalhes da resposta:');
      console.log('  - Status:', response.status());
      console.log('  - Content-Type:', response.headers()['content-type']);
      console.log('  - CORS Header:', response.headers()['access-control-allow-origin']);
      console.log('  - Response Body:', responseData);
    });
  });
});
