import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InitialScreen() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    console.log('🔍 InitialScreen: useEffect executado');
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 InitialScreen: Verificando status de autenticação');
      const clientInfo = await AsyncStorage.getItem('clientInfo');
      console.log('🔍 InitialScreen: clientInfo do AsyncStorage:', clientInfo);
      
      if (clientInfo) {
        console.log('🔍 InitialScreen: Cliente autenticado, redirecionando para (tabs)');
        router.replace('/(tabs)');
      } else {
        console.log('🔍 InitialScreen: Cliente não autenticado, redirecionando para login');
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('❌ InitialScreen: Erro ao verificar status de login:', error);
      router.replace('/(auth)/login');
    } finally {
      setChecking(false);
    }
  };

  console.log('🔍 InitialScreen: Renderizando tela inicial');

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return null; // Não renderiza nada após o redirecionamento
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
