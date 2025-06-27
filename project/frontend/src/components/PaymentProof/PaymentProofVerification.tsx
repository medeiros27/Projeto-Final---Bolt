import React, { useState } from 'react';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import Modal from '../Modals/Modal';
import ConfirmModal from '../Modals/ConfirmModal';
import { useToast } from '../UI/ToastContainer';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  DollarSign,
  Calendar,
  User,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';
import { PaymentProof } from '../../types';

interface PaymentProofVerificationProps {
  paymentProofs: PaymentProof[];
  onVerify: (proofId: string, isApproved: boolean) => Promise<void>;
}

const PaymentProofVerification: React.FC<PaymentProofVerificationProps> = ({
  paymentProofs,
  onVerify
}) => {
  const { addToast } = useToast();
  const [selectedProof, setSelectedProof] = useState<PaymentProof | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    proofId: string;
    isApproval: boolean;
    title: string;
    message: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const pendingProofs = paymentProofs.filter(proof => proof.status === 'pending_verification');

  const handleVerifyClick = (proof: PaymentProof, isApproval: boolean) => {
    setConfirmAction({
      proofId: proof.id,
      isApproval,
      title: isApproval ? 'Aprovar Comprovante' : 'Rejeitar Comprovante',
      message: isApproval 
        ? `Tem certeza que deseja aprovar este comprovante de ${formatCurrency(proof.amount)}?`
        : `Tem certeza que deseja rejeitar este comprovante? O cliente precisará enviar um novo comprovante.`
    });
    setShowConfirmModal(true);
  };

  const handleConfirmVerification = async () => {
    if (!confirmAction) return;

    setIsProcessing(true);
    
    try {
      await onVerify(confirmAction.proofId, confirmAction.isApproval);
      
      addToast({
        type: confirmAction.isApproval ? 'success' : 'warning',
        title: confirmAction.isApproval ? 'Comprovante aprovado!' : 'Comprovante rejeitado',
        message: confirmAction.isApproval 
          ? 'O pagamento foi confirmado e o correspondente será notificado.'
          : 'O cliente foi notificado para enviar um novo comprovante.'
      });
      
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro na verificação',
        message: 'Ocorreu um erro ao processar a verificação. Tente novamente.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const viewProofImage = (proof: PaymentProof) => {
    setSelectedProof(proof);
    setShowImageModal(true);
  };

  const getStatusBadge = (status: PaymentProof['status']) => {
    switch (status) {
      case 'pending_verification':
        return <Badge variant="warning">Aguardando Verificação</Badge>;
      case 'verified':
        return <Badge variant="success">Verificado</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejeitado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (pendingProofs.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum comprovante pendente
        </h3>
        <p className="text-gray-600">
          Todos os comprovantes foram verificados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Comprovantes Pendentes de Verificação
        </h3>
        <Badge variant="warning">{pendingProofs.length}</Badge>
      </div>

      <div className="space-y-4">
        {pendingProofs.map((proof) => (
          <div key={proof.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Comprovante de Pagamento
                    </h4>
                    <p className="text-sm text-gray-600">
                      Diligência ID: {proof.diligenceId}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-medium">{formatCurrency(proof.amount)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Chave PIX:</span>
                    <span className="font-medium">{proof.pixKey}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Enviado em:</span>
                    <span className="font-medium">
                      {format(new Date(proof.uploadedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(proof.status)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewProofImage(proof)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver Comprovante
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleVerifyClick(proof, true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleVerifyClick(proof, false)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para visualizar imagem */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Comprovante de Pagamento"
        size="lg"
      >
        {selectedProof && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Valor:</span>
                  <span className="ml-2 font-medium">{formatCurrency(selectedProof.amount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Chave PIX:</span>
                  <span className="ml-2 font-medium">{selectedProof.pixKey}</span>
                </div>
                <div>
                  <span className="text-gray-600">Enviado em:</span>
                  <span className="ml-2 font-medium">
                    {format(new Date(selectedProof.uploadedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2">{getStatusBadge(selectedProof.status)}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <img
                src={selectedProof.proofImage}
                alt="Comprovante de pagamento"
                className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW0gbsOjbyBlbmNvbnRyYWRhPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            </div>

            {selectedProof.status === 'pending_verification' && (
              <div className="flex justify-center space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowImageModal(false);
                    handleVerifyClick(selectedProof, true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar Comprovante
                </Button>
                
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowImageModal(false);
                    handleVerifyClick(selectedProof, false);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar Comprovante
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmVerification}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        type={confirmAction?.isApproval ? 'success' : 'danger'}
        isLoading={isProcessing}
        confirmText={confirmAction?.isApproval ? 'Aprovar' : 'Rejeitar'}
      />
    </div>
  );
};

export default PaymentProofVerification;