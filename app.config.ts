import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: process.env.APP_NAME || 'Fila Digital',
    slug: 'fila-client-app',
    version: process.env.APP_VERSION || '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: process.env.APP_SCHEME || 'filaclientapp',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.filadigital.client',
      buildNumber: process.env.BUILD_NUMBER_IOS || '1.0.0',
      infoPlist: {
        CFBundleDisplayName: process.env.APP_NAME || 'Fila Digital',
        CFBundleName: process.env.APP_NAME || 'Fila Digital'
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#FFFFFF'
      },
      package: 'com.filadigital.client',
      versionCode: parseInt(process.env.BUILD_NUMBER_ANDROID || '1'),
      permissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE'
      ]
    },
    web: {
      favicon: './assets/images/favicon.png',
      bundler: 'metro'
    },
    plugins: [
      'expo-router',
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.1'
          },
          android: {
            compileSdkVersion: 33,
            targetSdkVersion: 33,
            buildToolsVersion: '33.0.0'
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Configurações de ambiente carregadas do .env
      environment: process.env.EXPO_ENV || 'development',
      apiBaseUrl: process.env[`API_BASE_URL_${process.env.EXPO_ENV?.toUpperCase() || 'DEV'}`],
      websocketUrl: process.env[`WEBSOCKET_URL_${process.env.EXPO_ENV?.toUpperCase() || 'DEV'}`],
      logLevel: process.env.LOG_LEVEL || 'debug',
      enableNetworkLogs: process.env.ENABLE_NETWORK_LOGS === 'true',
    }
  };
};
