import { Platform } from 'react-native';

// Configure these values for your Google OAuth setup
export const GOOGLE_OAUTH_CONFIG = {
  // Web Client ID (from Google Cloud Console) - usado apenas para referência
  WEB_CLIENT_ID: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  
  // iOS Client ID (from Google Cloud Console) - pode usar o Installed temporariamente
  IOS_CLIENT_ID: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  
  // Android Client ID (from Google Cloud Console) - credencial "installed" 
  ANDROID_CLIENT_ID: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  
  // Get the appropriate client ID for the current platform
  getClientId(): string {
    switch (Platform.OS) {
      case 'ios':
        return this.IOS_CLIENT_ID;
      case 'android':
        return this.ANDROID_CLIENT_ID;
      default:
        return this.WEB_CLIENT_ID;
    }
  },
  
  // Check if Google OAuth is properly configured
  isConfigured(): boolean {
    const clientId = this.getClientId();
    return Boolean(clientId && !clientId.includes('YOUR_'));
  }
};

// Instructions for setting up Google OAuth:
/*
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google+ API or Google OAuth2 API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Create separate credentials for:
   - Web application (for development/testing)
   - iOS application (bundle ID: com.filadigital.client)
   - Android application (package name: com.filadigital.client)
6. Replace the values above with your actual client IDs
7. For Android: Add your app's SHA-1 fingerprint
   - Get debug SHA-1: keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   - Get release SHA-1: keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
8. For iOS: Add your bundle ID in the iOS client configuration
*/
