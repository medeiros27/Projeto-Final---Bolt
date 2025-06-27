import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import Modal from '../Modals/Modal';
import { useToast } from '../UI/ToastContainer';
import { 
  Bell, 
  X, 
  Check, 
  Settings,
  FileText,
  DollarSign,
  Clock,
  User,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Notification } from '../../types';
import notificationService from '../../services/notificationService';
import LoadingSpinner from '../UI/LoadingSpinner'; // Importando um spinner consistente

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Usamos useCallback para que a função não seja recriada a cada renderização
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      // A primeira vez que carrega, mostra o spinner
      setLoading(notifications.length === 0);
      const userNotifications = await notificationService.getNotifications();
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      // Opcional: Adicionar um toast de erro
      // addToast({ type: 'danger', title: 'Erro', message: 'Não foi possível buscar as notificações.' });
    } finally {
      setLoading(false);
    }
  }, [user, notifications.length]);


  useEffect(() => {
    if (user && isOpen) {
      loadNotifications(); // Carrega as notificações quando o painel é aberto

      // Configura o polling para verificar por novas notificações periodicamente
      const intervalId = setInterval(loadNotifications, 30000); // A cada 30 segundos

      // Função de limpeza: para o polling quando o componente é desmontado ou o painel fechado
      return () => clearInterval(intervalId);
    }
  }, [user, isOpen, loadNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'diligence_assigned': return FileText;
      case 'payment_received': return DollarSign;
      case 'deadline_reminder': return Clock;
      case 'feedback_received': return User;
      case 'system_update': return Info;
      default: return Bell;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      addToast({ type: 'danger', title: 'Erro', message: 'Não foi possível marcar a notificação como lida.' });
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      addToast({ type: 'success', title: 'Sucesso', message: 'Todas as notificações foram marcadas como lidas.' });
    } catch (error) {
      addToast({ type: 'danger', title: 'Erro', message: 'Não foi possível marcar todas as notificações como lidas.' });
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Notificações" size="md">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4" />
                <p>Nenhuma notificação por aqui.</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div key={notification.id} /* ...código de renderização da notificação... */ >
                    {/* O resto da sua UI para cada notificação aqui */}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default NotificationCenter;
