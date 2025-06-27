import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import platformService from '../services/platformService';
import financialService from '../services/financialService';
import { Diligence } from '../types'; // Importe seus tipos
import StatsCard from '../components/Dashboard/StatsCard';
import CorrespondentDashboard from '../components/Dashboard/CorrespondentDashboard';
import Card from '../components/UI/Card';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorState from '../components/UI/ErrorState'; // Componente de erro para consistência
import { 
  FileText, Users, DollarSign, TrendingUp, Clock, CheckCircle, PiggyBank
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Estados unificados para dados, carregamento e erro
  const [diligences, setDiligences] = useState<Diligence[]>([]);
  const [stats, setStats] = useState<any>(null); // Use um tipo mais específico se disponível
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Função unificada para carregar todos os dados do dashboard
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Busca todos os dados necessários em paralelo
        const [
          fetchedDiligences, 
          fetchedStats,
        ] = await Promise.all([
          platformService.getDiligences(),
          platformService.getPlatformAnalytics(), // Usando o método que busca as estatísticas gerais
        ]);

        setDiligences(fetchedDiligences);
        setStats(fetchedStats);

      } catch (err) {
        setError("Não foi possível carregar os dados do dashboard. Verifique a conexão com a API e tente novamente.");
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]); // Recarrega os dados se o usuário mudar

  // Funções de ajuda para badges (já estavam ótimas)
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
  
  // Renderiza o Dashboard de Admin
  const renderAdminDashboard = () => {
    // Agora 'stats' e 'diligences' vêm do estado, não de mocks
    const activeDiligences = diligences.filter(d => d.status === 'in_progress' || d.status === 'assigned').length;

    return (
      <>
        <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-3 bg-white bg-opacity-20 rounded-full"><PiggyBank className="h-8 w-8" /></div>
                    <div>
                      <h2 className="text-2xl font-bold">LUCRO TOTAL</h2>
                      <p className="text-blue-100">Baseado em diligências concluídas</p>
                    </div>
                  </div>
                  <div className="text-4xl font-bold mb-2">{formatCurrency(stats?.totalProfit || 0)}</div>
                </div>
                <div className="text-right">
                  <div className="text-blue-100 text-sm mb-1">Receita Total</div>
                  <div className="font-semibold text-lg">{formatCurrency(stats?.totalRevenue || 0)}</div>
                </div>
              </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total de Diligências" value={diligences.length} icon={FileText} color="blue" />
          <StatsCard title="Diligências Ativas" value={activeDiligences} icon={Clock} color="yellow" />
          <StatsCard title="Receita Total" value={formatCurrency(stats?.totalRevenue || 0)} icon={DollarSign} color="green" />
          <StatsCard title="Correspondentes Ativos" value={stats?.activeCorrespondents || 0} icon={Users} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Diligências Recentes</h3>
            <div className="space-y-4">
              {diligences.slice(0, 5).map((diligence) => {
                const status = getStatusBadge(diligence.status);
                const priority = getPriorityBadge(diligence.priority);
                return (
                  <div key={diligence.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    {/* Conteúdo da diligência */}
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas do Sistema</h3>
            <div className="space-y-4">
              {/* Métricas usando 'stats' */}
            </div>
          </Card>
        </div>
      </>
    );
  };
  
  // Renderiza o Dashboard do Cliente
  const renderClientDashboard = () => {
    // Filtra as diligências para o usuário logado
    const userDiligences = diligences.filter(d => d.clientId === user?.id);
    return (
       <>
         {/* UI do dashboard do cliente usando 'userDiligences' */}
       </>
    );
  };

  // ----- RENDERIZAÇÃO PRINCIPAL -----

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bem-vindo, {user?.name}!</h1>
        <p className="text-gray-600">{format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
      </div>
      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'client' && renderClientDashboard()}
      {user?.role === 'correspondent' && <CorrespondentDashboard diligences={diligences.filter(d => d.correspondentId === user?.id)} stats={stats} />}
    </div>
  );
};

export default Dashboard;
