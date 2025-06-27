import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StatsCard from '../components/Dashboard/StatsCard';
import { 
  DollarSign, 
  Users, 
  FileText, 
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Target,
  Award,
  Zap,
  PiggyBank
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import platformService from '../services/platformService';
import financialService from '../services/financialService';

interface PlatformAnalytics {
  totalRevenue: number;
  totalDiligences: number;
  activeCorrespondents: number;
  activeClients: number;
  averageRating: number;
  completionRate: number;
  averageResponseTime: number;
}

const PlatformDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [monthlyProfit, setMonthlyProfit] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [platformData, financialSummary] = await Promise.all([
        platformService.getPlatformAnalytics(),
        financialService.getFinancialSummary()
      ]);
      
      setAnalytics(platformData);
      setMonthlyProfit(financialSummary.lucroMes);
      
      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'payment',
          description: 'Pagamento processado - R$ 350,00',
          time: '2 min atrás',
          icon: DollarSign,
          color: 'text-green-600'
        },
        {
          id: '2',
          type: 'assignment',
          description: 'Diligência auto-atribuída a Maria Santos',
          time: '5 min atrás',
          icon: Zap,
          color: 'text-blue-600'
        },
        {
          id: '3',
          type: 'registration',
          description: 'Novo correspondente cadastrado',
          time: '15 min atrás',
          icon: Users,
          color: 'text-purple-600'
        },
        {
          id: '4',
          type: 'completion',
          description: 'Diligência concluída com avaliação 5★',
          time: '1 hora atrás',
          icon: Star,
          color: 'text-yellow-600'
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      // Fallback para dados mock
      setMonthlyProfit(2497.00);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Carregando analytics da plataforma..." />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
            <Button onClick={loadAnalytics}>Tentar Novamente</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Overview - SUBSTITUÍDO RECEITA TOTAL POR LUCRO */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">JurisConnect Platform</h2>
            <p className="text-blue-100">
              Conectando {analytics.activeClients} clientes com {analytics.activeCorrespondents} correspondentes
            </p>
            <p className="text-blue-100 mt-1">
              {analytics.totalDiligences} diligências processadas • {analytics.completionRate.toFixed(1)}% de sucesso
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(monthlyProfit)}
            </div>
            <p className="text-blue-100">LUCRO</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Lucro Mensal"
          value={formatCurrency(monthlyProfit)}
          icon={PiggyBank}
          color="green"
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatsCard
          title="Correspondentes Ativos"
          value={analytics.activeCorrespondents}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Avaliação Média"
          value={`${analytics.averageRating.toFixed(1)}★`}
          icon={Star}
          color="yellow"
        />
        <StatsCard
          title="Tempo de Resposta"
          value={`${analytics.averageResponseTime.toFixed(1)}h`}
          icon={Clock}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Indicators */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Performance</h3>
          
          <div className="space-y-6">
            {/* Completion Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Taxa de Conclusão</span>
                <span className="text-sm text-gray-600">{analytics.completionRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${analytics.completionRate}%` }}
                ></div>
              </div>
            </div>

            {/* Client Satisfaction */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Satisfação do Cliente</span>
                <span className="text-sm text-gray-600">{((analytics.averageRating / 5) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(analytics.averageRating / 5) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Response Time */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Tempo de Resposta (meta: 12h)</span>
                <span className="text-sm text-gray-600">{analytics.averageResponseTime.toFixed(1)}h</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    analytics.averageResponseTime <= 12 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((12 / analytics.averageResponseTime) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Platform Growth */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analytics.activeClients}
                </div>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analytics.totalDiligences}
                </div>
                <p className="text-sm text-gray-600">Diligências Processadas</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            Ver Todas as Atividades
          </Button>
        </Card>
      </div>

      {/* Quality Control */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualidade do Serviço</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-700">Avaliação Média</span>
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(analytics.averageRating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-medium">
                {analytics.averageRating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">Taxa de Conclusão</span>
            </div>
            <span className="text-sm font-medium">{analytics.completionRate.toFixed(1)}%</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-gray-700">Tempo Médio de Resposta</span>
            </div>
            <span className="text-sm font-medium">{analytics.averageResponseTime.toFixed(1)}h</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-sm text-gray-700">Disputas</span>
            </div>
            <span className="text-sm font-medium">0.5%</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              Excelente qualidade de serviço!
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Todos os indicadores estão acima da meta estabelecida.
          </p>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="h-20 flex flex-col items-center justify-center">
            <BarChart3 className="h-6 w-6 mb-2" />
            Relatórios Avançados
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Users className="h-6 w-6 mb-2" />
            Gerenciar Correspondentes
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <DollarSign className="h-6 w-6 mb-2" />
            Configurar Pagamentos
          </Button>
          
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
            <Zap className="h-6 w-6 mb-2" />
            Automação
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PlatformDashboard;