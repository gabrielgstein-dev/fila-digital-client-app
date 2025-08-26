export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export interface Queue {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  avgServiceTime: number;
  isActive: boolean;
  tenantId: string;
  tenant?: Tenant;
}

export enum TicketStatus {
  WAITING = 'WAITING',
  CALLED = 'CALLED',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  CANCELLED = 'CANCELLED'
}

export interface Ticket {
  id: string;
  number: number;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  priority: number;
  status: TicketStatus;
  estimatedTime?: number;
  position?: number;
  queueId: string;
  queue: Queue;
  createdAt: string;
  updatedAt: string;
  calledAt?: string;
  completedAt?: string;
}

export interface ClientDashboard {
  client: {
    identifier: string;
    totalActiveTickets: number;
  };
  summary: {
    totalWaiting: number;
    totalCalled: number;
    avgWaitTime: number;
    nextCallEstimate: number;
    establishmentsCount: number;
  };
  tickets: {
    [tenantId: string]: {
      tenant: Tenant;
      queues: {
        [queueId: string]: {
          queue: Queue;
          tickets: Ticket[];
        };
      };
    };
  };
  realTimeMetrics: {
    currentServiceSpeed: number;
    timeSinceLastCall: number;
    trendDirection: string;
  };
}

export interface CreateTicketDto {
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  priority?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface UserQueue {
  id: string;
  name: string;
  description?: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  tickets: Array<{
    id: string;
    number: number;
    status: string;
    createdAt: string;
    validatedAt?: string;
    token: string;
  }>;
}

export interface UserQueuesData {
  client: {
    identifier: string;
    name?: string;
    phone?: string;
    email?: string;
    userType: string;
  };
  queues: UserQueue[];
}
