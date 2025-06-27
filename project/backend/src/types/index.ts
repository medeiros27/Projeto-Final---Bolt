export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'correspondent';
  status: 'active' | 'pending' | 'inactive' | 'suspended';
  createdAt: string;
  avatar?: string;
  phone?: string;
  oab?: string;
  city?: string;
  state?: string;
  // Client specific fields
  companyName?: string;
  cnpj?: string;
  address?: string;
  // Correspondent specific fields
  specialties?: string[];
  coverage?: string[];
  rating?: number;
  totalDiligences?: number;
  completionRate?: number;
  responseTime?: number;
  // Verification
  verified?: boolean;
  verificationDocuments?: VerificationDocument[];
  // Subscription
  subscription?: Subscription;
}

export interface VerificationDocument {
  id: string;
  type: 'oab_certificate' | 'identity' | 'address_proof' | 'company_registration';
  name: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface Subscription {
  id: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'suspended';
  startDate: string;
  endDate?: string;
  features: string[];
  price: number;
  billingCycle: 'monthly' | 'yearly';
}

export interface Diligence {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  value: number; // Valor único da diligência
  deadline: string;
  clientId: string;
  correspondentId?: string;
  createdAt: string;
  updatedAt: string;
  city: string;
  state: string;
  attachments: Attachment[];
  client: User;
  correspondent?: User;
  // Status history for reverting
  statusHistory?: string[];
  // Financial tracking (admin only)
  financialData?: DiligenceFinancialData;
  // Payment proof
  paymentProof?: PaymentProof;
  // Communication
  messages?: Message[];
  // Tracking
  timeline?: TimelineEvent[];
}

export interface DiligenceFinancialData {
  id: string;
  diligenceId: string;
  // Valores (admin only)
  faturado: number; // Valor total faturado ao cliente
  custo: number; // Custo para executar (valor do correspondente)
  lucro: number; // Lucro da operação (faturado - custo)
  // Status de pagamento
  clientPaymentStatus: 'pending' | 'paid' | 'overdue';
  correspondentPaymentStatus: 'pending' | 'paid' | 'scheduled';
  // Datas
  clientPaymentDate?: string;
  correspondentPaymentDate?: string;
  // Observações
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProof {
  id: string;
  diligenceId: string;
  type: 'client_payment' | 'correspondent_payment';
  amount: number;
  pixKey?: string;
  proofImage: string; // URL da imagem do comprovante
  status: 'pending_verification' | 'verified' | 'rejected';
  uploadedBy: string;
  uploadedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface FinancialSummary {
  // Totais gerais (admin only)
  totalFaturado: number; // Total faturado aos clientes
  totalLucro: number; // Total de lucro
  totalCusto: number; // Total de custos (pagamentos aos correspondentes)
  
  // A receber/pagar (admin only)
  totalReceberá: number; // Total que ainda receberá dos clientes
  totalPagará: number; // Total que ainda pagará aos correspondentes
  
  // Já movimentado (admin only)
  totalPago: number; // Total já pago aos correspondentes
  totalRecebido: number; // Total já recebido dos clientes
  
  // Métricas (admin only)
  margemLucro: number; // Percentual de margem de lucro
  ticketMedio: number; // Ticket médio por diligência
  
  // Por período (admin only)
  faturadoMes: number;
  lucroMes: number;
  recebidoMes: number;
  pagoMes: number;
}

export interface Payment {
  id: string;
  diligenceId: string;
  type: 'client_payment' | 'correspondent_payment';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  method: 'pix'; // Apenas PIX
  pixKey?: string;
  dueDate?: string;
  paidDate?: string;
  transactionId?: string;
  proofImageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  diligenceId: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  type: 'text' | 'file' | 'system';
  attachments?: Attachment[];
  readAt?: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  diligenceId: string;
  type: 'created' | 'assigned' | 'started' | 'updated' | 'completed' | 'cancelled' | 'message' | 'payment';
  description: string;
  userId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface DashboardStats {
  totalDiligences: number;
  activeDiligences: number;
  completedDiligences: number;
  totalRevenue: number;
  pendingPayments: number;
  activeCorrespondents: number;
  activeClients: number;
  monthlyGrowth: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'diligence_assigned' | 'payment_received' | 'deadline_reminder' | 'feedback_received' | 'system_update';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface QualityMetrics {
  correspondentId: string;
  totalDiligences: number;
  completedDiligences: number;
  averageRating: number;
  onTimeDelivery: number;
  responseTime: number;
  disputeRate: number;
  clientRetention: number;
  lastUpdated: string;
}

export interface AssignmentCriteria {
  location: {
    state: string;
    city?: string;
    radius?: number;
  };
  specialties: string[];
  minRating?: number;
  maxResponseTime?: number;
  preferredCorrespondents?: string[];
  excludedCorrespondents?: string[];
}

export interface PlatformSettings {
  assignment: {
    autoAssignment: boolean;
    assignmentRadius: number;
    maxAssignmentTime: number;
    requireApproval: boolean;
  };
  quality: {
    minimumRating: number;
    maxResponseTime: number;
    qualityThreshold: number;
  };
  payments: {
    paymentTerms: number;
    lateFeePercentage: number;
  };
}