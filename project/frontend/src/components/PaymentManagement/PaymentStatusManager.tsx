import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import StatusReversionModal from '../StatusManagement/StatusReversionModal';
import StatusHistoryModal from '../StatusManagement/StatusHistoryModal';
import { 
  DollarSign, 
  RotateCcw, 
  History,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../UI/ToastContainer';
import statusManagementService from '../../services/statusManagementService';
import financialService from '../../services/financialService';
import { formatCurrency } from '../../utils/formatters';

interface PaymentStatusManagerProps {
  diligenceId: string;
  financialData: any;
  onUpdate: () => void;
}

const PaymentStatusManager: React.FC<PaymentStatusManagerProps> = ({
  diligenceId,
  financialData,
  onUpdate
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showClientReversionModal, setShowClientReversionModal] = useState(false);
  const [showCorrespondentReversionModal, setShowCorrespondentReversionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [canRevertClientPayment, setCanRevertClientPayment] = useState(false);
  const [canRevertCorrespondentPayment, setCanRevertCorrespondentPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      checkRevertPossibility();
    }
  }, [user, financialData]);

  const checkRevertPossibility = async () => {
    if (!user || user.role !== 'admin') return;
    
    try {
      // Verificar se o pagamento do cliente pode ser revertido
      const clientResult = await statusManagementService.canRevertStatus(
        diligenceId,
        'payment',
        'admin',
        user.id,
        'client'
      );
      setCanRevertClientPayment(clientResult.possible);
      
      // Verificar se o pagamento do correspondente pode ser revertido
      const correspondentResult = await statusManagementService.canRevertStatus(
        diligenceId,
        'payment',
        'admin',
        user.id,
        'correspondent'
      );
      setCanRevertCorrespondentPayment(correspondentResult.possible);
    } catch (error) {
      console.error('Erro ao verificar possibilidade de reversão:', error);
    }
  };

  const handleMarkAsPaid = async (type: 'client' | 'correspondent') => {
    setIsLoading(true);
    try {
      if (type === 'client') {
        await financialService.markClientPaymentAsPaid(diligenceId);
        addToast({
          type: 'success',
          title: 'Pagamento registrado!',
          message: 'O pagamento do cliente foi registrado com sucesso.'
        });
      } else {
        await financialService.markCorrespondentPaymentAsPaid(diligenceId);
        addToast({
          type: 'success',
          title: 'Pagamento registrado!',
          message: 'O pagamento ao correspondente foi registrado com sucesso.'
        });
      }
      onUpdate();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao registrar',
        message: 'Não foi possível registrar o pagamento. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertStatus = async (result: any) => {
    if (result.success) {
      onUpdate();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>;
      case 'pending_verification':
        return <Badge variant="info">Aguardando Verificação</Badge>;
      case 'paid':
        return <Badge variant="success">Pago</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (!financialData) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Gestão de Pagamentos</h3>
      
      {/* Pagamento do Cliente */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Pagamento do Cliente</h4>
              <p className="text-sm text-gray-600 mt-1">
                Valor: <span className="font-semibold">{formatCurrency(financialData.faturado)}</span>
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600 mr-2">Status:</span>
                {getStatusBadge(financialData.clientPaymentStatus)}
              </div>
              {financialData.clientPaymentDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Data: {new Date(financialData.clientPaymentDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            {user?.role === 'admin' && financialData.clientPaymentStatus === 'pending' && (
              <Button
                size="sm"
                onClick={() => handleMarkAsPaid('client')}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Marcar como Pago
              </Button>
            )}
            
            {user?.role === 'admin' && canRevertClientPayment && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClientReversionModal(true)}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reverter Status
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Pagamento do Correspondente */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Pagamento ao Correspondente</h4>
              <p className="text-sm text-gray-600 mt-1">
                Valor: <span className="font-semibold">{formatCurrency(financialData.custo)}</span>
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600 mr-2">Status:</span>
                {getStatusBadge(financialData.correspondentPaymentStatus)}
              </div>
              {financialData.correspondentPaymentDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Data: {new Date(financialData.correspondentPaymentDate).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            {user?.role === 'admin' && 
             financialData.correspondentPaymentStatus === 'pending' && 
             financialData.clientPaymentStatus === 'paid' && (
              <Button
                size="sm"
                onClick={() => handleMarkAsPaid('correspondent')}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Marcar como Pago
              </Button>
            )}
            
            {user?.role === 'admin' && 
             financialData.clientPaymentStatus !== 'paid' && 
             financialData.correspondentPaymentStatus === 'pending' && (
              <div className="flex items-center text-xs text-yellow-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Aguardando pagamento do cliente
              </div>
            )}
            
            {user?.role === 'admin' && canRevertCorrespondentPayment && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCorrespondentReversionModal(true)}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reverter Status
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Botão de Histórico */}
      {user?.role === 'admin' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistoryModal(true)}
          className="mt-2"
        >
          <History className="h-4 w-4 mr-1" />
          Ver Histórico de Reversões
        </Button>
      )}

      {/* Modais de Reversão */}
      <StatusReversionModal
        isOpen={showClientReversionModal}
        onClose={() => setShowClientReversionModal(false)}
        entityId={diligenceId}
        entityType="payment"
        paymentType="client"
        currentStatus={financialData.clientPaymentStatus}
        onRevert={handleRevertStatus}
      />
      
      <StatusReversionModal
        isOpen={showCorrespondentReversionModal}
        onClose={() => setShowCorrespondentReversionModal(false)}
        entityId={diligenceId}
        entityType="payment"
        paymentType="correspondent"
        currentStatus={financialData.correspondentPaymentStatus}
        onRevert={handleRevertStatus}
      />
      
      <StatusHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        entityId={diligenceId}
        entityType="payment"
      />
    </div>
  );
};

export default PaymentStatusManager;