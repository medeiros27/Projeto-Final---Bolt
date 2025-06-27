import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { Diligence } from '../entities/Diligence';
import { Attachment } from '../entities/Attachment';
import { Payment } from '../entities/Payment';
import { StatusHistory } from '../entities/StatusHistory';

async function seed() {
  try {
    // Inicializar conexão com o banco de dados
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida');

    // Repositórios
    const userRepository = AppDataSource.getRepository(User);
    const diligenceRepository = AppDataSource.getRepository(Diligence);
    const attachmentRepository = AppDataSource.getRepository(Attachment);
    const paymentRepository = AppDataSource.getRepository(Payment);
    const statusHistoryRepository = AppDataSource.getRepository(StatusHistory);

    // Verificar se já existem dados
    const userCount = await userRepository.count();
    if (userCount > 0) {
      console.log('Banco de dados já possui dados. Pulando seed.');
      return;
    }

    // Criar usuários
    console.log('Criando usuários...');

    // Admin
    const adminPassword = await bcrypt.hash('admin123', 8);
    const admin = userRepository.create({
      name: 'Administrador',
      email: 'admin@jurisconnect.com',
      password: adminPassword,
      role: 'admin',
      status: 'active',
    });
    await userRepository.save(admin);

    // Cliente
    const clientPassword = await bcrypt.hash('cliente123', 8);
    const client = userRepository.create({
      name: 'João Silva',
      email: 'cliente@exemplo.com',
      password: clientPassword,
      role: 'client',
      status: 'active',
      phone: '(11) 99999-9999',
      companyName: 'Silva Advocacia',
      cnpj: '12.345.678/0001-90',
      address: 'Av. Paulista, 1000, São Paulo, SP',
      city: 'São Paulo',
      state: 'SP',
      verified: true,
    });
    await userRepository.save(client);

    // Correspondente
    const correspondentPassword = await bcrypt.hash('corresp123', 8);
    const correspondent = userRepository.create({
      name: 'Maria Santos',
      email: 'correspondente@exemplo.com',
      password: correspondentPassword,
      role: 'correspondent',
      status: 'active',
      phone: '(11) 88888-8888',
      oab: 'SP123456',
      city: 'São Paulo',
      state: 'SP',
      verified: true,
      specialties: ['Direito Trabalhista', 'Direito Cível'],
      coverage: ['SP', 'São Paulo'],
      rating: 4.8,
      totalDiligences: 25,
      completionRate: 96,
      responseTime: 4,
    });
    await userRepository.save(correspondent);

    // Criar diligências
    console.log('Criando diligências...');

    // Diligência 1 - Pendente
    const diligence1 = diligenceRepository.create({
      title: 'Citação em Ação de Cobrança',
      description: 'Realizar citação do réu João da Silva na Ação de Cobrança nº 1234567-89.2024.8.26.0001',
      type: 'Citação',
      status: 'pending',
      priority: 'medium',
      value: 150.00,
      deadline: new Date('2024-12-30T23:59:59Z'),
      city: 'São Paulo',
      state: 'SP',
      clientId: client.id,
    });
    await diligenceRepository.save(diligence1);

    // Histórico de status
    await statusHistoryRepository.save({
      diligenceId: diligence1.id,
      entityType: 'diligence',
      previousStatus: '',
      newStatus: 'pending',
      userId: client.id,
      reason: 'Criação da diligência',
    });

    // Diligência 2 - Atribuída
    const diligence2 = diligenceRepository.create({
      title: 'Intimação de Testemunha',
      description: 'Intimar testemunha Maria da Silva para audiência marcada para 15/01/2025',
      type: 'Intimação',
      status: 'assigned',
      priority: 'high',
      value: 200.00,
      deadline: new Date('2024-12-28T23:59:59Z'),
      city: 'São Paulo',
      state: 'SP',
      clientId: client.id,
      correspondentId: correspondent.id,
    });
    await diligenceRepository.save(diligence2);

    // Histórico de status
    await statusHistoryRepository.save({
      diligenceId: diligence2.id,
      entityType: 'diligence',
      previousStatus: '',
      newStatus: 'pending',
      userId: client.id,
      reason: 'Criação da diligência',
    });

    await statusHistoryRepository.save({
      diligenceId: diligence2.id,
      entityType: 'diligence',
      previousStatus: 'pending',
      newStatus: 'assigned',
      userId: admin.id,
      reason: 'Diligência atribuída ao correspondente',
    });

    // Diligência 3 - Concluída
    const diligence3 = diligenceRepository.create({
      title: 'Busca e Apreensão de Veículo',
      description: 'Executar mandado de busca e apreensão do veículo Fiat Uno, placa ABC-1234',
      type: 'Busca e Apreensão',
      status: 'completed',
      priority: 'urgent',
      value: 300.00,
      deadline: new Date('2024-12-20T23:59:59Z'),
      city: 'São Paulo',
      state: 'SP',
      clientId: client.id,
      correspondentId: correspondent.id,
    });
    await diligenceRepository.save(diligence3);

    // Histórico de status
    await statusHistoryRepository.save({
      diligenceId: diligence3.id,
      entityType: 'diligence',
      previousStatus: '',
      newStatus: 'pending',
      userId: client.id,
      reason: 'Criação da diligência',
    });

    await statusHistoryRepository.save({
      diligenceId: diligence3.id,
      entityType: 'diligence',
      previousStatus: 'pending',
      newStatus: 'assigned',
      userId: admin.id,
      reason: 'Diligência atribuída ao correspondente',
    });

    await statusHistoryRepository.save({
      diligenceId: diligence3.id,
      entityType: 'diligence',
      previousStatus: 'assigned',
      newStatus: 'in_progress',
      userId: correspondent.id,
      reason: 'Diligência iniciada pelo correspondente',
    });

    await statusHistoryRepository.save({
      diligenceId: diligence3.id,
      entityType: 'diligence',
      previousStatus: 'in_progress',
      newStatus: 'completed',
      userId: correspondent.id,
      reason: 'Diligência concluída pelo correspondente',
    });

    // Criar anexos
    console.log('Criando anexos...');

    await attachmentRepository.save({
      name: 'mandado_citacao.pdf',
      url: 'https://example.com/attachments/mandado_citacao.pdf',
      type: 'application/pdf',
      size: 245760,
      diligenceId: diligence1.id,
      uploadedById: client.id,
    });

    await attachmentRepository.save({
      name: 'auto_busca_apreensao.pdf',
      url: 'https://example.com/attachments/auto_busca_apreensao.pdf',
      type: 'application/pdf',
      size: 512000,
      diligenceId: diligence3.id,
      uploadedById: correspondent.id,
    });

    // Criar pagamentos
    console.log('Criando pagamentos...');

    await paymentRepository.save({
      diligenceId: diligence3.id,
      type: 'client_payment',
      amount: 300.00,
      status: 'completed',
      method: 'pix',
      pixKey: 'cliente@exemplo.com',
      paidDate: new Date(),
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId: client.id,
    });

    await paymentRepository.save({
      diligenceId: diligence3.id,
      type: 'correspondent_payment',
      amount: 210.00, // 70% do valor
      status: 'completed',
      method: 'pix',
      pixKey: 'correspondente@exemplo.com',
      paidDate: new Date(),
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      correspondentId: correspondent.id,
    });

    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seed:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro no seed:', error);
    process.exit(1);
  });