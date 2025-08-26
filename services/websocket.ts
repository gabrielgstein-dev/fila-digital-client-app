import { io, Socket } from 'socket.io-client';
import { Ticket } from '../types/api';
import { environmentService } from '../config/environment';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  connect(serverUrl: string = environmentService.getWebsocketUrl()) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Conectado ao WebSocket');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado do WebSocket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Erro de conexão WebSocket:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Reconectado após ${attemptNumber} tentativas`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Erro ao tentar reconectar:', error);
    });
  }

  subscribeToClient(clientIdentifier: string) {
    if (!this.socket) {
      throw new Error('WebSocket não conectado');
    }

    this.socket.emit('join-client', clientIdentifier);
    console.log(`Inscrito nas atualizações do cliente: ${clientIdentifier}`);
  }

  subscribeToQueue(queueId: string) {
    if (!this.socket) {
      throw new Error('WebSocket não conectado');
    }

    this.socket.emit('join-queue', queueId);
    console.log(`Inscrito nas atualizações da fila: ${queueId}`);
  }

  onTicketCalled(callback: (data: { ticket: Ticket; message: string }) => void) {
    if (!this.socket) return;
    this.socket.on('ticket-called', callback);
  }

  onClientUpdate(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('client-update', callback);
  }

  onQueueUpdate(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('queue-update', callback);
  }

  onTicketUpdate(callback: (data: { ticket: Ticket }) => void) {
    if (!this.socket) return;
    this.socket.on('ticket-update', callback);
  }

  unsubscribeFromClient(clientIdentifier: string) {
    if (!this.socket) return;
    this.socket.emit('leave-client', clientIdentifier);
  }

  unsubscribeFromQueue(queueId: string) {
    if (!this.socket) return;
    this.socket.emit('leave-queue', queueId);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
