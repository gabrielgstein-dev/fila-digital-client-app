import { UserQueuesData } from '../types/api';

export const mockUserQueues: UserQueuesData = {
  client: {
    identifier: '123456789',
    name: 'GABRIEL',
    phone: '11999999999',
    email: 'gabriel@example.com',
    userType: 'dependent',
  },
  queues: [
    {
      id: '1',
      name: 'Fila de Exames',
      description: 'Fila para realização de exames médicos',
      tenant: {
        id: 'tenant1',
        name: 'CLINICA E LABORATORI',
        slug: 'clinica-lab',
      },
      tickets: [
        {
          id: 'ticket1',
          number: 455888294,
          status: 'validated',
          createdAt: '2025-01-10T21:06:00Z',
          validatedAt: '2025-06-19T10:00:00Z',
          token: 'EX2025011021060',
        },
      ],
    },
    {
      id: '2',
      name: 'Fila de Consultas',
      description: 'Fila para consultas médicas',
      tenant: {
        id: 'tenant2',
        name: 'CENTRO MEDICO MATS',
        slug: 'centro-mats',
      },
      tickets: [
        {
          id: 'ticket2',
          number: 454935307,
          status: 'validated',
          createdAt: '2025-01-06T19:00:00Z',
          validatedAt: '2025-06-12T14:30:00Z',
          token: 'EX2025010619005',
        },
      ],
    },
  ],
};
