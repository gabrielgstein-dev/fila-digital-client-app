import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Tela de Teste</Text>
      <Text style={styles.subtitle}>Se você está vendo esta tela, a navegação está funcionando!</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>✅ Navegação para (tabs) funcionando</Text>
        <Text style={styles.infoText}>✅ Layout das abas carregado</Text>
        <Text style={styles.infoText}>✅ Roteamento funcionando</Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/(tabs)/index')}
      >
        <Ionicons name="arrow-forward" size={20} color="white" />
        <Text style={styles.buttonText}>Ir para Tela Principal</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/(auth)/login')}
      >
        <Ionicons name="log-out" size={20} color="white" />
        <Text style={styles.buttonText}>Voltar para Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: '#34C759',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
