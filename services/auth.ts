import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { environmentService } from '../config/environment';

export interface LoginCredentials {
  cpf: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  access_token?: string;
  user?: {
    id: string;
    cpf: string;
    name: string;
    phone?: string;
    email?: string;
    picture?: string;
  };
  userType?: 'client';
}

export interface AuthError {
  message: string;
  code?: string;
}

class AuthService {
  private apiBaseUrl: string;

  constructor() {
    this.apiBaseUrl = environmentService.getApiBaseUrl();
  }

  async loginWithCredentials(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔧 Fazendo login de cliente com:', credentials);
      console.log('🔧 URL da API:', `${this.apiBaseUrl}/auth/client/login`);
      
      const response = await axios.post(`${this.apiBaseUrl}/auth/client/login`, credentials, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.access_token && response.data.user) {
        await AsyncStorage.setItem('authToken', response.data.access_token);
        return {
          success: true,
          message: 'Login realizado com sucesso',
          access_token: response.data.access_token,
          user: response.data.user,
          userType: response.data.userType,
        };
      }

      return {
        success: false,
        message: response.data.message || 'Erro na autenticação',
      };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout na conexão. Verifique sua internet.');
      }

      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          throw new Error('CPF ou senha incorretos');
        } else if (status === 404) {
          throw new Error('Serviço de autenticação não encontrado');
        } else if (status >= 500) {
          throw new Error('Erro no servidor. Tente novamente mais tarde.');
        } else {
          throw new Error(error.response.data?.message || 'Erro na autenticação');
        }
      }

      if (error.request) {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua internet.');
      }

      throw new Error('Erro inesperado na autenticação');
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;

      const response = await axios.get(`${this.apiBaseUrl}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      });

      return response.data.valid === true;
    } catch (error) {
      await AsyncStorage.removeItem('authToken');
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        await axios.post(`${this.apiBaseUrl}/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.log('Erro ao fazer logout no servidor:', error);
    } finally {
      await AsyncStorage.removeItem('authToken');
    }
  }

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    if (!token) return false;
    
    return await this.validateToken();
  }
}

export const authService = new AuthService();
