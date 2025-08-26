import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { websocketService } from '../../services/websocket';
import { Ticket, TicketStatus } from '../../types/api';

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTicketDetails = async () => {
    if (!id) return;

    try {
      setError(null);
      const ticketData = await apiService.getTicketDetails(id);
      setTicket(ticketData);
    } catch (err: any) {
      console.error('Erro ao buscar detalhes do ticket:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados do ticket');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTicketDetails();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  useEffect(() => {
    if (ticket) {
      websocketService.onTicketUpdate((data) => {
        if (data.ticket.id === ticket.id) {
          setTicket(data.ticket);
        }
      });

      websocketService.onTicketCalled((data) => {
        if (data.ticket.id === ticket.id) {
          setTicket(data.ticket);
          Alert.alert(
            'Sua senha foi chamada! 🎫',
            `Senha ${data.ticket.number} - ${data.ticket.queue.name}`,
            [{ text: 'OK' }]
          );
        }
      });
    }
  }, [ticket]);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.WAITING:
        return '#FF9500';
      case TicketStatus.CALLED:
        return '#FF3B30';
      case TicketStatus.COMPLETED:
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.WAITING:
        return 'Aguardando';
      case TicketStatus.CALLED:
        return 'Chamado';
      case TicketStatus.COMPLETED:
        return 'Atendido';
      case TicketStatus.SKIPPED:
        return 'Pulado';
      case TicketStatus.CANCELLED:
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.WAITING:
        return 'time-outline';
      case TicketStatus.CALLED:
        return 'notifications-outline';
      case TicketStatus.COMPLETED:
        return 'checkmark-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} minutos`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (error || !ticket) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.errorTitle}>Erro ao carregar</Text>
        <Text style={styles.errorText}>{error || 'Ticket não encontrado'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTicketDetails}>
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Senha</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <View style={styles.ticketNumber}>
              <Text style={styles.ticketNumberText}>{ticket.number}</Text>
            </View>
            <View style={styles.ticketInfo}>
              <Text style={styles.queueName}>{ticket.queue.name}</Text>
              <Text style={styles.tenantName}>{ticket.queue.tenant?.name}</Text>
            </View>
          </View>

          <View style={[styles.statusContainer, { backgroundColor: getStatusColor(ticket.status) }]}>
            <Ionicons name={getStatusIcon(ticket.status) as any} size={24} color="white" />
            <Text style={styles.statusText}>{getStatusText(ticket.status)}</Text>
          </View>
        </View>

        {ticket.status === TicketStatus.WAITING && (
          <View style={styles.waitingInfo}>
            <Text style={styles.sectionTitle}>Informações da Espera</Text>
            {ticket.position && (
              <View style={styles.infoRow}>
                <Ionicons name="list-outline" size={20} color="#666" />
                <Text style={styles.infoText}>Posição na fila: {ticket.position}</Text>
              </View>
            )}
            {ticket.estimatedTime && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.infoText}>
                  Tempo estimado: {formatTime(ticket.estimatedTime)}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fila:</Text>
            <Text style={styles.detailValue}>{ticket.queue.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estabelecimento:</Text>
            <Text style={styles.detailValue}>{ticket.queue.tenant?.name}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Prioridade:</Text>
            <Text style={styles.detailValue}>{ticket.priority}</Text>
          </View>

          {ticket.clientName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nome:</Text>
              <Text style={styles.detailValue}>{ticket.clientName}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Criada em:</Text>
            <Text style={styles.detailValue}>{formatDateTime(ticket.createdAt)}</Text>
          </View>

          {ticket.calledAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Chamada em:</Text>
              <Text style={styles.detailValue}>{formatDateTime(ticket.calledAt)}</Text>
            </View>
          )}

          {ticket.completedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Atendida em:</Text>
              <Text style={styles.detailValue}>{formatDateTime(ticket.completedAt)}</Text>
            </View>
          )}
        </View>

        <View style={styles.queueInfo}>
          <Text style={styles.sectionTitle}>Informações da Fila</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Capacidade:</Text>
            <Text style={styles.detailValue}>{ticket.queue.capacity} pessoas</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tempo médio de atendimento:</Text>
            <Text style={styles.detailValue}>{formatTime(ticket.queue.avgServiceTime)}</Text>
          </View>

          {ticket.queue.description && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descrição:</Text>
              <Text style={styles.detailValue}>{ticket.queue.description}</Text>
            </View>
          )}
        </View>

        {ticket.status === TicketStatus.CALLED && (
          <View style={styles.callAlert}>
            <Ionicons name="notifications" size={32} color="#FF3B30" />
            <Text style={styles.callAlertTitle}>Sua senha foi chamada!</Text>
            <Text style={styles.callAlertText}>
              Dirija-se ao local de atendimento imediatamente.
            </Text>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  ticketCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ticketNumber: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ticketNumberText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  ticketInfo: {
    flex: 1,
  },
  queueName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  tenantName: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingInfo: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  detailsCard: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  queueInfo: {
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
  callAlert: {
    backgroundColor: '#FFE5E5',
    margin: 16,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  callAlertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D70015',
    marginTop: 8,
  },
  callAlertText: {
    fontSize: 14,
    color: '#D70015',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
