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
  companyName?: string;
  cnpj?: string;
  address?: string;
  specialties?: string[];
  coverage?: string[];
  rating?: number;
  totalDiligences?: number;
  completionRate?: number;
  responseTime?: number;
  verified?: boolean;
  verificationDocuments?: VerificationDocument[];
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
  value: number;
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
  statusHistory?: string[];
  financialData?: DiligenceFinancialData;
  paymentProof?: PaymentProof;
  messages?: Message[];
  timeline?: TimelineEvent[];
}

export interface DiligenceFinancialData {
  id: string;
  diligenceId: string;
  faturado: number;
  custo: number;
  lucro: number;
  clientPaymentStatus: 'pending' | 'paid' | 'overdue';
  correspondentPaymentStatus: 'pending' | 'paid' | 'scheduled';
  clientPaymentDate?: string;
  correspondentPaymentDate?: string;
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
  proofImage: string;
  status: 'pending_verification' | 'verified' | 'rejected';
  uploadedBy: string;
  uploadedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface FinancialSummary {
  totalFaturado: number;
  totalLucro: number;
  totalCusto: number;
  totalReceberá: number;
  totalPagará: number;
  totalPago: number;
  totalRecebido: number;
  margemLucro: number;
  ticketMedio: number;
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
  method: 'pix';
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

// SOLUÇÃO: Adicionar a interface Notification aqui
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
