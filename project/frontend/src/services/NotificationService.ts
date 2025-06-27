import api from './api';
import { Notification } from '../types';

class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Busca as notificações de um utilizador específico.
   * O backend deve ter uma rota como /notifications que retorna as notificações do utilizador autenticado (via token).
   */
  async getNotifications(): Promise<Notification[]> {
    // A rota deve ser '/notifications'. O backend identificará o utilizador pelo token JWT.
    return api.get('/notifications');
  }

  /**
   * Marca uma notificação específica como lida.
   */
  async markAsRead(notificationId: string): Promise<void> {
    return api.patch(`/notifications/${notificationId}/read`);
  }

  /**
   * Marca todas as notificações de um utilizador como lidas.
   */
  async markAllAsRead(): Promise<void> {
    // O backend identificará o utilizador pelo token.
    return api.post('/notifications/read-all');
  }

  /**
   * Elimina uma notificação.
   */
  async deleteNotification(notificationId: string): Promise<void> {
    return api.delete(`/notifications/${notificationId}`);
  }

  /**
   * Função de subscrição (placeholder).
   * As notificações em tempo real (WebSockets) podem ser implementadas aqui no futuro.
   * Por agora, ela retorna uma função vazia para evitar o erro na aplicação.
   */
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    console.warn("A função de subscrição de notificações (real-time) não está implementada.");
    // Retorna uma função de "cancelamento" que não faz nada.
    return () => {};
  }
}

export default NotificationService.getInstance();
