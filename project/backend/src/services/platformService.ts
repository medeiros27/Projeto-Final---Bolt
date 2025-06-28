import { User, Diligence, Payment, QualityMetrics, AssignmentCriteria } from '../@types';
import { AppDataSource } from '../data-source';
import { UserRepository } from '../repositories/UserRepository';
import { DiligenceRepository } from '../repositories/DiligenceRepository';
import { FinancialRepository } from '../repositories/FinancialRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';
import { StatusHistoryRepository } from '../repositories/StatusHistoryRepository';
import { AttachmentRepository } from '../repositories/AttachmentRepository';
import { PaymentRepository } from '../repositories/PaymentRepository'; // Assumindo que você tem um PaymentRepository
// import { QualityMetricsRepository } from '../repositories/QualityMetricsRepository'; // Assumindo que você tem um QualityMetricsRepository

class PlatformService {
  private userRepository: UserRepository;
  private diligenceRepository: DiligenceRepository;
  private financialRepository: FinancialRepository;
  private notificationRepository: NotificationRepository;
  private statusHistoryRepository: StatusHistoryRepository;
  private attachmentRepository: AttachmentRepository;
  private paymentRepository: PaymentRepository; // Adicionado
  // private qualityMetricsRepository: QualityMetricsRepository; // Adicionado, se aplicável

  constructor() {
    this.userRepository = new UserRepository();
    this.diligenceRepository = new DiligenceRepository();
    this.financialRepository = new FinancialRepository();
    this.notificationRepository = new NotificationRepository();
    this.statusHistoryRepository = new StatusHistoryRepository();
    this.attachmentRepository = new AttachmentRepository();
    this.paymentRepository = new PaymentRepository(); // Instancie seu PaymentRepository
    // this.qualityMetricsRepository = new QualityMetricsRepository(); // Instancie seu QualityMetricsRepository
  }

  // Client Management
  async registerClient(clientData: Partial<User>): Promise<User> {
    const newClient = this.userRepository.create({
      ...clientData,
      role: 'client',
      status: 'active', // Ou 'pending', dependendo da sua lógica de negócio inicial
      createdAt: new Date().toISOString(),
    });
    await this.userRepository.save(newClient);
    return newClient;
  }

  async validateClient(clientId: string, documents: File[]): Promise<boolean> {
    const client = await this.userRepository.findOneBy({ id: clientId });
    if (client) {
      client.status = 'active';
      client.verified = true;
      await this.userRepository.save(client);
      return true;
    }
    return false;
  }

  // Correspondent Management
  async registerCorrespondent(correspondentData: Partial<User>): Promise<User> {
    const newCorrespondent = this.userRepository.create({
      ...correspondentData,
      role: 'correspondent',
      status: 'pending', // Geralmente 'pending' para correspondentes que precisam de credenciamento
      createdAt: new Date().toISOString(),
      specialties: [], // Propriedades específicas de correspondente
      coverage: [],
      rating: 0,
      totalDiligences: 0,
      completionRate: 0,
      responseTime: 0,
      verified: false
    });
    await this.userRepository.save(newCorrespondent);
    return newCorrespondent;
  }

  async credentialCorrespondent(correspondentId: string, documents: File[]): Promise<boolean> {
    const correspondent = await this.userRepository.findOneBy({ id: correspondentId });
    if (correspondent) {
      correspondent.status = 'active';
      correspondent.verified = true;
      await this.userRepository.save(correspondent);
      return true;
    }
    return false;
  }

  // Smart Assignment System
  async findBestCorrespondent(criteria: AssignmentCriteria): Promise<User | null> {
    // Esta lógica assume que os correspondentes são buscados do banco de dados
    // e que as propriedades necessárias (status, verified, state, city, rating, responseTime, specialties) estão disponíveis.
    const allCorrespondents = await this.userRepository.find({
      where: { role: 'correspondent' },
    });

    const availableCorrespondents = allCorrespondents.filter(c =>
      c.status === 'active' &&
      c.verified &&
      c.state === criteria.location.state &&
      (!criteria.location.city || c.city === criteria.location.city) &&
      (!criteria.minRating || (c.rating || 0) >= criteria.minRating) &&
      (!criteria.maxResponseTime || (c.responseTime || 24) <= criteria.maxResponseTime) &&
      (!criteria.excludedCorrespondents || !criteria.excludedCorrespondents.includes(c.id))
    );

    if (availableCorrespondents.length === 0) return null;

    const scoredCorrespondents = availableCorrespondents.map(correspondent => {
      let score = 0;

      score += (correspondent.rating || 0) * 0.4;
      score += (24 - (correspondent.responseTime || 24)) / 24 * 0.2;
      score += (correspondent.completionRate || 0) / 100 * 0.2;

      const specialtyMatch = criteria.specialties.some(s =>
        correspondent.specialties?.includes(s)
      );
      score += specialtyMatch ? 0.2 : 0;

      return { correspondent, score };
    });

    scoredCorrespondents.sort((a, b) => b.score - a.score);
    return scoredCorrespondents[0].correspondent;
  }

