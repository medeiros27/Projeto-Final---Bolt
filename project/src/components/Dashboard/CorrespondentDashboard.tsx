import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDiligences, useAvailableDiligences } from '../../hooks/useDiligences';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import LoadingSpinner from '../UI/LoadingSpinner';
import StatsCard from './StatsCard';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Star,
  Award,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';

interface PerformanceMetrics {
  totalDiligences: number;
  completedDiligences: number;
  averageRating: number;
  onTimeDelivery: number;
  totalEarnings: number;
  monthlyEarnings: number;
  completionRate: number;
  responseTime: number;
}

const CorrespondentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { diligences: myDiligences, loading: myLoading } = useDiligences();
  const { diligences: availableDiligences, loading: availableLoading } = useAvailableDiligences(
    user?.state, 
    user?.city
  );

  // Mock performance metrics
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalDiligences: 0,
    completedDiligences: 0,
    averageRating: 0,
    onTimeDelivery: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    completionRate: 0,
    responseTime: 0
  });

  useEffect(() => {
    // Calculate real metrics from diligences
    const completed = myDiligences.filter(d => d.status === 'completed');
    const inProgress = myDiligences.filter(d => d.status === 'in_progress');
    const total = myDiligences.length;

    // Mock some additional metrics
    const mockMetrics: PerformanceMetrics = {
      totalDiligences: total,
      completedDiligences: completed.length,
      averageRating: 4.7 + Math.random() * 0.3,
      onTimeDelivery: Math.floor(85 + Math.random() * 15),
      totalEarnings: completed.reduce((sum, d) => sum + d.value, 0),
      monthlyEarnings: completed
        .filter(d => new Date(d.updatedAt).getMonth() === new Date().getMonth())
        .reduce((sum, d) => sum + d.value, 0),
      completionRate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
      responseTime: Math.floor(2 + Math.random() * 4) // hours
    };

    setMetrics(mockMetrics);
  }, [myDiligences]);

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

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} dia(s) em atraso`, color: 'text-red-600', urgent: true };
    } else if (diffDays === 0) {
      return { text: 'Vence hoje', color: 'text-yellow-600', urgent: true };
    } else if (diffDays <= 2) {
      return { text: `${diffDays} dia(s) restante(s)`, color: 'text-yellow-600', urgent: true };
    } else {
      return { text: `${diffDays} dia(s) restante(s)`, color: 'text-green-600', urgent: false };
    }
  };

  const urgentDiligences = myDiligences.filter(d => 
    d.status === 'in_progress' && getTimeRemaining(d.deadline).urgent
  );

  const recentAvailable = availableDiligences
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (myLoading || availableLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Carregando dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Bem-vindo, {user?.name}!
            </h2>
            <p className="text-blue-100">
              {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className="text-blue-100 mt-1">
              {user?.city}, {user?.state} • OAB: {user?.oab}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="h-5 w-5 text-yellow-300" />
              <span className="text-xl font-bold">{metrics.averageRating.toFixed(1)}</span>
            </div>
            <p className="text-blue-100 text-sm">Avaliação média</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Diligências Ativas"
          value={myDiligences.filter(d => ['assigned', 'in_progress'].includes(d.status)).length}
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Taxa de Conclusão"
          value={`${metrics.completionRate}%`}
          icon={Target}
          color="green"
        />
        <StatsCard
          title="Ganhos do Mês"
          value={formatCurrency(metrics.monthlyEarnings)}
          icon={DollarSign}
          color="purple"
        />
        <StatsCard
          title="Entrega no Prazo"
          value={`${metrics.onTimeDelivery}%`}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => navigate('/available-diligences')}
            className="h-20 flex flex-col items-center justify-center"
          >
            <FileText className="h-6 w-6 mb-2" />
            Ver Diligências Disponíveis
            <span className="text-xs opacity-75">
              {availableDiligences.length} disponível(is)
            </span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/my-diligences')}
            className="h-20 flex flex-col items-center justify-center"
          >
            <Clock className="h-6 w-6 mb-2" />
            Minhas Diligências
            <span className="text-xs opacity-75">
              {myDiligences.length} total
            </span>
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/financial')}
            className="h-20 flex flex-col items-center justify-center"
          >
            <DollarSign className="h-6 w-6 mb-2" />
            Financeiro
            <span className="text-xs opacity-75">
              {formatCurrency(metrics.totalEarnings)} total
            </span>
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Diligences */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Diligências Urgentes</h3>
            {urgentDiligences.length > 0 && (
              <Badge variant="danger">{urgentDiligences.length}</Badge>
            )}
          </div>
          
          {urgentDiligences.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma diligência urgente</p>
              <p className="text-sm text-gray-500">Você está em dia com seus prazos!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentDiligences.slice(0, 3).map((diligence) => {
                const status = getStatusBadge(diligence.status);
                const timeRemaining = getTimeRemaining(diligence.deadline);
                
                return (
                  <div key={diligence.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{diligence.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{diligence.client.name}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <span className={`text-xs ${timeRemaining.color}`}>
                            {timeRemaining.text}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(diligence.value)}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/my-diligences/${diligence.id}`)}
                          className="mt-2"
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {urgentDiligences.length > 3 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/my-diligences')}
                  className="w-full"
                >
                  Ver todas ({urgentDiligences.length})
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Recent Available Diligences */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Novas Oportunidades</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/available-diligences')}
            >
              Ver Todas
            </Button>
          </div>
          
          {recentAvailable.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma nova diligência</p>
              <p className="text-sm text-gray-500">Verifique novamente mais tarde</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAvailable.map((diligence) => {
                const priority = getPriorityBadge(diligence.priority);
                
                return (
                  <div key={diligence.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{diligence.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{diligence.city}, {diligence.state}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={priority.variant}>{priority.label}</Badge>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(diligence.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{formatCurrency(diligence.value)}</p>
                        <Button 
                          size="sm" 
                          onClick={() => navigate('/available-diligences')}
                          className="mt-2"
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {metrics.totalDiligences}
            </div>
            <p className="text-sm text-gray-600">Total de Diligências</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {metrics.completedDiligences}
            </div>
            <p className="text-sm text-gray-600">Concluídas</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatCurrency(metrics.totalEarnings)}
            </div>
            <p className="text-sm text-gray-600">Ganhos Totais</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {metrics.responseTime}h
            </div>
            <p className="text-sm text-gray-600">Tempo Médio de Resposta</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CorrespondentDashboard;