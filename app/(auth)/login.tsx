import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClientData } from '../../hooks/useClientData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCPF, validateCPF, cleanCPF } from '../../utils/cpf';
import { googleAuthService } from '../../services/google-auth';
import { authService } from '../../services/auth';
import { environmentService } from '../../config/environment';

export default function LoginScreen() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { saveClientInfo, fetchDashboard } = useClientData();

  const handleCpfChange = (text: string) => {
    setCpf(formatCPF(text));
  };

  const validateInputs = () => {
    if (!cpf.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu CPF');
      return false;
    }

    const currentEnvironment = environmentService.getEnvironment();
    if (!validateCPF(cpf, currentEnvironment)) {
      Alert.alert('Erro', 'Por favor, informe um CPF válido');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, informe sua senha');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const credentials = {
        cpf: cleanCPF(cpf),
        password: password.trim(),
      };

      const authResponse = await authService.loginWithCredentials(credentials);
      
      if (authResponse.success && authResponse.user) {
        const clientInfo = {
          cpf: authResponse.user.cpf,
          name: authResponse.user.name,
          phone: authResponse.user.phone,
          email: authResponse.user.email,
          userType: 'client' as const,
        };

        await saveClientInfo(clientInfo);
        
        Alert.alert(
          'Sucesso!',
          'Login realizado com sucesso. Carregando suas senhas...',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert('Erro', authResponse.message || 'Erro na autenticação');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', error.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const authResponse = await googleAuthService.signInWithGoogle();
      
      const clientInfo = {
        email: authResponse.user.email,
        name: authResponse.user.name,
        phone: authResponse.user.phone,
        userType: authResponse.user.userType,
      };

      await saveClientInfo(clientInfo);
      
      Alert.alert(
        'Login Google realizado! 🎉',
        `Bem-vindo(a), ${authResponse.user.name}!`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Erro no login Google:', error);
      Alert.alert(
        'Erro no Login Google',
        error.message || 'Erro ao realizar login com Google. Tente novamente.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="person-circle" size={80} color="#007AFF" />
          <Text style={styles.title}>Fila Digital</Text>
          <Text style={styles.subtitle}>Acompanhe suas senhas em tempo real</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>CPF</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={cpf}
              onChangeText={handleCpfChange}
              placeholder="000.000.000-00"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={14}
              autoComplete="off"
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || googleLoading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            <Text style={styles.googleLogo}>G</Text>
            <Text style={styles.googleButtonText}>
              {googleLoading ? 'Conectando...' : 'Continuar com Google'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Faça login com seu CPF e senha ou use sua conta Google para acessar o sistema.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  icon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  eyeIcon: {
    padding: 16,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginVertical: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e1e1e1',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  googleLogo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
    backgroundColor: 'white',
    width: 24,
    height: 24,
    textAlign: 'center',
    borderRadius: 12,
  },
});
