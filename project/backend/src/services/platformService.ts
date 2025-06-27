import { User, Diligence, Payment, QualityMetrics, AssignmentCriteria } from '../@types';
import { mockUsers, mockDiligences } from '../data/mockData';

class PlatformService {
  private static instance: PlatformService;
  private correspondents: User[] = [];
  private clients: User[] = [];
  private diligences: Diligence[] = [];
  private payments: Payment[] = [];
  private qualityMetrics: QualityMetrics[] = [];

  private constructor() {
    this.loadMockData();
  }

  public static getInstance(): PlatformService {
    if (!PlatformService.instance) {
      PlatformService.instance = new PlatformService();
    }
    return PlatformService.instance;
  }

  private loadMockData() {
    // Load from localStorage or initialize with mock data
    const storedData = localStorage.getItem('jurisconnect_platform_data');
    if (storedData) {
      const data = JSON.parse(storedData);
      this.correspondents = data.correspondents || [];
      this.clients = data.clients || [];
      this.diligences = data.diligences || [];
      this.payments = data.payments || [];
      this.qualityMetrics = data.qualityMetrics || [];
    } else {
      this.initializeMockData();
    }
  }

  private savePlatformData() {
    const data = {
      correspondents: this.correspondents,
      clients: this.clients,
      diligences: this.diligences,
      payments: this.payments,
      qualityMetrics: this.qualityMetrics
    };
    localStorage.setItem('jurisconnect_platform_data', JSON.stringify(data));
  }

  private initializeMockData() {
    // Initialize with enhanced mock data
    this.correspondents = mockUsers
      .filter(u => u.role === 'correspondent')
      .map(u => ({
        ...u,
        specialties: this.generateSpecialties(),
        coverage: [u.state!, u.city!],
        rating: 4.0 + Math.random() * 1.0,
        totalDiligences: Math.floor(Math.random() * 100) + 10,
        completionRate: 85 + Math.random() * 15,
        responseTime: Math.floor(Math.random() * 24) + 1,
        verified: Math.random() > 0.3
      }));

    this.clients = mockUsers
      .filter(u => u.role === 'client')
      .map(u => ({
        ...u,
        companyName: `${u.name} Advocacia`,
        cnpj: this.generateCNPJ(),
        subscription: {
          id: Date.now().toString(),
          plan: 'premium' as const,
          status: 'active' as const,
          startDate: new Date().toISOString(),
          features: ['unlimited_diligences', 'priority_support', 'advanced_analytics'],
          price: 299.90,
          billingCycle: 'monthly' as const
        }
      }));

    this.generateMockPayments();
    this.generateQualityMetrics();
    this.savePlatformData();
  }

  private generateSpecialties(): string[] {
    const allSpecialties = [
      'Direito Trabalhista',
      'Direito Cível',
      'Direito Empresarial',
      'Direito Tributário',
      'Direito Penal',
      'Direito Previdenciário',
      'Direito Imobiliário',
      'Direito de Família'
    ];
    
    const count = Math.floor(Math.random() * 4) + 2;
    return allSpecialties.sort(() => 0.5 - Math.random()).slice(0, count);
  }

