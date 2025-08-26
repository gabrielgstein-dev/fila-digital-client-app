import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface EnvironmentConfig {
  apiBaseUrl: string;
  websocketUrl: string;
  environment: string;
  logLevel: string;
  enableNetworkLogs: boolean;
}

class EnvironmentService {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.detectEnvironment();
    this.logEnvironmentInfo();
  }

  private detectEnvironment(): EnvironmentConfig {
    const currentEnv = process.env.EXPO_ENV || 'development';
    
    // Configuração baseada no ambiente atual
    switch (currentEnv) {
      case 'development':
        return {
          apiBaseUrl: process.env.API_BASE_URL_DEV || 'http://192.168.1.111:3001/api/v1',
          websocketUrl: process.env.WEBSOCKET_URL_DEV || 'ws://192.168.1.111:3001',
          environment: 'development',
          logLevel: process.env.LOG_LEVEL || 'debug',
          enableNetworkLogs: process.env.ENABLE_NETWORK_LOGS === 'true',
        };
      
      case 'staging':
        return {
          apiBaseUrl: process.env.API_BASE_URL_STAGING || 'https://fila-api-stage.cloudrun.app/api/v1',
          websocketUrl: process.env.WEBSOCKET_URL_STAGING || 'wss://fila-api-stage.cloudrun.app',
          environment: 'staging',
          logLevel: process.env.LOG_LEVEL || 'info',
          enableNetworkLogs: process.env.ENABLE_NETWORK_LOGS === 'true',
        };
      
      case 'production':
        return {
          apiBaseUrl: process.env.API_BASE_URL_PROD || 'https://fila-api-prod.cloudrun.app/api/v1',
          websocketUrl: process.env.WEBSOCKET_URL_PROD || 'wss://fila-api-prod.cloudrun.app',
          environment: 'production',
          logLevel: process.env.LOG_LEVEL || 'warn',
          enableNetworkLogs: process.env.ENABLE_NETWORK_LOGS === 'false',
        };
      
      default:
        // Fallback para desenvolvimento
        return {
          apiBaseUrl: 'http://192.168.1.111:3001/api/v1',
          websocketUrl: 'ws://192.168.1.111:3001',
          environment: 'development',
          logLevel: 'debug',
          enableNetworkLogs: true,
        };
    }
  }

  private logEnvironmentInfo(): void {
    if (this.config.enableNetworkLogs) {
      console.log('🌍 Ambiente detectado:', {
        environment: this.config.environment,
        apiUrl: this.config.apiBaseUrl,
        websocketUrl: this.config.websocketUrl,
        logLevel: this.config.logLevel,
        nodeEnv: process.env.NODE_ENV,
        expoEnv: process.env.EXPO_ENV,
      });
    }
  }

  getConfig(): EnvironmentConfig {
    return this.config;
  }

  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  getWebsocketUrl(): string {
    return this.config.websocketUrl;
  }

  getEnvironment(): string {
    return this.config.environment;
  }

  isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  isStaging(): boolean {
    return this.config.environment === 'staging';
  }

  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  getLogLevel(): string {
    return this.config.logLevel;
  }

  shouldLogNetwork(): boolean {
    return this.config.enableNetworkLogs;
  }
}

export const environmentService = new EnvironmentService();
