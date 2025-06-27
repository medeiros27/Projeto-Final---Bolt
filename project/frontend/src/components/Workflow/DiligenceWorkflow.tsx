import React, { useState, useEffect } from 'react';
import { Diligence, User } from '../../types';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import Modal from '../Modals/Modal';
import ConfirmModal from '../Modals/ConfirmModal';
import StatusReversionModal from '../StatusManagement/StatusReversionModal';
import StatusHistoryModal from '../StatusManagement/StatusHistoryModal';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  Upload,
  MessageSquare,
  Clock,
  AlertCircle,
  DollarSign,
  RotateCcw,
  History
} from 'lucide-react';
import diligenceService from '../../services/diligenceService';
import userService from '../../services/userService';
import statusManagementService from '../../services/statusManagementService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../UI/ToastContainer';
import { formatCurrency } from '../../utils/formatters';

interface DiligenceWorkflowProps {
  diligence: Diligence;
  onUpdate: (updatedDiligence: Diligence) => void;
}

const DiligenceWorkflow: React.FC<DiligenceWorkflowProps> = ({
  diligence,
  onUpdate
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showReversionModal, setShowReversionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedCorrespondent, setSelectedCorrespondent] = useState<string>('');
  const [completionFiles, setCompletionFiles] = useState<File[]>([]);
  const [confirmAction, setConfirmAction] = useState<{
    action: string;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info' | 'success';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableCorrespondents, setAvailableCorrespondents] = useState<User[]>([]);
  const [loadingCorrespondents, setLoadingCorrespondents] = useState(false);
  const [canRevertStatus, setCanRevertStatus] = useState(false);

  // Carregar correspondentes disponíveis
  useEffect(() => {
    if (user?.role === 'admin') {
      loadCorrespondents();
    }
  }, [user, diligence.state]);

  // Verificar se o status pode ser revertido
  useEffect(() => {
    if (user) {
      checkCanRevertStatus();
    }
  }, [user, diligence]);

  const checkCanRevertStatus = async () => {
    if (!user) return;
    
    try {
      const result = await statusManagementService.canRevertStatus(
        diligence.id,
        'diligence',
        user.role as any,
        user.id
      );
      
      setCanRevertStatus(result.possible);
    } catch (error) {
      console.error('Erro ao verificar possibilidade de reversão:', error);
      setCanRevertStatus(false);
    }
  };

  const loadCorrespondents = async () => {
    try {
      setLoadingCorrespondents(true);
      const correspondents = await userService.getCorrespondents(diligence.state);
      setAvailableCorrespondents(correspondents);
    } catch (error) {
      console.error('Erro ao carregar correspondentes:', error);
    } finally {
      setLoadingCorrespondents(false);
    }
  };

  const getStatusInfo = (status: Diligence['status']) => {
    const statusMap = {
      pending: { 
        label: 'Pendente', 
        variant: 'warning' as const, 
        icon: Clock,
        description: 'Aguardando atribuição a um correspondente'
      },
      assigned: { 
        label: 'Atribuída', 
        variant: 'info' as const, 
        icon: UserPlus,
        description: 'Atribuída a um correspondente, aguardando aceite'
      },
      in_progress: { 
        label: 'Em Andamento', 
        variant: 'info' as const, 
        icon: Play,
        description: 'Sendo executada pelo correspondente'
      },
      completed: { 
        label: 'Concluída', 
        variant: 'success' as const, 
        icon: CheckCircle,
        description: 'Diligência concluída com sucesso'
      },
      cancelled: { 
        label: 'Cancelada', 
        variant: 'danger' as const, 
        icon: XCircle,
        description: 'Diligência cancelada'
      }
    };
    
    return statusMap[status];
  };

  const canUserPerformAction = (action: string): boolean => {
    if (!user) return false;

    switch (action) {
      case 'assign':
        return user.role === 'admin' && diligence.status === 'pending';
      case 'accept':
        return user.role === 'correspondent' && 
               diligence.status === 'assigned' && 
               diligence.correspondentId === user.id;
      case 'start':
        return user.role === 'correspondent' && 
               diligence.status === 'assigned' && 
               diligence.correspondentId === user.id;
      case 'complete':
        return user.role === 'correspondent' && 
               diligence.status === 'in_progress' && 
               diligence.correspondentId === user.id;
      case 'cancel':
        return (user.role === 'admin') || 
               (user.role === 'client' && diligence.clientId === user.id && diligence.status === 'pending');
      case 'revert':
        return canRevertStatus;
      case 'history':
        return user.role === 'admin';
      default:
        return false;
    }
  };

  const handleAssignDiligence = async () => {
    if (!selectedCorrespondent) {
      addToast({
        type: 'error',
        title: 'Selecione um correspondente',
        message: 'Você precisa selecionar um correspondente para atribuir a diligência'
      });
      return;
    }

    setIsLoading(true);
    try {
      const updatedDiligence = await diligenceService.assignDiligence(diligence.id, selectedCorrespondent);
      onUpdate(updatedDiligence);
      addToast({
        type: 'success',
        title: 'Diligência atribuída!',
        message: 'A diligência foi atribuída com sucesso ao correspondente.'
      });
      setShowAssignModal(false);
      setSelectedCorrespondent('');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao atribuir',
        message: 'Não foi possível atribuir a diligência. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptDiligence = async () => {
    setIsLoading(true);
    try {
      const updatedDiligence = await diligenceService.acceptDiligence(diligence.id, user!.id);
      onUpdate(updatedDiligence);
      addToast({
        type: 'success',
        title: 'Diligência aceita!',
        message: 'Você pode iniciar a execução da diligência.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao aceitar',
        message: 'Não foi possível aceitar a diligência. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDiligence = async () => {
    setIsLoading(true);
    try {
      const updatedDiligence = await diligenceService.updateDiligenceStatus(diligence.id, 'in_progress');
      onUpdate(updatedDiligence);
      addToast({
        type: 'success',
        title: 'Diligência iniciada!',
        message: 'A diligência foi iniciada com sucesso.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao iniciar',
        message: 'Não foi possível iniciar a diligência. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteDiligence = async () => {
    setIsLoading(true);
    try {
      const updatedDiligence = await diligenceService.completeDiligence(diligence.id, completionFiles);
      onUpdate(updatedDiligence);
      addToast({
        type: 'success',
        title: 'Diligência concluída!',
        message: 'A diligência foi concluída com sucesso.'
      });
      setShowCompleteModal(false);
      setCompletionFiles([]);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao concluir',
        message: 'Não foi possível concluir a diligência. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDiligence = async () => {
    setIsLoading(true);
    try {
      const updatedDiligence = await diligenceService.updateDiligenceStatus(diligence.id, 'cancelled');
      onUpdate(updatedDiligence);
      addToast({
        type: 'success',
        title: 'Diligência cancelada',
        message: 'A diligência foi cancelada com sucesso.'
      });
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao cancelar',
        message: 'Não foi possível cancelar a diligência. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertStatus = async (result: any) => {
    if (result.success) {
      // Atualizar a diligência na interface
      if (result.entity) {
        onUpdate(result.entity);
      } else {
        // Se não recebemos a entidade atualizada, recarregar a diligência
        try {
          const updatedDiligence = await diligenceService.getDiligenceById(diligence.id);
          if (updatedDiligence) {
            onUpdate(updatedDiligence);
          }
        } catch (error) {
          console.error('Erro ao recarregar diligência:', error);
        }
      }
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    switch (confirmAction.action) {
      case 'cancel':
        await handleCancelDiligence();
        break;
      default:
        break;
    }
  };

  const openConfirmModal = (action: string, title: string, message: string, type: 'danger' | 'warning' | 'info' | 'success' = 'warning') => {
    setConfirmAction({ action, title, message, type });
    setShowConfirmModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCompletionFiles(Array.from(e.target.files));
    }
  };

  const statusInfo = getStatusInfo(diligence.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-full">
            <StatusIcon className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Status da Diligência</h3>
            <p className="text-sm text-gray-600">{statusInfo.description}</p>
          </div>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      {/* Ações Disponíveis */}
      <div className="space-y-3">
        {/* Atribuir Diligência (Admin) */}
        {canUserPerformAction('assign') && (
          <Button
            onClick={() => setShowAssignModal(true)}
            className="w-full"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Atribuir a Correspondente
          </Button>
        )}

        {/* Aceitar Diligência (Correspondente) */}
        {canUserPerformAction('accept') && (
          <Button
            onClick={handleAcceptDiligence}
            disabled={isLoading}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isLoading ? 'Aceitando...' : 'Aceitar Diligência'}
          </Button>
        )}

        {/* Iniciar Diligência (Correspondente) */}
        {canUserPerformAction('start') && (
          <Button
            onClick={handleStartDiligence}
            disabled={isLoading}
            className="w-full"
          >
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? 'Iniciando...' : 'Iniciar Execução'}
          </Button>
        )}

        {/* Concluir Diligência (Correspondente) */}
        {canUserPerformAction('complete') && (
          <Button
            onClick={() => setShowCompleteModal(true)}
            variant="primary"
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Concluir Diligência
          </Button>
        )}

        {/* Reverter Status (Admin ou Correspondente) */}
        {canUserPerformAction('revert') && (
          <Button
            onClick={() => setShowReversionModal(true)}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reverter Status
          </Button>
        )}

        {/* Ver Histórico de Reversões (Admin) */}
        {canUserPerformAction('history') && (
          <Button
            onClick={() => setShowHistoryModal(true)}
            variant="outline"
            className="w-full"
          >
            <History className="h-4 w-4 mr-2" />
            Histórico de Reversões
          </Button>
        )}

        {/* Cancelar Diligência */}
        {canUserPerformAction('cancel') && (
          <Button
            onClick={() => openConfirmModal(
              'cancel',
              'Cancelar Diligência',
              'Tem certeza que deseja cancelar esta diligência? Esta ação não pode ser desfeita.',
              'danger'
            )}
            variant="danger"
            className="w-full"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar Diligência
          </Button>
        )}

        {/* Informações de Pagamento */}
        {diligence.status === 'completed' && user?.role === 'correspondent' && diligence.correspondentId === user.id && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-3">
              <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-900">Informações de Pagamento</h4>
                <p className="text-sm text-green-800 mt-1">
                  Valor a receber: <span className="font-semibold">{formatCurrency(diligence.value)}</span>
                </p>
                <p className="text-sm text-green-800">
                  Status: {diligence.paymentProof ? 
                    <span className="font-semibold text-green-700">Pagamento em processamento</span> : 
                    <span className="font-semibold text-yellow-700">Aguardando pagamento do cliente</span>
                  }
                </p>
                <p className="text-xs text-green-700 mt-2">
                  O pagamento será processado via PIX após confirmação do comprovante pelo cliente.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Atribuição */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Atribuir Diligência"
        size="md"
      >
        <div className="space-y-4">
          {loadingCorrespondents ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecionar Correspondente
                </label>
                <select
                  value={selectedCorrespondent}
                  onChange={(e) => setSelectedCorrespondent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione um correspondente</option>
                  {availableCorrespondents
                    .filter(c => c.state === diligence.state)
                    .map(correspondent => (
                      <option key={correspondent.id} value={correspondent.id}>
                        {correspondent.name} - {correspondent.city}, {correspondent.state}
                        {correspondent.oab && ` (OAB: ${correspondent.oab})`}
                      </option>
                    ))}
                </select>
                
                {availableCorrespondents.filter(c => c.state === diligence.state).length === 0 && (
                  <p className="mt-2 text-sm text-yellow-600">
                    Não há correspondentes disponíveis para o estado {diligence.state}.
                    Considere buscar correspondentes em estados próximos.
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Informações da Diligência:</p>
                    <p>Local: {diligence.city}, {diligence.state}</p>
                    <p>Valor: {formatCurrency(diligence.value)}</p>
                    <p>Prazo: {new Date(diligence.deadline).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignModal(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssignDiligence}
                  disabled={isLoading || !selectedCorrespondent}
                >
                  {isLoading ? 'Atribuindo...' : 'Atribuir'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal de Conclusão */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Concluir Diligência"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anexar Comprovantes (Opcional)
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, DOCX, JPG, PNG - Máximo 10MB por arquivo
            </p>
          </div>

          {completionFiles.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Arquivos Selecionados:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {completionFiles.map((file, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>{file.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">Ao concluir esta diligência:</p>
                <ul className="mt-1 space-y-1">
                  <li>• O cliente será notificado automaticamente</li>
                  <li>• Os comprovantes ficarão disponíveis para download</li>
                  <li>• O cliente deverá enviar o comprovante de pagamento via PIX</li>
                  <li>• Você receberá uma notificação quando o pagamento for confirmado</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCompleteModal(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCompleteDiligence}
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? 'Concluindo...' : 'Concluir Diligência'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        type={confirmAction?.type || 'warning'}
        isLoading={isLoading}
        confirmText={
          confirmAction?.action === 'cancel' 
            ? 'Cancelar Diligência' 
            : confirmAction?.action === 'revert'
              ? 'Reverter Status'
              : 'Confirmar'
        }
      />

      {/* Modal de Reversão de Status */}
      <StatusReversionModal
        isOpen={showReversionModal}
        onClose={() => setShowReversionModal(false)}
        entityId={diligence.id}
        entityType="diligence"
        currentStatus={diligence.status}
        onRevert={handleRevertStatus}
      />

      {/* Modal de Histórico de Reversões */}
      <StatusHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        entityId={diligence.id}
        entityType="diligence"
      />
    </div>
  );
};

export default DiligenceWorkflow;