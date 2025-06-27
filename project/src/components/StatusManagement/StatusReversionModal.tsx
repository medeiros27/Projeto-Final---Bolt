import React, { useState, useEffect } from 'react';
import Modal from '../Modals/Modal';
import Button from '../UI/Button';
import { useToast } from '../UI/ToastContainer';
import { 
  RotateCcw, 
  AlertCircle, 
  CheckCircle,
  Clock,
  FileText,
  DollarSign
} from 'lucide-react';
import statusManagementService from '../../services/statusManagementService';
import { useAuth } from '../../contexts/AuthContext';

interface StatusReversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'diligence' | 'payment';
  paymentType?: 'client' | 'correspondent';
  currentStatus: string;
  onRevert: (result: any) => void;
}

const StatusReversionModal: React.FC<StatusReversionModalProps> = ({
  isOpen,
  onClose,
  entityId,
  entityType,
  paymentType,
  currentStatus,
  onRevert
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [reason, setReason] = useState('');
  const [targetStatus, setTargetStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canRevert, setCanRevert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      checkRevertPossibility();
      loadAvailableStatuses();
    }
  }, [isOpen, entityId, entityType, paymentType, user]);

  const checkRevertPossibility = async () => {
    if (!user) return;
    
    try {
      const result = await statusManagementService.canRevertStatus(
        entityId,
        entityType,
        user.role as any,
        user.id,
        paymentType
      );
      
      setCanRevert(result.possible);
      if (!result.possible) {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error('Erro ao verificar possibilidade de reversão:', error);
      setCanRevert(false);
      setErrorMessage('Erro ao verificar possibilidade de reversão');
    }
  };

  const loadAvailableStatuses = async () => {
    // Determinar os status disponíveis com base no tipo e status atual
    if (entityType === 'diligence') {
      const validTransitions: Record<string, string[]> = {
        'completed': ['in_progress'],
        'in_progress': ['assigned'],
        'assigned': ['pending'],
        'cancelled': ['pending', 'assigned', 'in_progress']
      };
      
      setAvailableStatuses(validTransitions[currentStatus] || []);
    } else {
      const validTransitions: Record<string, string[]> = {
        'paid': ['pending_verification', 'pending'],
        'pending_verification': ['pending']
      };
      
      setAvailableStatuses(validTransitions[currentStatus] || []);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!reason.trim()) {
      addToast({
        type: 'error',
        title: 'Motivo obrigatório',
        message: 'Por favor, informe o motivo da reversão'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await statusManagementService.revertStatus(
        entityId,
        entityType,
        targetStatus,
        user.id,
        reason,
        paymentType
      );
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Status revertido!',
          message: result.message
        });
        
        onRevert(result);
        onClose();
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao reverter',
          message: result.message
        });
      }
    } catch (error) {
      console.error('Erro ao reverter status:', error);
      addToast({
        type: 'error',
        title: 'Erro ao reverter',
        message: error instanceof Error ? error.message : 'Erro desconhecido ao reverter status'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusLabel = (status: string): string => {
    if (entityType === 'diligence') {
      const statusMap: Record<string, string> = {
        'pending': 'Pendente',
        'assigned': 'Atribuída',
        'in_progress': 'Em Andamento',
        'completed': 'Concluída',
        'cancelled': 'Cancelada'
      };
      return statusMap[status] || status;
    } else {
      const statusMap: Record<string, string> = {
        'pending': 'Pendente',
        'pending_verification': 'Aguardando Verificação',
        'paid': 'Pago'
      };
      return statusMap[status] || status;
    }
  };

  const getEntityDescription = () => {
    if (entityType === 'diligence') {
      return 'da diligência';
    } else {
      return paymentType === 'client' ? 'do pagamento do cliente' : 'do pagamento do correspondente';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reverter Status ${entityType === 'diligence' ? 'da Diligência' : 'do Pagamento'}`}
      size="md"
    >
      <div className="space-y-4">
        {!canRevert ? (
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Reversão não permitida</h4>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                {entityType === 'diligence' ? (
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                ) : (
                  <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                )}
                <div>
                  <h4 className="font-medium text-blue-900">Informações da Reversão</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Você está prestes a reverter o status {getEntityDescription()} de <strong>{getStatusLabel(currentStatus)}</strong>
                    {targetStatus ? ` para ${getStatusLabel(targetStatus)}` : ' para o status anterior'}.
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Esta ação será registrada no histórico do sistema.
                  </p>
                </div>
              </div>
            </div>

            {availableStatuses.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Desejado
                </label>
                <select
                  value={targetStatus || ''}
                  onChange={(e) => setTargetStatus(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Status anterior (automático)</option>
                  {availableStatuses.map(status => (
                    <option key={status} value={status}>{getStatusLabel(status)}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Selecione o status desejado ou deixe em branco para reverter automaticamente para o status anterior.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da Reversão *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descreva o motivo da reversão de status..."
                required
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Atenção</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    A reversão de status pode afetar outros processos relacionados, como pagamentos e notificações.
                    Certifique-se de que esta ação é realmente necessária.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !reason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reverter Status
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default StatusReversionModal;