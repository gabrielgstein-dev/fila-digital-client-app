import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_OAUTH_CONFIG } from '../config/google-auth';
import { environmentService } from '../config/environment';

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

interface GoogleAuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    phone?: string;
    userType: 'client' | 'agent';
  };
  userType?: 'client' | 'agent';
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

class GoogleAuthService {
  private config: GoogleAuthConfig;
  private apiBaseUrl: string;

  constructor() {
    // Usar configuração de ambiente automática
    this.apiBaseUrl = environmentService.getApiBaseUrl();
    
    // Configuração do Google OAuth
    this.config = {
      clientId: GOOGLE_OAUTH_CONFIG.getClientId(),
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'filaclientapp',
        path: 'auth',
      }),
      scopes: ['openid', 'profile', 'email'],
    };
  }

  setApiBaseUrl(url: string) {
    this.apiBaseUrl = url;
  }

  setClientId(clientId: string) {
    this.config.clientId = clientId;
  }

  async signInWithGoogle(): Promise<GoogleAuthResponse> {
    try {
      console.log('🚀 Iniciando login com Google...');
      console.log('🔍 Configuração atual:', {
        clientId: this.config.clientId,
        redirectUri: this.config.redirectUri,
        configured: this.isConfigured()
      });

      if (__DEV__ && !this.isConfigured()) {
        console.log('⚠️ Usando modo mock - configuração não encontrada');
        return this.mockGoogleLogin();
      }

      console.log('🎲 Gerando state e nonce...');
      const state = await Crypto.randomUUID();
      const nonce = await Crypto.randomUUID();

      console.log('📝 Criando AuthRequest...');
      const request = new AuthSession.AuthRequest({
        clientId: this.config.clientId,
        scopes: this.config.scopes,
        redirectUri: this.config.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        state,
        extraParams: {
          nonce,
          access_type: 'offline',
          prompt: 'consent',
        },
        usePKCE: true,
      });

      console.log('🔍 Buscando configuração de descoberta do Google...');
      const discovery = await AuthSession.fetchDiscoveryAsync('https://accounts.google.com/.well-known/openid_configuration');
      
      console.log('📱 Abrindo prompt de autenticação...');
      const result = await request.promptAsync(discovery);

      console.log('📋 Resultado da autenticação:', {
        type: result.type,
        hasCode: result.type === 'success' && !!result.params?.code
      });

      if (result.type !== 'success') {
        throw new Error('Autenticação cancelada pelo usuário');
      }

      if (!result.params.code) {
        throw new Error('Código de autorização não recebido');
      }

      console.log('🔄 Passo 1: Trocando código por token...');
      const tokenResponse = await this.exchangeCodeForToken(result.params.code, request.codeVerifier);
      
      console.log('👤 Passo 2: Obtendo dados do usuário Google...');
      const googleUser = await this.getUserFromGoogle(tokenResponse.access_token);
      
      console.log('🔐 Passo 3: Autenticando com nossa API...');
      const authResponse = await this.authenticateWithAPI(tokenResponse.access_token, googleUser);
      
      console.log('💾 Salvando token de autenticação...');
      await AsyncStorage.setItem('authToken', authResponse.access_token);
      
      console.log('✅ Login Google concluído com sucesso!');
      return authResponse;
    } catch (error) {
      console.error('❌ Erro na autenticação Google:', error);
      
      // Melhor tratamento de erro baseado no tipo
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          throw new Error('Erro de comunicação com o servidor. Verifique se a API está rodando.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error('Erro de conexão. Verifique sua internet e se a API está rodando.');
        } else if (error.message.includes('Token Google inválido')) {
          throw new Error('Credenciais do Google incorretas. Entre em contato com o suporte.');
        }
      }
      
      throw error;
    }
  }

  private async exchangeCodeForToken(code: string, codeVerifier?: string) {
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    console.log('🔄 Trocando código por token...');
    console.log('📍 Endpoint:', tokenEndpoint);
    console.log('🔑 Client ID:', this.config.clientId);
    console.log('📍 Redirect URI:', this.config.redirectUri);

    const requestParams = {
      client_id: this.config.clientId,
      code,
      code_verifier: codeVerifier || '',
      grant_type: 'authorization_code',
      redirect_uri: this.config.redirectUri,
    };

    console.log('📦 Parâmetros enviados:', requestParams);

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(requestParams).toString(),
    });

    console.log('📡 Status da resposta Google:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro do Google (texto):', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Erro do Google (JSON):', errorJson);
      } catch (e) {
        console.error('❌ Resposta do Google não é JSON:', errorText);
      }
      
      throw new Error(`Erro ao trocar código por token: ${errorText}`);
    }

    const responseText = await response.text();
    console.log('✅ Resposta do Google (texto):', responseText);

    try {
      const data = JSON.parse(responseText);
      console.log('✅ Token recebido do Google:', {
        access_token: data.access_token ? 'presente' : 'ausente',
        token_type: data.token_type,
        expires_in: data.expires_in
      });
      return data;
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta do Google:', parseError);
      console.error('📄 Conteúdo que causou erro:', responseText);
      throw new Error(`Resposta do Google não é um JSON válido: ${responseText.substring(0, 200)}`);
    }
  }

  private async getUserFromGoogle(accessToken: string): Promise<GoogleUser> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao obter dados do usuário do Google');
    }

    const userData = await response.json();
    
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
    };
  }

  private async authenticateWithAPI(googleAccessToken: string, googleUser: GoogleUser): Promise<GoogleAuthResponse> {
    console.log('🔐 Iniciando autenticação com API...');
    console.log('📍 URL da API:', `${this.apiBaseUrl}/auth/google/token`);
    console.log('👤 Usuário Google:', {
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name
    });

    const requestBody = {
      access_token: googleAccessToken,
      user: googleUser,
    };

    console.log('📦 Dados enviados para API:', requestBody);

    const response = await fetch(`${this.apiBaseUrl}/auth/google/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API (texto):', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Erro da API (JSON):', errorJson);
        throw new Error(errorJson.message || `Erro na autenticação com API: ${errorText}`);
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do erro:', parseError);
        throw new Error(`Erro na autenticação com API: ${errorText}`);
      }
    }

    const responseText = await response.text();
    console.log('✅ Resposta da API (texto):', responseText);

    try {
      const data = JSON.parse(responseText);
      console.log('✅ Resposta da API (JSON):', data);
      return data;
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse da resposta JSON:', parseError);
      console.error('📄 Conteúdo que causou erro:', responseText);
      throw new Error(`Resposta da API não é um JSON válido: ${responseText.substring(0, 200)}`);
    }
  }

  async signOut(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['authToken', 'clientInfo']);
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  private async revokeGoogleToken(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('googleAccessToken');
      if (token) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST',
        });
      }
    } catch (error) {
      console.warn('Erro ao revogar token do Google:', error);
    }
  }

  isConfigured(): boolean {
    return GOOGLE_OAUTH_CONFIG.isConfigured();
  }

  private async mockGoogleLogin(): Promise<GoogleAuthResponse> {
    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Dados fictícios para demonstração
    const mockUser = {
      id: 'demo_user_123',
      email: 'usuario.demo@gmail.com',
      name: 'Usuário Demonstração',
      picture: 'https://via.placeholder.com/150',
    };

    // Salvar token fictício
    const mockToken = 'demo_token_' + Date.now();
    await AsyncStorage.setItem('authToken', mockToken);

    return {
      access_token: mockToken,
      user: {
        ...mockUser,
        userType: 'client' as const,
      },
      userType: 'client',
    };
  }
}

export const googleAuthService = new GoogleAuthService();
