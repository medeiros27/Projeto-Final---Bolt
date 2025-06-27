// SOLUÇÃO: Importar 'Notification' do ficheiro de tipos local do frontend.
import { Notification } from '../types';
import { mockUsers } from '../data/mockData'; // Usar dados mock para simulação

class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];

  private constructor() {
    // Simular algumas notificações iniciais
    this.notifications = [
      {
        id: '1',
        userId: '2', // ID do Cliente
        type: 'diligence_assigned',
        title: 'Nova diligência para si!',
        message: 'A diligência "Busca e Apreensão de Veículo" foi-lhe atribuída.',
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        userId: '3', // ID do Correspondente
        type: 'payment_received',
        title: 'Pagamento Recebido',
        message: 'O pagamento de R$ 150,00 para a diligência "Citação em Ação de Cobrança" foi confirmado.',
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
      },
    ];
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Simula a obtenção de notificações para um utilizador
  async getNotifications(userId: string): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simular atraso da rede
    return this.notifications.filter(n => n.userId === userId);
  }

  // Simula a marcação de uma notificação como lida
  async markAsRead(notificationId: string): Promise<void> {
    this.notifications = this.notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
    );
  }

  // Simula a marcação de todas as notificações como lidas
  async markAllAsRead(userId: string): Promise<void> {
    this.notifications = this.notifications.map(n => 
        n.userId === userId ? { ...n, read: true } : n
    );
  }

  // Simula a exclusão de uma notificação
  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }
  
  // Simula a subscrição de notificações em tempo real
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    const interval = setInterval(() => {
        // Simular o recebimento de uma nova notificação ocasionalmente
    }, 30000); // A cada 30 segundos
    
    // Retorna uma função de cancelamento da subscrição
    return () => clearInterval(interval);
  }
  
  // Simula o pedido de permissão para notificações do navegador
  async requestNotificationPermission(): Promise<boolean> {
    // Em um ambiente real, você usaria a API de Notificações do navegador
    console.log("A pedir permissão para notificações...");
    return true; // Simular que a permissão foi concedida
  }

  // Simula a criação de uma notificação (útil para testes no frontend)
  async createNotification(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    this.notifications.unshift(newNotification);
    return newNotification;
  }
}

export default NotificationService.getInstance();
