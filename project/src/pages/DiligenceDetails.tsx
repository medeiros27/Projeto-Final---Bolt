import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Diligence } from '../types';
import diligenceService from '../services/diligenceService';
import financialService from '../services/financialService';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/Modals/Modal';
import PaymentProofUpload from '../components/PaymentProof/PaymentProofUpload';
import DiligenceWorkflow from '../components/Workflow/DiligenceWorkflow';
import PaymentStatusManager from '../components/PaymentManagement/PaymentStatusManager';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  FileText, 
  Download,
  Clock,
  Building,
  Phone,
  Mail,
  Edit,
  Trash2,
  Upload,
  CheckCircle,
  X,
  PiggyBank
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '../components/UI/ToastContainer';
import notificationService from '../services/notificationService';
import { formatCurrency } from '../utils/formatters';

const DiligenceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [diligence, setDiligence] = useState<Diligence | null>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const loadDiligence = async () => {
      if (!id) {
        setError('ID da diligência não fornecido');
        setLoading(false);
        return;
      }

      try {
        const data = await diligenceService.getDiligenceById(id);
        if (!data) {
          setError('Diligência não encontrada');
        } else {
          setDiligence(data);
          
          // Carregar dados financeiros (apenas para admin)
          if (user?.role === 'admin') {
            const finData = await financialService.getFinancialDataByDiligence(id);
            setFinancialData(finData);
          }
        }
      } catch (err) {
        setError('Erro ao carregar diligência');
      } finally {
        setLoading(false);
      }
    };

    loadDiligence();
  }, [id, user]);

  const handleUpdateDiligence = (updatedDiligence: Diligence) => {
    setDiligence(updatedDiligence);
  };

  const handleUpdateFinancialData = async () => {
    if (!id || user?.role !== 'admin') return;
    
    try {
      const finData = await financialService.getFinancialDataByDiligence(id);
      setFinancialData(finData);
    } catch (error) {
      console.error('Erro ao atualizar dados financeiros:', error);
    }
  };

  const handleEditDiligence = () => {
    if (!diligence) return;
    
    // Redirecionar para a página de edição apropriada com base no perfil do usuário
    if (user?.role === 'admin') {
      navigate(`/diligences/${id}/edit`);
    } else if (user?.role === 'client') {
      navigate(`/my-diligences/${id}/edit`);
    }
  };

  const handleDeleteDiligence = async () => {
    if (!diligence || !window.confirm('Tem certeza que deseja excluir esta diligência?')) {
      return;
    }

    try {
      await diligenceService.deleteDiligence(diligence.id);
      addToast({
        type: 'success',
        title: 'Diligência excluída!',
        message: 'A diligência foi excluída com sucesso.'
      });
      
      // Redirecionar para a página apropriada com base no perfil do usuário
      if (user?.role === 'admin') {
        navigate('/diligences');
      } else {
        navigate('/my-diligences');
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao excluir',
        message: 'Não foi possível excluir a diligência. Tente novamente.'
      });
    }
  };

  const handleSubmitPaymentProof = async (pixKey: string, proofImage: File) => {
    if (!diligence || !user) {
      addToast({
        type: 'error',
        title: 'Erro ao enviar',
        message: 'Erro ao enviar comprovante'
      });
      return false;
    }

    try {
      const updatedDiligence = await diligenceService.submitPaymentProof(
        diligence.id,
        pixKey,
        proofImage,
        user.id
      );
      
      setDiligence(updatedDiligence);
      
      // Notificar administrador sobre novo comprovante
      await notificationService.createNotification({
        userId: '1', // ID do admin
        type: 'payment_received',
        title: 'Novo Comprovante de Pagamento',
        message: `Cliente enviou comprovante para a diligência "${diligence.title}"`,
        data: { diligenceId: diligence.id }
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao enviar comprovante:', error);
      throw error;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: 'warning' as const, label: 'Pendente' },
      assigned: { variant: 'info' as const, label: 'Atribuída' },
      in_progress: { variant: 'info' as const, label: 'Em Andamento' },
      completed: { variant: 'success' as const, label: 'Concluída' },
      cancelled: { variant: 'danger' as const, label: 'Cancelada' }
    };
    
    return statusMap[status as keyof typeof statusMap] || { variant: 'default' as const, label: status };
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { variant: 'default' as const, label: 'Baixa' },
      medium: { variant: 'warning' as const, label: 'Média' },
      high: { variant: 'danger' as const, label: 'Alta' },
      urgent: { variant: 'danger' as const, label: 'Urgente' }
    };
    
    return priorityMap[priority as keyof typeof priorityMap] || { variant: 'default' as const, label: priority };
  };

  const canUserEdit = (): boolean => {
    if (!user || !diligence) return false;
    
    // Administrador pode editar qualquer diligência
    if (user.role === 'admin') return true;
    
    // Cliente só pode editar suas próprias diligências pendentes
    if (user.role === 'client') {
      return diligence.clientId === user.id && diligence.status === 'pending';
    }
    
    return false;
  };

  const canUserDelete = (): boolean => {
    if (!user || !diligence) return false;
    
    // Administrador pode excluir qualquer diligência
    if (user.role === 'admin') return true;
    
    // Cliente só pode excluir suas próprias diligências pendentes
    if (user.role === 'client') {
      return diligence.clientId === user.id && diligence.status === 'pending';
    }
    
    return false;
  };

  const canMakePayment = (): boolean => {
    if (!user || !diligence) return false;
    
    return (
      user.role === 'client' && 
      diligence.clientId === user.id && 
      diligence.status === 'completed' &&
      !diligence.paymentProof
    );
  };

  const downloadAttachment = (attachment: any) => {
    // Em produção, isso seria uma URL real do servidor
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    link.click();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !diligence) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Diligência não encontrada'}
            </h3>
            <Button onClick={() => navigate('/diligences')}>
              Voltar para Diligências
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const status = getStatusBadge(diligence.status);
  const priority = getPriorityBadge(diligence.priority);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex space-x-2">
            {canMakePayment() && (
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Efetuar Pagamento
              </Button>
            )}
            
            {canUserEdit() && (
              <Button
                variant="outline"
                onClick={handleEditDiligence}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            
            {canUserDelete() && (
              <Button
                variant="danger"
                onClick={handleDeleteDiligence}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{diligence.title}</h1>
            <div className="flex items-center space-x-3">
              <Badge variant={status.variant}>{status.label}</Badge>
              <Badge variant={priority.variant}>{priority.label}</Badge>
              <span className="text-sm text-gray-500">
                Criada em {format(new Date(diligence.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(diligence.value)}
            </div>
            <div className="text-sm text-gray-500">Valor da diligência</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Gerais */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Diligência</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Tipo de Diligência</h3>
                <p className="text-gray-900">{diligence.type}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Descrição</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{diligence.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <span className="text-sm text-gray-600">Data/Prazo: </span>
                    <span className="font-medium">
                      {format(new Date(diligence.deadline), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <span className="text-sm text-gray-600">Local: </span>
                    <span className="font-medium">{diligence.city}, {diligence.state}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Informações Financeiras - APENAS PARA ADMIN */}
          {user?.role === 'admin' && financialData && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações Financeiras</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <h3 className="font-medium text-gray-900">Faturado</h3>
                  </div>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(financialData.faturado)}</p>
                  <p className="text-xs text-gray-500 mt-1">Valor cobrado do cliente</p>
                </div>
                
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="h-4 w-4 text-red-600" />
                    <h3 className="font-medium text-gray-900">Custo</h3>
                  </div>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(financialData.custo)}</p>
                  <p className="text-xs text-gray-500 mt-1">Valor do correspondente</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <PiggyBank className="h-4 w-4 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Lucro</h3>
                  </div>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(financialData.lucro)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Margem: {financialData.faturado > 0 
                      ? ((financialData.lucro / financialData.faturado) * 100).toFixed(1) 
                      : 0}%
                  </p>
                </div>
              </div>
              
              {/* Componente de Gestão de Status de Pagamento */}
              <div className="mt-6">
                <PaymentStatusManager 
                  diligenceId={diligence.id}
                  financialData={financialData}
                  onUpdate={handleUpdateFinancialData}
                />
              </div>
            </Card>
          )}

          {/* Status de Pagamento */}
          {diligence.paymentProof && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Status do Pagamento</h2>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Comprovante Enviado</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Chave PIX: {diligence.paymentProof.pixKey}
                  </p>
                  <p className="text-sm text-gray-600">
                    Valor: {formatCurrency(diligence.paymentProof.amount)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Enviado em {format(new Date(diligence.paymentProof.uploadedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                  <Badge 
                    variant={diligence.paymentProof.status === 'verified' ? 'success' : 'warning'}
                    className="mt-2"
                  >
                    {diligence.paymentProof.status === 'verified' ? 'Verificado' : 'Aguardando Verificação'}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Participantes */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Participantes</h2>
            
            <div className="space-y-4">
              {/* Cliente */}
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Cliente</h3>
                  <p className="text-gray-700">{diligence.client.name}</p>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {diligence.client.email}
                    </div>
                    {diligence.client.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {diligence.client.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Correspondente - VISÍVEL APENAS PARA ADMIN */}
              {user?.role === 'admin' && diligence.correspondent && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Correspondente</h3>
                    <p className="text-gray-700">{diligence.correspondent.name}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {diligence.correspondent.email}
                      </div>
                      {diligence.correspondent.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {diligence.correspondent.phone}
                        </div>
                      )}
                      {diligence.correspondent.oab && (
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          OAB: {diligence.correspondent.oab}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Correspondente - VISÍVEL APENAS PARA CORRESPONDENTE (PRÓPRIO) */}
              {user?.role === 'correspondent' && diligence.correspondent && 
               user.id === diligence.correspondent.id && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Correspondente</h3>
                    <p className="text-gray-700">{diligence.correspondent.name}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {diligence.correspondent.email}
                      </div>
                      {diligence.correspondent.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {diligence.correspondent.phone}
                        </div>
                      )}
                      {diligence.correspondent.oab && (
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          OAB: {diligence.correspondent.oab}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Mensagem para cliente quando há correspondente atribuído */}
              {user?.role === 'client' && diligence.correspondent && (
                <div className="flex items-center justify-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <CheckCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-blue-800 font-medium">Correspondente atribuído</p>
                    <p className="text-sm text-blue-600">
                      Um correspondente qualificado está cuidando da sua diligência
                    </p>
                  </div>
                </div>
              )}

              {/* Sem correspondente */}
              {!diligence.correspondent && (
                <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Nenhum correspondente atribuído</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Anexos */}
          {diligence.attachments.length > 0 && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Anexos</h2>
              
              <div className="space-y-3">
                {diligence.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-sm text-gray-500">
                          {(attachment.size / 1024 / 1024).toFixed(2)} MB • 
                          Enviado em {format(new Date(attachment.uploadedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAttachment(attachment)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Histórico de Atividades */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Histórico de Atividades</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900">Diligência criada</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(diligence.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              {diligence.status !== 'pending' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900">Status atualizado para: {status.label}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(diligence.updatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}

              {diligence.paymentProof && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900">Comprovante de pagamento enviado</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(diligence.paymentProof.uploadedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workflow */}
          <DiligenceWorkflow
            diligence={diligence}
            onUpdate={handleUpdateDiligence}
          />

          {/* Informações Rápidas */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Prioridade:</span>
                <Badge variant={priority.variant}>{priority.label}</Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Valor:</span>
                <span className="font-medium text-green-600">{formatCurrency(diligence.value)}</span>
              </div>
              
              {/* Valor do correspondente - APENAS PARA ADMIN */}
              {user?.role === 'admin' && financialData && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor do Correspondente:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(financialData.custo)}</span>
                </div>
              )}
              
              {/* Lucro - APENAS PARA ADMIN */}
              {user?.role === 'admin' && financialData && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Lucro:</span>
                  <span className="font-medium text-purple-600">{formatCurrency(financialData.lucro)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Prazo:</span>
                <span className="font-medium">
                  {format(new Date(diligence.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Local:</span>
                <span className="font-medium">{diligence.city}, {diligence.state}</span>
              </div>
            </div>
          </Card>

          {/* Tempo Restante */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tempo Restante</h3>
            
            <div className="text-center">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              {(() => {
                const now = new Date();
                const deadline = new Date(diligence.deadline);
                const diffTime = deadline.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays < 0) {
                  return (
                    <div>
                      <p className="text-2xl font-bold text-red-600">Vencido</p>
                      <p className="text-sm text-gray-500">
                        {Math.abs(diffDays)} dia(s) em atraso
                      </p>
                    </div>
                  );
                } else if (diffDays === 0) {
                  return (
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">Hoje</p>
                      <p className="text-sm text-gray-500">Prazo vence hoje</p>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <p className="text-2xl font-bold text-green-600">{diffDays}</p>
                      <p className="text-sm text-gray-500">
                        dia(s) restante(s)
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Pagamento */}
      <PaymentProofUpload
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        diligenceTitle={diligence.title}
        amount={diligence.value}
        onSubmit={handleSubmitPaymentProof}
      />
    </div>
  );
};

export default DiligenceDetails;