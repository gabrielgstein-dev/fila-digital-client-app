import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import { websocketService } from '../services/websocket';
import { notificationService } from '../services/notifications';
import { authService } from '../services/auth';
import { ClientDashboard, Ticket } from '../types/api';

interface ClientInfo {
  phone?: string;
  email?: string;
  name?: string;
  cpf?: string;
  password?: string;
  userType?: 'client' | 'agent';
}

export function useClientData() {
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [dashboard, setDashboard] = useState<ClientDashboard | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const loadClientInfo = useCallback(async () => {
    try {
      console.log('🔍 useClientData: Carregando dados do cliente do AsyncStorage');
      const stored = await AsyncStorage.getItem('clientInfo');
      console.log('🔍 useClientData: Dados armazenados:', stored);
      
      if (stored) {
        const info = JSON.parse(stored);
        console.log('🔍 useClientData: Dados parseados:', info);
        setClientInfo(info);
        return info;
      } else {
        console.log('🔍 useClientData: Nenhum dado encontrado no AsyncStorage');
      }
    } catch (err) {
      console.error('❌ useClientData: Erro ao carregar dados do cliente:', err);
    }
    return null;
  }, []);

  const saveClientInfo = useCallback(async (info: ClientInfo) => {
    try {
      console.log('🔍 useClientData: Salvando dados do cliente:', info);
      await AsyncStorage.setItem('clientInfo', JSON.stringify(info));
      setClientInfo(info);
      console.log('🔍 useClientData: Dados salvos com sucesso');
    } catch (err) {
      console.error('❌ useClientData: Erro ao salvar dados do cliente:', err);
    }
  }, []);

  const disconnectWebSocket = useCallback(() => {
    websocketService.disconnect();
    setIsConnected(false);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('clientInfo');
    await AsyncStorage.removeItem('authToken');
    setClientInfo(null);
    setDashboard(null);
    setTickets([]);
    disconnectWebSocket();
  }, [disconnectWebSocket]);

  const fetchDashboard = useCallback(async (info?: ClientInfo) => {
    if (!info && !clientInfo) return;
    
    const client = info || clientInfo;
    if (!client) return;

    setLoading(true);
    setError(null);

    try {
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        setError('Sessão expirada. Faça login novamente.');
        return;
      }

      const dashboardData = await apiService.getClientDashboard(
        client.phone,
        client.email
      );
      setDashboard(dashboardData);

      const allTickets: Ticket[] = [];
      Object.values(dashboardData.tickets).forEach((establishment) => {
        Object.values(establishment.queues).forEach((queue) => {
          allTickets.push(...queue.tickets);
        });
      });
      setTickets(allTickets);

    } catch (err: any) {
      console.error('Erro ao buscar dashboard:', err);
      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
        await logout();
      } else {
        setError(err.response?.data?.message || 'Erro ao carregar dados');
      }
    } finally {
      setLoading(false);
    }
  }, [clientInfo]); // Apenas clientInfo como dependência

  const connectWebSocket = useCallback(() => {
    if (!clientInfo) return;

    try {
      websocketService.connect();
      
      const identifier = clientInfo.phone || clientInfo.email || '';
      if (identifier) {
        websocketService.subscribeToClient(identifier);
      }

      tickets.forEach((ticket) => {
        websocketService.subscribeToQueue(ticket.queueId);
      });

      websocketService.onTicketCalled((data) => {
        console.log('Ticket chamado:', data);
        notificationService.showTicketCalledNotification(
          data.ticket.number,
          data.ticket.queue.name
        );
        fetchDashboard();
      });

      websocketService.onClientUpdate((data) => {
        console.log('Atualização do cliente:', data);
        fetchDashboard();
      });

      websocketService.onTicketUpdate((data) => {
        console.log('Atualização do ticket:', data);
        fetchDashboard();
      });

      setIsConnected(true);
    } catch (err) {
      console.error('Erro ao conectar WebSocket:', err);
      setIsConnected(false);
    }
  }, [clientInfo, tickets, fetchDashboard]);

  const refresh = useCallback(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const fetchUserQueues = useCallback(async () => {
    if (!clientInfo) return null;
    
    try {
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        setError('Sessão expirada. Faça login novamente.');
        return null;
      }

      const userQueuesData = await apiService.getUserQueues();
      return userQueuesData;
    } catch (err: any) {
      console.error('Erro ao buscar filas do usuário:', err);
      if (err.response?.status === 401) {
        setError('Sessão expirada. Faça login novamente.');
        await logout();
      } else {
        setError(err.response?.data?.message || 'Erro ao carregar filas');
      }
      return null;
    }
  }, [clientInfo, logout]);

  useEffect(() => {
    console.log('🔍 useClientData: useEffect loadClientInfo executado');
    loadClientInfo();
  }, []); // Removido loadClientInfo da dependência para evitar loop

  useEffect(() => {
    console.log('🔍 useClientData: useEffect clientInfo mudou:', clientInfo);
    if (clientInfo) {
      console.log('🔍 useClientData: Executando fetchDashboard');
      fetchDashboard();
    }
  }, [clientInfo]); // Removido fetchDashboard da dependência para evitar loop

  useEffect(() => {
    if (clientInfo && tickets.length > 0) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [clientInfo, tickets.length, connectWebSocket, disconnectWebSocket]);

  return {
    clientInfo,
    dashboard,
    tickets,
    loading,
    error,
    isConnected,
    saveClientInfo,
    refresh,
    logout,
    fetchDashboard,
    fetchUserQueues,
  };
}
