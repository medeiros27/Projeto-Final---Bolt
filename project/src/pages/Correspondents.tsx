import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCorrespondents, usePendingCorrespondents } from '../hooks/useUsers';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/Modals/Modal';
import ConfirmModal from '../components/Modals/ConfirmModal';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Star,
  MapPin,
  Phone,
  Mail,
  FileText,
  Calendar,
  Award,
  TrendingUp,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import userService from '../services/userService';

const Correspondents: React.FC = () => {
  const navigate = useNavigate();
  const { correspondents, loading, error, refreshCorrespondents } = useCorrespondents();
  const { pendingCorrespondents, refreshPendingCorrespondents } = usePendingCorrespondents();
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedCorrespondent, setSelectedCorrespondent] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'approve' | 'reject';
    correspondent: any;
    title: string;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Mock data para performance
  const getPerformanceData = (correspondentId: string) => ({
    totalDiligences: Math.floor(Math.random() * 50) + 10,
    completedDiligences: Math.floor(Math.random() * 45) + 8,
    averageRating: (Math.random() * 2 + 3).toFixed(1),
    onTimeDelivery: Math.floor(Math.random() * 30) + 70,
    totalEarnings: (Math.random() * 10000 + 5000).toFixed(2),
    recentActivities: [
      { date: '2024-12-20', activity: 'Diligência concluída - Citação Trabalhista' },
      { date: '2024-12-18', activity: 'Diligência aceita - Preposto Cível' },
      { date: '2024-12-15', activity: 'Avaliação recebida - 5 estrelas' }
    ]
  });

  const handleApproveCorrespondent = async () => {
    if (!confirmAction || confirmAction.type !== 'approve') return;

    setIsLoading(true);
    try {
      await userService.approveCorrespondent(confirmAction.correspondent.id);
      toast.success('Correspondente aprovado com sucesso!');
      refreshCorrespondents();
      refreshPendingCorrespondents();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      toast.error('Erro ao aprovar correspondente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectCorrespondent = async () => {
    if (!confirmAction || confirmAction.type !== 'reject') return;

    setIsLoading(true);
    try {
      await userService.rejectCorrespondent(confirmAction.correspondent.id);
      toast.success('Correspondente rejeitado');
      refreshPendingCorrespondents();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      toast.error('Erro ao rejeitar correspondente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case 'approve':
        await handleApproveCorrespondent();
        break;
      case 'reject':
        await handleRejectCorrespondent();
        break;
    }
  };

  const openConfirmModal = (type: 'approve' | 'reject', correspondent: any) => {
    const actions = {
      approve: {
        title: 'Aprovar Correspondente',
        message: `Tem certeza que deseja aprovar o correspondente "${correspondent.name}"? Ele poderá receber diligências após a aprovação.`
      },
      reject: {
        title: 'Rejeitar Correspondente',
        message: `Tem certeza que deseja rejeitar o correspondente "${correspondent.name}"? O cadastro será removido do sistema.`
      }
    };

    setConfirmAction({
      type,
      correspondent,
      ...actions[type]
    });
    setShowConfirmModal(true);
  };

  const showPerformance = (correspondent: any) => {
    setSelectedCorrespondent(correspondent);
    setShowPerformanceModal(true);
  };

  const filteredCorrespondents = correspondents.filter(correspondent => {
    const matchesSearch = correspondent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         correspondent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         correspondent.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = stateFilter === 'all' || correspondent.state === stateFilter;
    
    return matchesSearch && matchesState;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar correspondentes</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refreshCorrespondents}>Tentar Novamente</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Correspondentes</h1>
          <p className="text-gray-600">Gerencie correspondentes jurídicos e suas atividades</p>
        </div>
        <Button onClick={() => navigate('/users/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Correspondente
        </Button>
      </div>

      {/* Correspondentes Pendentes */}
      {pendingCorrespondents.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-yellow-800">
              Correspondentes Pendentes de Aprovação ({pendingCorrespondents.length})
            </h2>
          </div>
          
          <div className="space-y-3">
            {pendingCorrespondents.map((correspondent) => (
              <div key={correspondent.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {correspondent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{correspondent.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{correspondent.email}</span>
                      <span>OAB: {correspondent.oab}</span>
                      <span>{correspondent.city}, {correspondent.state}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openConfirmModal('approve', correspondent)}
                  >
                    <UserCheck className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => openConfirmModal('reject', correspondent)}
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar correspondentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os Estados</option>
              {brazilianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Correspondentes */}
      <div className="grid gap-6">
        {filteredCorrespondents.map((correspondent) => {
          const performance = getPerformanceData(correspondent.id);
          
          return (
            <Card key={correspondent.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {correspondent.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{correspondent.name}</h3>
                      <Badge variant="success">Ativo</Badge>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{performance.averageRating}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{correspondent.email}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{correspondent.phone}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{correspondent.city}, {correspondent.state}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>OAB: {correspondent.oab}</span>
                      </div>
                    </div>

                    {/* Métricas de Performance */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-semibold text-blue-600">{performance.totalDiligences}</div>
                        <div className="text-gray-600">Diligências</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-semibold text-green-600">{performance.onTimeDelivery}%</div>
                        <div className="text-gray-600">No Prazo</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="font-semibold text-yellow-600">{performance.averageRating}</div>
                        <div className="text-gray-600">Avaliação</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="font-semibold text-purple-600">R$ {performance.totalEarnings}</div>
                        <div className="text-gray-600">Ganhos</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showPerformance(correspondent)}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Performance
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredCorrespondents.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum correspondente encontrado</h3>
            <p className="text-gray-600 mb-4">
              {correspondents.length === 0 
                ? 'Ainda não há correspondentes cadastrados.' 
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        </Card>
      )}

      {/* Modal de Performance */}
      <Modal
        isOpen={showPerformanceModal}
        onClose={() => setShowPerformanceModal(false)}
        title={`Performance - ${selectedCorrespondent?.name}`}
        size="lg"
      >
        {selectedCorrespondent && (
          <div className="space-y-6">
            {/* Métricas Principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {getPerformanceData(selectedCorrespondent.id).totalDiligences}
                </div>
                <div className="text-sm text-gray-600">Total de Diligências</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {getPerformanceData(selectedCorrespondent.id).completedDiligences}
                </div>
                <div className="text-sm text-gray-600">Concluídas</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {getPerformanceData(selectedCorrespondent.id).averageRating}
                </div>
                <div className="text-sm text-gray-600">Avaliação Média</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {getPerformanceData(selectedCorrespondent.id).onTimeDelivery}%
                </div>
                <div className="text-sm text-gray-600">Entrega no Prazo</div>
              </div>
            </div>

            {/* Atividades Recentes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Atividades Recentes</h3>
              <div className="space-y-3">
                {getPerformanceData(selectedCorrespondent.id).recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(activity.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Avaliações */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Avaliações</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center space-x-3">
                    <span className="text-sm w-8">{rating}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${Math.random() * 80 + 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{Math.floor(Math.random() * 20)}</span>
                  </div>
                ))}
              </div>
            </div>
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
        onConfirm={handleConfirmAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        type={confirmAction?.type === 'approve' ? 'success' : 'danger'}
        isLoading={isLoading}
        confirmText={confirmAction?.type === 'approve' ? 'Aprovar' : 'Rejeitar'}
      />
    </div>
  );
};

export default Correspondents;