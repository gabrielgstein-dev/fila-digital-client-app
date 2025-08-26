// Mock para AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock para expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        development: {
          apiBaseUrl: 'http://localhost:3001/api/v1',
          websocketUrl: 'ws://localhost:3001',
          environment: 'development',
          logLevel: 'debug',
          enableNetworkLogs: true,
        },
        staging: {
          apiBaseUrl: 'https://fila-api-staging.cloudrun.app/api/v1',
          websocketUrl: 'wss://fila-api-staging.cloudrun.app',
          environment: 'staging',
          logLevel: 'info',
          enableNetworkLogs: true,
        },
        production: {
          apiBaseUrl: 'https://fila-api-prod.cloudrun.app/api/v1',
          websocketUrl: 'wss://fila-api-prod.cloudrun.app',
          environment: 'production',
          logLevel: 'warn',
          enableNetworkLogs: false,
        },
      },
    },
  },
}));

// Mock para __DEV__
global.__DEV__ = true;
