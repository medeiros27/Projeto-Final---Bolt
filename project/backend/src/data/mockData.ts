import { Diligence, User, DashboardStats } from '../@types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@jurisconnect.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'cliente@exemplo.com',
    role: 'client',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z',
    phone: '(11) 99999-9999'
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'correspondente@exemplo.com',
    role: 'correspondent',
    status: 'active',
    createdAt: '2024-01-20T00:00:00Z',
    phone: '(11) 88888-8888',
    oab: 'SP123456',
    city: 'São Paulo',
    state: 'SP'
  },
  {
    id: '4',
    name: 'Carlos Oliveira',
    email: 'carlos@exemplo.com',
    role: 'correspondent',
    status: 'pending',
    createdAt: '2024-02-01T00:00:00Z',
    phone: '(21) 77777-7777',
    oab: 'RJ789012',
    city: 'Rio de Janeiro',
    state: 'RJ'
  }
];

export const mockDiligences: Diligence[] = [
  {
    id: '1',
    title: 'Citação em Ação de Cobrança',
    description: 'Realizar citação do réu João da Silva na Ação de Cobrança nº 1234567-89.2024.8.26.0001',
    type: 'Citação',
    status: 'assigned',
    priority: 'high',
    value: 150.00,
    deadline: '2024-12-30T23:59:59Z',
    clientId: '2',
    correspondentId: '3',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z',
    city: 'São Paulo',
    state: 'SP',
    attachments: [
      {
        id: '1',
        name: 'mandado_citacao.pdf',
        url: '#',
        type: 'application/pdf',
        size: 245760,
        uploadedAt: '2024-12-15T10:00:00Z',
        uploadedBy: '2'
      }
    ],
    client: mockUsers[1],
    correspondent: mockUsers[2]
  },
  {
    id: '2',
    title: 'Intimação de Testemunha',
    description: 'Intimar testemunha Maria da Silva para audiência marcada para 15/01/2025',
    type: 'Intimação',
    status: 'pending',
    priority: 'medium',
    value: 100.00,
    deadline: '2024-12-28T23:59:59Z',
    clientId: '2',
    createdAt: '2024-12-16T09:00:00Z',
    updatedAt: '2024-12-16T09:00:00Z',
    city: 'São Paulo',
    state: 'SP',
    attachments: [],
    client: mockUsers[1]
  },
  {
    id: '3',
    title: 'Busca e Apreensão de Veículo',
    description: 'Executar mandado de busca e apreensão do veículo Fiat Uno, placa ABC-1234',
    type: 'Busca e Apreensão',
    status: 'completed',
    priority: 'urgent',
    value: 300.00,
    deadline: '2024-12-20T23:59:59Z',
    clientId: '2',
    correspondentId: '3',
    createdAt: '2024-12-10T08:00:00Z',
    updatedAt: '2024-12-18T16:45:00Z',
    city: 'São Paulo',
    state: 'SP',
    attachments: [
      {
        id: '2',
        name: 'auto_busca_apreensao.pdf',
        url: '#',
        type: 'application/pdf',
        size: 512000,
        uploadedAt: '2024-12-18T16:45:00Z',
        uploadedBy: '3'
      }
    ],
    client: mockUsers[1],
    correspondent: mockUsers[2]
  }
];

export const mockDashboardStats: DashboardStats = {
  totalDiligences: 156,
  activeDiligences: 23,
  completedDiligences: 128,
  totalRevenue: 45680.00,
  pendingPayments: 3250.00,
  activeCorrespondents: 12,
  activeClients: 8,
  monthlyGrowth: 15.3
};