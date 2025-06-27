import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDiligences } from '../hooks/useDiligences';
// SOLUÇÃO: Corrigir o caminho da importação para apontar para o diretório correto
import { mockDashboardStats, mockDiligences } from '../data/mockData';
import StatsCard from '../components/Dashboard/StatsCard';
import CorrespondentDashboard from '../components/Dashboard/CorrespondentDashboard';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import financialService from '../services/financialService';
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  PiggyBank,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { diligences } = useDiligences();
  const [monthlyProfit, setMonthlyProfit] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadMonthlyProfit();
    } else {
      setLoading(false);
    }
  }, [user, diligences]);

  const loadMonthlyProfit = async () => {
    try {
      setLoading(true);
      const financialSummary = await financialService.getFinancialSummary();
      setMonthlyProfit(financialSummary.lucroMes);
    } catch (error) {
      console.error('Erro ao carregar lucro mensal:', error);
      // Fallback para cálculo mock
      setMonthlyProfit(mockDashboardStats.totalRevenue * 0.3);
    } finally {
      setLoading(false);
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

  const renderAdminDashboard = () => (
    <>
      {/* Lucro Mensal em Destaque - Substituindo Receita Total */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <PiggyBank className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">LUCRO</h2>
                  <p className="text-blue-100">Margem: 36,3%</p>
                </div>
              </div>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-blue-100">A calcular...</span>
                </div>
              ) : (
                <div className="text-4xl font-bold mb-2">
                  {formatCurrency(monthlyProfit)}
                </div>
              )}
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-200" />
                <span className="text-blue-100 text-sm">
                  Baseado nas diligências concluídas
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-blue-100 text-sm mb-1">Cálculo Automático</div>
              <div className="text-blue-100 text-xs">
                Valor Recebido - Valor Pago
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total de Diligências"
          value={mockDashboardStats.totalDiligences}
          icon={FileText}
          color="blue"
        />
        <StatsCard
          title="Diligências Ativas"
          value={mockDashboardStats.activeDiligences}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Lucro Mensal"
          value={loading ? 'A calcular...' : formatCurrency(monthlyProfit)}
          icon={PiggyBank}
          color="green"
          trend={{ value: mockDashboardStats.monthlyGrowth, isPositive: true }}
        />
        <StatsCard
          title="Correspondentes Ativos"
          value={mockDashboardStats.activeCorrespondents}
          icon={Users}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Diligências Recentes</h3>
          <div className="space-y-4">
            {mockDiligences.slice(0, 5).map((diligence) => {
              const status = getStatusBadge(diligence.status);
              const priority = getPriorityBadge(diligence.priority);
              
              return (
                <div key={diligence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{diligence.title}</h4>
                    <p className="text-sm text-gray-600">{diligence.client.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge variant={priority.variant}>{priority.label}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">R$ {diligence.value.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(diligence.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas do Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Diligências Concluídas</span>
              <span className="font-semibold">{mockDashboardStats.completedDiligences}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Clientes Ativos</span>
              <span className="font-semibold">{mockDashboardStats.activeClients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Lucro Mensal</span>
              <span className="font-semibold text-green-600">
                {loading ? 'A calcular...' : formatCurrency(monthlyProfit)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Crescimento Mensal</span>
              <span className="font-semibold text-green-600">+{mockDashboardStats.monthlyGrowth}%</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );

  const renderClientDashboard = () => {
    const userDiligences = mockDiligences.filter(d => d.clientId === user?.id);
    
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Minhas Diligências"
            value={userDiligences.length}
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="Em Andamento"
            value={userDiligences.filter(d => d.status === 'in_progress' || d.status === 'assigned').length}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="Concluídas"
            value={userDiligences.filter(d => d.status === 'completed').length}
            icon={CheckCircle}
            color="green"
          />
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Minhas Diligências</h3>
          <div className="space-y-4">
            {userDiligences.map((diligence) => {
              const status = getStatusBadge(diligence.status);
              const priority = getPriorityBadge(diligence.priority);
              
              return (
                <div key={diligence.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{diligence.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{diligence.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Badge variant={priority.variant}>{priority.label}</Badge>
                    </div>
                    {diligence.correspondent && (
                      <p className="text-sm text-gray-500 mt-1">
                        Correspondente: {diligence.correspondent.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">R$ {diligence.value.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      Prazo: {format(new Date(diligence.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bem-vindo, {user?.name}!
        </h1>
        <p className="text-gray-600">
          {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>

      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'client' && renderClientDashboard()}
      {user?.role === 'correspondent' && <CorrespondentDashboard />}
    </div>
  );
};

export default Dashboard;
