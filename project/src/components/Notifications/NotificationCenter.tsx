import React, { useState, useEffect } from 'react';
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
  Calendar,
  FileText,
  User,
  DollarSign,
  AlertCircle,
  Info,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Notification } from '../../types';
import notificationService from '../../services/notificationService';

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
      setupRealtimeNotifications();
      requestNotificationPermission();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userNotifications = await notificationService.getNotifications(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeNotifications = () => {
    if (!user) return;

    // Configurar listener para notificações em tempo real
    const unsubscribe = notificationService.subscribe(user.id, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      
      // Mostrar toast para notificação em tempo real
      addToast({
        type: 'info',
        title: newNotification.title,
        message: newNotification.message
      });
    });

    return unsubscribe;
  };

  const requestNotificationPermission = async () => {
    const granted = await notificationService.requestNotificationPermission();
    if (!granted) {
      addToast({
        type: 'warning',
        title: 'Notificações Desabilitadas',
        message: 'Habilite as notificações do navegador para receber alertas em tempo real.'
      });
    }
  };

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

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'diligence_assigned': return 'text-blue-600 bg-blue-100';
      case 'payment_received': return 'text-green-600 bg-green-100';
      case 'deadline_reminder': return 'text-yellow-600 bg-yellow-100';
      case 'feedback_received': return 'text-purple-600 bg-purple-100';
      case 'system_update': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllAsRead(user.id);
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      addToast({
        type: 'success',
        title: 'Notificações marcadas como lidas',
        message: 'Todas as notificações foram marcadas como lidas.'
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    }
  };

  return (
    <>
      {/* Notification Bell */}
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

      {/* Notification Panel */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Notificações"
        size="md"
      >
        <div className="space-y-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Check className="h-4 w-4 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Notifications List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.read 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              notification.read ? 'text-gray-700' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className={`text-sm mt-1 ${
                              notification.read ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Marcar como lida"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              title="Excluir"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Configurações de Notificação"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Notificações em Tempo Real</h4>
            <p className="text-sm text-blue-700">
              As notificações são atualizadas automaticamente quando você recebe novas mensagens, 
              atualizações de diligências ou confirmações de pagamento.
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Notificações do Navegador</h4>
            <p className="text-sm text-green-700 mb-3">
              Receba alertas mesmo quando a aba não estiver ativa.
            </p>
            <Button 
              size="sm" 
              onClick={requestNotificationPermission}
              className="bg-green-600 hover:bg-green-700"
            >
              Habilitar Notificações
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Tipos de Notificação</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Novas diligências atribuídas</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Confirmações de pagamento</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span>Lembretes de prazo</span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-gray-600" />
                <span>Atualizações do sistema</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default NotificationCenter;