  async autoAssignDiligence(diligenceId: string): Promise<boolean> {
    const diligence = await this.diligenceRepository.findOneBy({ id: diligenceId });
    if (!diligence) return false;

    const criteria: AssignmentCriteria = {
      location: {
        state: diligence.state,
        city: diligence.city
      },
      specialties: [diligence.type]
    };

    const bestCorrespondent = await this.findBestCorrespondent(criteria);
    if (!bestCorrespondent) return false;

    diligence.correspondentId = bestCorrespondent.id;
    // diligence.correspondent = bestCorrespondent; // Remover se a entidade Diligence não tiver uma relação direta com User aqui
    diligence.status = 'assigned';
    diligence.updatedAt = new Date().toISOString();

    await this.diligenceRepository.save(diligence);
    return true;
  }

  // Payment Processing
  async processClientPayment(diligenceId: string, paymentMethod: string): Promise<Payment> {
    const diligence = await this.diligenceRepository.findOneBy({ id: diligenceId });
    if (!diligence) throw new Error('Diligência não encontrada');

    const newPayment = this.paymentRepository.create({
      id: `payment-${Date.now()}`,
      diligenceId,
      type: 'client_payment',
      amount: diligence.value,
      status: 'completed',
      method: paymentMethod,
      paidDate: new Date().toISOString(),
      transactionId: `txn_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await this.paymentRepository.save(newPayment);
    return newPayment;
  }

  async processCorrespondentPayout(paymentId: string): Promise<boolean> {
    const payment = await this.paymentRepository.findOneBy({ id: paymentId });
    if (!payment) return false;

    // Lógica para processar o pagamento real ao correspondente (integração com gateway de pagamento, etc.)
    // Por enquanto, apenas atualiza o status ou data de atualização
    payment.updatedAt = new Date().toISOString();
    await this.paymentRepository.save(payment);
    return true;
  }

  // Quality Control
  async submitFeedback(diligenceId: string, fromUserId: string, toUserId: string, feedback: any): Promise<void> {
    const diligence = await this.diligenceRepository.findOneBy({ id: diligenceId });
    if (!diligence) return;

    if (toUserId) {
      const correspondent = await this.userRepository.findOneBy({ id: toUserId });
      if (correspondent) {
        const currentRating = correspondent.rating || 0;
        const totalDiligences = correspondent.totalDiligences || 0;
        correspondent.rating = ((currentRating * totalDiligences) + feedback.rating) / (totalDiligences + 1);
        await this.userRepository.save(correspondent);
      }
    }
    // Lógica para salvar o feedback em uma entidade de Feedback, se houver
  }

  async getQualityMetrics(correspondentId: string): Promise<QualityMetrics | null> {
    // Esta função dependeria de uma entidade QualityMetrics e seu repositório
    // Por enquanto, retorna null ou uma estrutura mockada se não houver persistência para isso
    console.warn('getQualityMetrics: Implementação com banco de dados pendente.');
    return null;
  }

  // Analytics and Reporting
  async getPlatformAnalytics(): Promise<any> {
    // Para análises reais, você precisaria de queries mais complexas no banco de dados
    const totalRevenue = (await this.paymentRepository.find({ where: { status: 'completed' } }))
      .reduce((sum, p) => sum + p.amount, 0);

    const allCorrespondents = await this.userRepository.find({ where: { role: 'correspondent' } });
    const averageRating = allCorrespondents
      .filter(c => c.rating)
      .reduce((sum, c) => sum + (c.rating || 0), 0) / allCorrespondents.length;

    const allDiligences = await this.diligenceRepository.find();

    return {
      totalRevenue,
      totalDiligences: allDiligences.length,
      activeCorrespondents: allCorrespondents.filter(c => c.status === 'active').length,
      activeClients: (await this.userRepository.find({ where: { role: 'client', status: 'active' } })).length,
      averageRating,
      completionRate: allDiligences.filter(d => d.status === 'completed').length / allDiligences.length * 100,
      averageResponseTime: allCorrespondents.reduce((sum, c) => sum + (c.responseTime || 0), 0) / allCorrespondents.length
    };
  }

  // Document Management
  async uploadDocument(userId: string, file: File, type: string): Promise<string> {
    // Esta lógica dependeria de um serviço de armazenamento de arquivos (S3, Google Cloud Storage, etc.)
    // ou de uma entidade Attachment para persistir metadados no banco de dados.
    console.warn('uploadDocument: Lógica de upload de documentos pendente. Implementar integração com serviço de armazenamento.');
    // Exemplo: const newAttachment = this.attachmentRepository.create({ userId, type, url: 'url_do_arquivo' });
    // await this.attachmentRepository.save(newAttachment);
    return '';
  }

  // Communication
  async sendMessage(diligenceId: string, fromUserId: string, toUserId: string, content: string): Promise<void> {
    // Esta lógica dependeria de uma entidade Message ou de um serviço de mensagens
    const diligence = await this.diligenceRepository.findOneBy({ id: diligenceId });
    if (!diligence) return;

    // Se você tiver uma entidade Message:
    // const newMessage = this.messageRepository.create({ diligenceId, fromUserId, toUserId, content, type: 'text', createdAt: new Date().toISOString() });
    // await this.messageRepository.save(newMessage);
    console.warn('sendMessage: Lógica de comunicação com banco de dados pendente. Considere uma entidade Message.');
  }

  // Getters
  async getClients(): Promise<User[]> {
    return this.userRepository.find({ where: { role: 'client' } });
  }

  async getCorrespondents(): Promise<User[]> {
    return this.userRepository.find({ where: { role: 'correspondent' } });
  }

  async getPayments(): Promise<Payment[]> {
    return this.paymentRepository.find();
  }

  async getDiligences(): Promise<Diligence[]> {
    return this.diligenceRepository.find();
  }
}

export default new PlatformService();
