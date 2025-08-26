import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClientDashboard, Ticket, CreateTicketDto, Queue, UserQueuesData } from '../types/api';
import { environmentService } from '../config/environment';

const API_BASE_URL = environmentService.getApiBaseUrl();

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          AsyncStorage.removeItem('authToken');
        }
        return Promise.reject(error);
      }
    );
  }

  async getClientDashboard(phone?: string, email?: string): Promise<ClientDashboard> {
    const params: any = {};
    if (phone) params.phone = phone;
    if (email) params.email = email;

    const response = await this.api.get('/clients/dashboard', { params });
    return response.data;
  }

  async getClientTickets(phone?: string, email?: string): Promise<{ client: any; tickets: Ticket[] }> {
    const params: any = {};
    if (phone) params.phone = phone;
    if (email) params.email = email;

    const response = await this.api.get('/clients/my-tickets', { params });
    return response.data;
  }

  async getTicketDetails(ticketId: string): Promise<Ticket> {
    const response = await this.api.get(`/tickets/${ticketId}`);
    return response.data;
  }

  async createTicket(queueId: string, ticketData: CreateTicketDto): Promise<Ticket> {
    const response = await this.api.post(`/queues/${queueId}/tickets`, ticketData);
    return response.data;
  }

  async getActiveQueues(): Promise<Queue[]> {
    const response = await this.api.get('/queues');
    return response.data;
  }

  async getQueuesByTenant(tenantId: string): Promise<Queue[]> {
    const response = await this.api.get(`/tenants/${tenantId}/queues`);
    return response.data;
  }

  async getUserQueues(): Promise<UserQueuesData> {
    const response = await this.api.get('/clients/my-queues');
    return response.data;
  }

  setBaseURL(url: string) {
    this.api.defaults.baseURL = url;
  }
}

export const apiService = new ApiService();
