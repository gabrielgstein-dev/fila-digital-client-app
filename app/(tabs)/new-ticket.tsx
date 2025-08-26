import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useClientData } from '../../hooks/useClientData';
import { apiService } from '../../services/api';
import { Queue, Tenant } from '../../types/api';

interface QueuesByTenant {
  [tenantId: string]: {
    tenant: Tenant;
    queues: Queue[];
  };
}

export default function NewTicketScreen() {
  const { clientInfo } = useClientData();
  const [queues, setQueues] = useState<QueuesByTenant>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [clientName, setClientName] = useState(clientInfo?.name || '');
  const [priority, setPriority] = useState(1);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!clientInfo) {
      router.replace('/(auth)/login');
    } else {
      fetchQueues();
    }
  }, [clientInfo]);

  const fetchQueues = async () => {
    try {
      setError(null);
      const activeQueues = await apiService.getActiveQueues();
      
      const queuesByTenant: QueuesByTenant = {};
      activeQueues.forEach((queue) => {
        if (queue.tenant) {
          if (!queuesByTenant[queue.tenant.id]) {
            queuesByTenant[queue.tenant.id] = {
              tenant: queue.tenant,
              queues: [],
            };
          }
          queuesByTenant[queue.tenant.id].queues.push(queue);
        }
      });

      setQueues(queuesByTenant);
    } catch (err: any) {
      console.error('Erro ao buscar filas:', err);
      setError(err.response?.data?.message || 'Erro ao carregar filas disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQueues();
    setRefreshing(false);
  };

  const handleCreateTicket = async () => {
    if (!selectedQueue) {
      Alert.alert('Erro', 'Por favor, selecione uma fila');
      return;
    }

    if (!clientInfo) {
      Alert.alert('Erro', 'Informações do cliente não encontradas');
      return;
    }

    setCreating(true);
    try {
      const ticketData = {
        clientName: clientName.trim() || undefined,
        clientPhone: clientInfo.phone,
        clientEmail: clientInfo.email,
        priority,
      };

      const newTicket = await apiService.createTicket(selectedQueue.id, ticketData);
      
      Alert.alert(
        'Senha Criada! 🎫',
        `Sua senha ${newTicket.number} foi criada na fila "${selectedQueue.name}".`,
        [
          {
            text: 'Ver Detalhes',
            onPress: () => router.push(`/ticket/${newTicket.id}`),
          },
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)'),
          },
        ]
      );

      setSelectedQueue(null);
      setClientName(clientInfo?.name || '');
      setPriority(1);
    } catch (err: any) {
      console.error('Erro ao criar ticket:', err);
      Alert.alert(
        'Erro',
        err.response?.data?.message || 'Erro ao criar senha. Tente novamente.'
      );
    } finally {
      setCreating(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  if (!clientInfo) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando filas disponíveis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nova Senha</Text>
        <Text style={styles.headerSubtitle}>Selecione uma fila para tirar sua senha</Text>
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
        {Object.keys(queues).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>Nenhuma fila disponível</Text>
            <Text style={styles.emptySubtitle}>
              Não há filas ativas no momento
            </Text>
          </View>
        ) : (
          Object.values(queues).map((establishment) => (
            <View key={establishment.tenant.id} style={styles.establishmentCard}>
              <Text style={styles.establishmentName}>{establishment.tenant.name}</Text>
              {establishment.tenant.phone && (
                <Text style={styles.establishmentInfo}>📞 {establishment.tenant.phone}</Text>
              )}
              {establishment.tenant.email && (
                <Text style={styles.establishmentInfo}>✉️ {establishment.tenant.email}</Text>
              )}
              
              <View style={styles.queuesContainer}>
                {establishment.queues.map((queue) => (
                  <TouchableOpacity
                    key={queue.id}
                    style={[
                      styles.queueCard,
                      selectedQueue?.id === queue.id && styles.queueCardSelected,
                    ]}
                    onPress={() => setSelectedQueue(queue)}
                  >
                    <View style={styles.queueHeader}>
                      <Text style={styles.queueName}>{queue.name}</Text>
                      <View style={styles.capacityBadge}>
                        <Text style={styles.capacityText}>{queue.capacity}</Text>
                      </View>
                    </View>
                    
                    {queue.description && (
                      <Text style={styles.queueDescription}>{queue.description}</Text>
                    )}
                    
                    <View style={styles.queueInfo}>
                      <View style={styles.queueInfoItem}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.queueInfoText}>
                          Tempo médio: {formatTime(queue.avgServiceTime)}
                        </Text>
                      </View>
                      <View style={styles.queueInfoItem}>
                        <Ionicons name="people-outline" size={16} color="#666" />
                        <Text style={styles.queueInfoText}>
                          Capacidade: {queue.capacity}
                        </Text>
                      </View>
                    </View>

                    {selectedQueue?.id === queue.id && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                        <Text style={styles.selectedText}>Selecionada</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}

        {selectedQueue && (
          <View style={styles.ticketForm}>
            <Text style={styles.formTitle}>Informações da Senha</Text>
            
            <Text style={styles.label}>Nome (opcional)</Text>
            <TextInput
              style={styles.input}
              value={clientName}
              onChangeText={setClientName}
              placeholder="Seu nome"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Prioridade</Text>
            <View style={styles.priorityContainer}>
              {[1, 2, 3, 4, 5].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    priority === p && styles.priorityButtonSelected,
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === p && styles.priorityTextSelected,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.priorityHelp}>1 = Normal, 5 = Urgente</Text>

            <TouchableOpacity
              style={[styles.createButton, creating && styles.createButtonDisabled]}
              onPress={handleCreateTicket}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={24} color="white" />
                  <Text style={styles.createButtonText}>Tirar Senha</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
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
  establishmentCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  establishmentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  establishmentInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  queuesContainer: {
    marginTop: 16,
  },
  queueCard: {
    borderWidth: 2,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  queueCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  queueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  capacityBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  capacityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  queueDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  queueInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  queueInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  queueInfoText: {
    fontSize: 12,
    color: '#666',
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  ticketForm: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#1a1a1a',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  priorityButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  priorityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  priorityTextSelected: {
    color: 'white',
  },
  priorityHelp: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