  private generateCNPJ(): string {
    const numbers = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10));
    return `${numbers.slice(0, 2).join('')}.${numbers.slice(2, 5).join('')}.${numbers.slice(5, 8).join('')}/${numbers.slice(8, 12).join('')}-${numbers.slice(12, 14).join('')}`;
  }

  private generateMockPayments() {
    this.payments = mockDiligences.map(diligence => ({
      id: `payment-${diligence.id}`,
      diligenceId: diligence.id,
      type: 'client_payment' as const,
      amount: diligence.value,
      status: diligence.status === 'completed' ? 'completed' as const : 'pending' as const,
      method: 'pix' as const,
      createdAt: diligence.createdAt,
      updatedAt: diligence.updatedAt,
      ...(diligence.status === 'completed' && {
        paidDate: diligence.updatedAt,
        transactionId: `txn_${Date.now()}`
      })
    }));
  }

  private generateQualityMetrics() {
    this.qualityMetrics = this.correspondents.map(correspondent => ({
      correspondentId: correspondent.id,
      totalDiligences: correspondent.totalDiligences || 0,
      completedDiligences: Math.floor((correspondent.totalDiligences || 0) * (correspondent.completionRate || 90) / 100),
      averageRating: correspondent.rating || 4.5,
      onTimeDelivery: correspondent.completionRate || 90,
      responseTime: correspondent.responseTime || 12,
      disputeRate: Math.random() * 5,
      clientRetention: 80 + Math.random() * 20,
      lastUpdated: new Date().toISOString()
    }));
  }

  // Client Management
  async registerClient(clientData: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newClient: User = {
      id: Date.now().toString(),
      ...clientData,
      role: 'client',
      status: 'pending',
      createdAt: new Date().toISOString(),
      subscription: {
        id: Date.now().toString(),
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        features: ['basic_diligences', 'email_support'],
        price: 99.90,
        billingCycle: 'monthly'
      }
    } as User;

    this.clients.push(newClient);
    this.savePlatformData();
    return newClient;
  }

  async validateClient(clientId: string, documents: File[]): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      client.status = 'active';
      client.verified = true;
      this.savePlatformData();
    }
    
    return true;
  }

  // Correspondent Management
  async registerCorrespondent(correspondentData: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newCorrespondent: User = {
      id: Date.now().toString(),
      ...correspondentData,
      role: 'correspondent',
      status: 'pending',
      createdAt: new Date().toISOString(),
      specialties: [],
      coverage: [],
      rating: 0,
      totalDiligences: 0,
      completionRate: 0,
      responseTime: 0,
      verified: false
    } as User;

    this.correspondents.push(newCorrespondent);
    this.savePlatformData();
    return newCorrespondent;
  }

  async credentialCorrespondent(correspondentId: string, documents: File[]): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const correspondent = this.correspondents.find(c => c.id === correspondentId);
    if (correspondent) {
      correspondent.status = 'active';
      correspondent.verified = true;
      this.savePlatformData();
    }
    
    return true;
  }

  // Smart Assignment System
  async findBestCorrespondent(criteria: AssignmentCriteria): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const availableCorrespondents = this.correspondents.filter(c => 
      c.status === 'active' && 
      c.verified &&
      c.state === criteria.location.state &&
      (!criteria.location.city || c.city === criteria.location.city) &&
      (!criteria.minRating || (c.rating || 0) >= criteria.minRating) &&
      (!criteria.maxResponseTime || (c.responseTime || 24) <= criteria.maxResponseTime) &&
      (!criteria.excludedCorrespondents || !criteria.excludedCorrespondents.includes(c.id))
    );

    if (availableCorrespondents.length === 0) return null;

    // Score correspondents based on multiple factors
    const scoredCorrespondents = availableCorrespondents.map(correspondent => {
      let score = 0;
      
      // Rating weight (40%)
      score += (correspondent.rating || 0) * 0.4;
      
      // Response time weight (20%) - lower is better
      score += (24 - (correspondent.responseTime || 24)) / 24 * 0.2;
      
      // Completion rate weight (20%)
      score += (correspondent.completionRate || 0) / 100 * 0.2;
      
      // Specialty match weight (20%)
      const specialtyMatch = criteria.specialties.some(s => 
        correspondent.specialties?.includes(s)
      );
      score += specialtyMatch ? 0.2 : 0;

      return { correspondent, score };
    });

    // Sort by score and return the best match
    scoredCorrespondents.sort((a, b) => b.score - a.score);
    return scoredCorrespondents[0].correspondent;
  }

  async autoAssignDiligence(diligenceId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const diligence = this.diligences.find(d => d.id === diligenceId);
    if (!diligence) return false;

    // Create assignment criteria based on diligence
    const criteria: AssignmentCriteria = {
      location: {
        state: diligence.state,
        city: diligence.city
      },
      specialties: [diligence.type]
    };

    const bestCorrespondent = await this.findBestCorrespondent(criteria);
    if (!bestCorrespondent) return false;

    // Assign the diligence
    diligence.correspondentId = bestCorrespondent.id;
    diligence.correspondent = bestCorrespondent;
    diligence.status = 'assigned';
    diligence.updatedAt = new Date().toISOString();

    this.savePlatformData();
    return true;
  }

  // Payment Processing
  async processClientPayment(diligenceId: string, paymentMethod: string): Promise<Payment> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const diligence = this.diligences.find(d => d.id === diligenceId);
    if (!diligence) throw new Error('Diligência não encontrada');

    const payment: Payment = {
      id: `payment-${Date.now()}`,
      diligenceId,
      type: 'client_payment',
      amount: diligence.value,
      status: 'completed',
      method: 'pix',
      paidDate: new Date().toISOString(),
      transactionId: `txn_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.payments.push(payment);
    this.savePlatformData();
    return payment;
  }

  async processCorrespondentPayout(paymentId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return false;

    payment.updatedAt = new Date().toISOString();
    this.savePlatformData();
    return true;
  }

  // Quality Control
  async submitFeedback(diligenceId: string, fromUserId: string, toUserId: string, feedback: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const diligence = this.diligences.find(d => d.id === diligenceId);
    if (!diligence) return;

    // Update correspondent rating
    if (toUserId) {
      const correspondent = this.correspondents.find(c => c.id === toUserId);
      if (correspondent) {
        const currentRating = correspondent.rating || 0;
        const totalDiligences = correspondent.totalDiligences || 0;
        correspondent.rating = ((currentRating * totalDiligences) + feedback.rating) / (totalDiligences + 1);
      }
    }

    this.savePlatformData();
  }

  async getQualityMetrics(correspondentId: string): Promise<QualityMetrics | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.qualityMetrics.find(m => m.correspondentId === correspondentId) || null;
  }

  // Analytics and Reporting
  async getPlatformAnalytics(): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const totalRevenue = this.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const averageRating = this.correspondents
      .filter(c => c.rating)
      .reduce((sum, c) => sum + (c.rating || 0), 0) / this.correspondents.length;

    return {
      totalRevenue,
      totalDiligences: this.diligences.length,
      activeCorrespondents: this.correspondents.filter(c => c.status === 'active').length,
      activeClients: this.clients.filter(c => c.status === 'active').length,
      averageRating,
      completionRate: this.diligences.filter(d => d.status === 'completed').length / this.diligences.length * 100,
      averageResponseTime: this.correspondents.reduce((sum, c) => sum + (c.responseTime || 0), 0) / this.correspondents.length
    };
  }

  // Document Management
  async uploadDocument(userId: string, file: File, type: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate file upload and return URL
    const url = URL.createObjectURL(file);
    return url;
  }

  // Communication
  async sendMessage(diligenceId: string, fromUserId: string, toUserId: string, content: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const diligence = this.diligences.find(d => d.id === diligenceId);
    if (!diligence) return;

    if (!diligence.messages) diligence.messages = [];

    diligence.messages.push({
      id: Date.now().toString(),
      diligenceId,
      fromUserId,
      toUserId,
      content,
      type: 'text',
      createdAt: new Date().toISOString()
    });

    this.savePlatformData();
  }

  // Getters
  async getClients(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.clients];
  }

  async getCorrespondents(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.correspondents];
  }

  async getPayments(): Promise<Payment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.payments];
  }

  async getDiligences(): Promise<Diligence[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.diligences];
  }
}

export default PlatformService.getInstance();