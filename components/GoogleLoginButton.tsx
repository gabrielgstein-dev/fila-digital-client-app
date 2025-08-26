import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';

interface GoogleLoginButtonProps {
  onLoginSuccess?: (user: any) => void;
  onLoginError?: (error: string) => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('🚀 Iniciando login com Google...');
      
      // Mock login para demonstração
      setTimeout(() => {
        const mockUser = {
          id: 'demo_user_123',
          email: 'demo@filadigital.com',
          name: 'Usuário Demonstração',
        };
        
        onLoginSuccess?.(mockUser);
        setIsLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro durante login Google:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      onLoginError?.(errorMessage);
      Alert.alert('Erro no Login', errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, isLoading && styles.buttonDisabled]}
      onPress={handleGoogleLogin}
      disabled={isLoading}
    >
      <Text style={styles.buttonText}>
        {isLoading ? 'Entrando...' : 'Continuar com Google'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#9AA0A6',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
