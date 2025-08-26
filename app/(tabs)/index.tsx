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
import { TicketStatus } from '../../types/api';

export default function DashboardScreen() {
  const {
    clientInfo,
    dashboard,
    tickets,
    loading,
    error,
    isConnected,
    refresh,
    logout,
  } = useClientData();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!clientInfo) {
      router.replace('/(auth)/login');
    }
  }, [clientInfo]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
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

  if (loading && !dashboard) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando suas senhas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá!</Text>
          <Text style={styles.clientInfo}>
            {clientInfo.name || clientInfo.phone || clientInfo.email}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <View style={[styles.connectionStatus, { backgroundColor: isConnected ? '#34C759' : '#FF3B30' }]}>
            <Text style={styles.connectionText}>
              {isConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
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
        {dashboard && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Resumo</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{dashboard.summary.totalWaiting}</Text>
                <Text style={styles.summaryLabel}>Aguardando</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{dashboard.summary.totalCalled}</Text>
                <Text style={styles.summaryLabel}>Chamadas</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>
                  {dashboard.summary.nextCallEstimate !== Infinity
                    ? formatTime(dashboard.summary.nextCallEstimate)
                    : '-'}
                </Text>
                <Text style={styles.summaryLabel}>Próxima</Text>
              </View>
            </View>
          </View>
        )}

        {tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>Nenhuma senha ativa</Text>
            <Text style={styles.emptySubtitle}>
              Você não possui senhas ativas no momento
            </Text>
          </View>
        ) : (
          <View style={styles.ticketsContainer}>
            <Text style={styles.sectionTitle}>Suas Senhas</Text>
            {tickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketCard}
                onPress={() => router.push(`/ticket/${ticket.id}`)}
              >
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketNumber}>
                    <Text style={styles.ticketNumberText}>{ticket.number}</Text>
                  </View>
                  <View style={styles.ticketInfo}>
                    <Text style={styles.ticketQueue}>{ticket.queue.name}</Text>
                    <Text style={styles.ticketTenant}>{ticket.queue.tenant?.name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(ticket.status)}</Text>
                  </View>
                </View>
                <View style={styles.ticketDetails}>
                  {ticket.position && (
                    <Text style={styles.positionText}>
                      Posição: {ticket.position}
                    </Text>
                  )}
                  {ticket.estimatedTime && (
                    <Text style={styles.timeText}>
                      Tempo estimado: {formatTime(ticket.estimatedTime)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  greeting: {
    fontSize: 18,
    color: '#666',
  },
  clientInfo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connectionStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
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
  summary: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  ticketsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  ticketCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ticketNumberText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  ticketInfo: {
    flex: 1,
  },
  ticketQueue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  ticketTenant: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ticketDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  positionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
});
