import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useClientData } from '../../hooks/useClientData';
import { UserQueuesData } from '../../types/api';
import { mockUserQueues } from '../../utils/mockData';

export default function QueuesScreen() {
  const { clientInfo, logout, fetchUserQueues } = useClientData();
  const [userQueues, setUserQueues] = useState<UserQueuesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 QueuesScreen: clientInfo mudou:', clientInfo);
    
    if (clientInfo) {
      console.log('🔍 QueuesScreen: Com clientInfo, carregando filas');
      loadUserQueues();
    }
  }, [clientInfo]);

  const loadUserQueues = async () => {
    try {
      console.log('🔍 QueuesScreen: Iniciando carregamento das filas');
      setLoading(true);
      setError(null);
      
      // Temporariamente usando dados mock para testar a interface
      console.log('🔍 QueuesScreen: Usando dados mock');
      setUserQueues(mockUserQueues);
      
    } catch (err: any) {
      console.error('❌ QueuesScreen: Erro ao carregar filas do usuário:', err);
    } finally {
      setLoading(false);
      console.log('🔍 QueuesScreen: Carregamento concluído');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserQueues();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  console.log('🔍 QueuesScreen: Renderizando com clientInfo:', clientInfo);

  // Aguarda o clientInfo ser carregado
  if (!clientInfo) {
    console.log('🔍 QueuesScreen: Renderizando tela de loading (aguardando clientInfo)');
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (loading) {
    console.log('🔍 QueuesScreen: Renderizando tela de loading (carregando filas)');
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando suas filas...</Text>
      </View>
    );
  }

  console.log('🔍 QueuesScreen: Renderizando tela principal com dados:', userQueues);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Guias e Tokens</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="filter" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {userQueues && (
          <>
            <View style={styles.planCard}>
              <View style={styles.planIndicator} />
              <Text style={styles.planTitle}>PLANO MÉDICO AMIL</Text>
              <Text style={styles.planDetails}>AMIL S450 QC NAC R COPART PJ</Text>
            </View>

            {userQueues.queues.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="list-outline" size={64} color="#8E8E93" />
                <Text style={styles.emptyTitle}>Nenhuma fila ativa</Text>
                <Text style={styles.emptySubtitle}>
                  Você não está em nenhuma fila no momento
                </Text>
              </View>
            ) : (
              <View style={styles.queuesContainer}>
                {userQueues.queues.map((queue) => (
                  <View key={queue.id} style={styles.queueCard}>
                    {queue.tickets.map((ticket) => (
                      <View key={ticket.id} style={styles.ticketItem}>
                        <View style={styles.ticketLeft}>
                          <View style={styles.ticketIndicator} />
                          <View style={styles.ticketInfo}>
                            <Text style={styles.establishmentName}>
                              {queue.tenant.name.length > 20 
                                ? `${queue.tenant.name.substring(0, 20)}...` 
                                : queue.tenant.name}
                            </Text>
                            <Text style={styles.serviceType}>EXAMES</Text>
                            <Text style={styles.orderNumber}>
                              Pedido: {ticket.number}
                            </Text>
                            <Text style={styles.password}>
                              Senha: {ticket.token}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.ticketRight}>
                          <View style={styles.validationStatus}>
                            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                            <Text style={styles.validatedText}>Validado</Text>
                          </View>
                          <Text style={styles.validationDate}>
                            {ticket.validatedAt ? formatDate(ticket.validatedAt) : formatDate(ticket.createdAt)}
                          </Text>
                          <View style={styles.tokenBox}>
                            <Text style={styles.tokenNumber}>
                              {ticket.token.replace(/\D/g, '').slice(-6)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.userProfile}>
        <View style={styles.profileIcon}>
          <Ionicons name="person-circle" size={24} color="#8A2BE2" />
        </View>
        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.userName}>
              {userQueues?.client.name || 'USUÁRIO'}
            </Text>
            <View style={styles.statusDot} />
          </View>
          <Text style={styles.userType}>
            {userQueues?.client.userType === 'dependent' ? 'Dependente' : 'Titular'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  errorText: {
    color: '#D70015',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  planCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  planIndicator: {
    width: 4,
    height: 40,
    backgroundColor: '#34C759',
    borderRadius: 2,
    marginRight: 12,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  planDetails: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  queuesContainer: {
    padding: 16,
  },
  queueCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ticketItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ticketLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ticketIndicator: {
    width: 4,
    height: 60,
    backgroundColor: '#8E8E93',
    borderRadius: 2,
    marginRight: 12,
  },
  ticketInfo: {
    flex: 1,
  },
  establishmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  password: {
    fontSize: 12,
    color: '#666',
  },
  ticketRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  validationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  validatedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 4,
  },
  validationDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  tokenBox: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  tokenNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  userProfile: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  userType: {
    fontSize: 14,
    color: '#666',
  },
});
