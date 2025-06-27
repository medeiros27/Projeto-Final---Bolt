import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDiligences } from '../hooks/useDiligences';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import PaymentProofVerification from '../components/PaymentProof/PaymentProofVerification';
import { useToast } from '../components/UI/ToastContainer';
import { 
  DollarSign, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { PaymentProof } from '../types';
import diligenceService from '../services/diligenceService';

const PaymentManagement: React.FC = () => {
  const { user } = useAuth();
  const { diligences, refreshDiligences } = useDiligences();
  const { addToast } = useToast();
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentProofs();
  }, [diligences]);

  const loadPaymentProofs = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento de comprovantes de pagamento
      const mockProofs: PaymentProof[] = diligences
        .filter(d => d.paymentProof)
        .map(d => d.paymentProof!)
        .filter(Boolean);

      setPaymentProofs(mockProofs);
    } catch (error) {
      console.error('Erro ao carregar comprovantes:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar',
        message: 'Não foi possível carregar os comprovantes de pagamento.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (proofId: string, isApproved: boolean) => {
    try {
      // Encontrar a diligência correspondente
      const diligence = diligences.find(d => d.paymentProof?.id === proofId);
      if (!diligence) {
        throw new Error('Diligência não encontrada');
      }

      // Verificar comprovante
      await diligenceService.verifyPaymentProof(diligence.id, isApproved, user!.id);
      
      // Atualizar lista
      await refreshDiligences();
      await loadPaymentProofs();
      
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      throw error;
    }
  };

  const getPaymentStats = () => {
    const pending = paymentProofs.filter(p => p.status === 'pending_verification').length;
    const verified = paymentProofs.filter(p => p.status === 'verified').length;
    const rejected = paymentProofs.filter(p => p.status === 'rejected').length;
    const totalAmount = paymentProofs
      .filter(p => p.status === 'verified')
      .reduce((sum, p) => sum + p.amount, 0);

    return { pending, verified, rejected, totalAmount };
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
            <p className="text-gray-600">
              Esta página é exclusiva para administradores do sistema.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Carregando comprovantes de pagamento..." />
        </div>
      </div>
    );
  }

  const stats = getPaymentStats();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Pagamentos</h1>
        <p className="text-gray-600">
          Verifique comprovantes de pagamento e gerencie transações
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verificados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejeitados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Confirmado</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Comprovantes Pendentes */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Comprovantes Pendentes</h2>
          <p className="text-gray-600">
            Verifique os comprovantes enviados pelos clientes
          </p>
        </div>

        {paymentProofs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum comprovante encontrado
            </h3>
            <p className="text-gray-600">
              Não há comprovantes de pagamento pendentes de verificação.
            </p>
          </div>
        ) : (
          <PaymentProofVerification
            paymentProofs={paymentProofs}
            onVerify={handleVerifyPayment}
          />
        )}
      </Card>

      {/* Instruções */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instruções para Verificação</h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Verifique os Dados</h4>
              <p className="text-sm text-gray-600">
                Confirme se o valor no comprovante corresponde ao valor da diligência.
                Verifique também a data e hora da transação.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Aprovação</h4>
              <p className="text-sm text-gray-600">
                Ao aprovar um comprovante, o sistema automaticamente:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside ml-2 mt-1">
                <li>Marca o pagamento do cliente como concluído</li>
                <li>Notifica o correspondente sobre o pagamento</li>
                <li>Libera o valor para pagamento ao correspondente</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Rejeição</h4>
              <p className="text-sm text-gray-600">
                Ao rejeitar um comprovante, o cliente será notificado para enviar um novo comprovante.
                Informe o motivo da rejeição para que o cliente possa corrigir o problema.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentManagement;