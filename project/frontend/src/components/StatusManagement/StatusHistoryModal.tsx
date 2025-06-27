import React, { useState, useEffect } from 'react';
import Modal from '../Modals/Modal';
import Badge from '../UI/Badge';
import { 
  Clock, 
  User, 
  FileText, 
  DollarSign,
  RotateCcw
} from 'lucide-react';
import statusManagementService from '../../services/statusManagementService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StatusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string;
  entityType: 'diligence' | 'payment';
}

const StatusHistoryModal: React.FC<StatusHistoryModalProps> = ({
  isOpen,
  onClose,
  entityId,
  entityType
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, entityId, entityType]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const reversions = await statusManagementService.getReversionHistory(entityId, entityType);
      const formattedHistory = statusManagementService.formatReversionHistory(reversions);
      setHistory(formattedHistory);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: string) => {
    if (type === 'Diligência') {
      const statusMap: Record<string, { variant: 'warning' | 'info' | 'success' | 'danger' | 'default' }> = {
        'Pendente': { variant: 'warning' },
        'Atribuída': { variant: 'info' },
        'Em Andamento': { variant: 'info' },
        'Concluída': { variant: 'success' },
        'Cancelada': { variant: 'danger' }
      };
      return statusMap[status] || { variant: 'default' };
    } else {
      const statusMap: Record<string, { variant: 'warning' | 'info' | 'success' | 'danger' | 'default' }> = {
        'Pendente': { variant: 'warning' },
        'Aguardando Verificação': { variant: 'info' },
        'Pago': { variant: 'success' }
      };
      return statusMap[status] || { variant: 'default' };
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Histórico de Reversões ${entityType === 'diligence' ? 'da Diligência' : 'do Pagamento'}`}
      size="lg"
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma reversão de status encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {item.type === 'Diligência' ? (
                      <FileText className="h-5 w-5 text-gray-600" />
                    ) : (
                      <DollarSign className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Reversão de {item.type}</h4>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">{item.date}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-600">De:</p>
                        <Badge variant={getStatusBadge(item.from, item.type).variant}>
                          {item.from}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Para:</p>
                        <Badge variant={getStatusBadge(item.to, item.type).variant}>
                          {item.to}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Motivo:</p>
                      <p className="text-sm text-gray-900 mt-1">{item.reason}</p>
                    </div>
                    
                    <div className="mt-2 flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        Realizado por: {item.userId === '1' ? 'Administrador' : `Usuário ${item.userId}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default StatusHistoryModal;