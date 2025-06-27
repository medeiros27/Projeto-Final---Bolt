import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDiligences } from '../hooks/useDiligences';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Plus,
  Eye,
  CreditCard,
  Building,
  Receipt,
  FileText,
  Filter,
  Search,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  PiggyBank,
  Target,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';
import financialService from '../services/financialService';
import { FinancialSummary, DiligenceFinancialData } from '../types';

const Financial: React.FC = () => {
  const { user } = useAuth();
  const { diligences } = useDiligences();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports'>('dashboard');
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [financialData, setFinancialData] = useState<DiligenceFinancialData[]>([]);
  const [clientData, setClientData] = useState<any>(null);
  const [correspondentData, setCorrespondentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para controle mensal
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [monthlyData, setMonthlyData] = useState<{
    [key: string]: {
      summary: any;
      transactions: DiligenceFinancialData[];
    }
  }>({});

  useEffect(() => {
    loadFinancialData();
  }, [user, diligences, selectedMonth]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);

      if (user?.role === 'admin') {
        // Admin vê tudo
        const [summary, allFinancialData] = await Promise.all([
          financialService.getFinancialSummary(),
          financialService.getAllFinancialData()
        ]);
        setFinancialSummary(summary);
        setFinancialData(allFinancialData);
        
        // Organizar dados por mês
        await organizeDataByMonth(allFinancialData);
      } else if (user?.role === 'client') {
        // Cliente vê apenas suas diligências
        const data = await financialService.getClientFinancialData(user.id, diligences);
        setClientData(data);
        
        // Organizar dados do cliente por mês
        await organizeClientDataByMonth();
      } else if (user?.role === 'correspondent') {
        // Correspondente vê apenas suas diligências
        const data = await financialService.getCorrespondentFinancialData(user.id, diligences);
        setCorrespondentData(data);
        
        // Organizar dados do correspondente por mês
        await organizeCorrespondentDataByMonth();
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const organizeDataByMonth = async (allData: DiligenceFinancialData[]) => {
    const monthlyOrganized: { [key: string]: { summary: any; transactions: DiligenceFinancialData[] } } = {};
    
    // Últimos 12 meses
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(new Date(), i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      // Filtrar dados do mês
      const monthData = allData.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= monthStart && itemDate <= monthEnd;
      });
      
      // Calcular resumo do mês
      const totalFaturado = monthData.reduce((sum, item) => sum + item.faturado, 0);
      const totalCusto = monthData.reduce((sum, item) => sum + item.custo, 0);
      const totalLucro = monthData.reduce((sum, item) => sum + item.lucro, 0);
      const totalRecebido = monthData.filter(item => item.clientPaymentStatus === 'paid').reduce((sum, item) => sum + item.faturado, 0);
      const totalPago = monthData.filter(item => item.correspondentPaymentStatus === 'paid').reduce((sum, item) => sum + item.custo, 0);
      
      monthlyOrganized[monthKey] = {
        summary: {
          totalFaturado,
          totalCusto,
          totalLucro,
          totalRecebido,
          totalPago,
          totalTransactions: monthData.length,
          margemLucro: totalFaturado > 0 ? (totalLucro / totalFaturado) * 100 : 0
        },
        transactions: monthData
      };
    }
    
    setMonthlyData(monthlyOrganized);
  };

  const organizeClientDataByMonth = async () => {
    const clientDiligences = diligences.filter(d => d.clientId === user?.id);
    const monthlyOrganized: { [key: string]: { summary: any; transactions: any[] } } = {};
    
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(new Date(), i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthDiligences = clientDiligences.filter(d => {
        const diligenceDate = new Date(d.createdAt);
        return diligenceDate >= monthStart && diligenceDate <= monthEnd;
      });
      
      const totalValue = monthDiligences.reduce((sum, d) => sum + d.value, 0);
      const completedCount = monthDiligences.filter(d => d.status === 'completed').length;
      
      monthlyOrganized[monthKey] = {
        summary: {
          totalDiligences: monthDiligences.length,
          totalValue,
          completedDiligences: completedCount,
          averageValue: monthDiligences.length > 0 ? totalValue / monthDiligences.length : 0
        },
        transactions: monthDiligences
      };
    }
    
    setMonthlyData(monthlyOrganized);
  };

  const organizeCorrespondentDataByMonth = async () => {
    const correspondentDiligences = diligences.filter(d => d.correspondentId === user?.id);
    const monthlyOrganized: { [key: string]: { summary: any; transactions: any[] } } = {};
    
    for (let i = 0; i < 12; i++) {
      const monthDate = subMonths(new Date(), i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthDiligences = correspondentDiligences.filter(d => {
        const diligenceDate = new Date(d.createdAt);
        return diligenceDate >= monthStart && diligenceDate <= monthEnd;
      });
      
      const totalEarnings = monthDiligences.reduce((sum, d) => sum + d.value, 0);
      const completedCount = monthDiligences.filter(d => d.status === 'completed').length;
      
      monthlyOrganized[monthKey] = {
        summary: {
          totalDiligences: monthDiligences.length,
          totalEarnings,
          completedDiligences: completedCount,
          averageEarning: monthDiligences.length > 0 ? totalEarnings / monthDiligences.length : 0
        },
        transactions: monthDiligences
      };
    }
    
    setMonthlyData(monthlyOrganized);
  };

  const getCurrentMonthData = () => {
    const monthKey = format(selectedMonth, 'yyyy-MM');
    return monthlyData[monthKey] || { summary: {}, transactions: [] };
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  const handleMarkAsPaid = async (diligenceId: string, type: 'client' | 'correspondent') => {
    try {
      if (type === 'client') {
        await financialService.markClientPaymentAsPaid(diligenceId);
      } else {
        await financialService.markCorrespondentPaymentAsPaid(diligenceId);
      }
      await loadFinancialData();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
    }
  };

  const exportMonthlyReport = () => {
    const monthKey = format(selectedMonth, 'yyyy-MM');
    const monthData = getCurrentMonthData();
    
    // Simular exportação
    const reportData = {
      month: format(selectedMonth, 'MMMM yyyy', { locale: ptBR }),
      summary: monthData.summary,
      transactions: monthData.transactions
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${format(selectedMonth, 'yyyy-MM')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Dashboard do Administrador
  const renderAdminDashboard = () => {
    if (!financialSummary) return null;
    
    const currentMonthData = getCurrentMonthData();

    return (
      <div className="space-y-6">
        {/* Seletor de Mês */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentMonthData.summary.totalTransactions || 0} transações
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                disabled={selectedMonth >= new Date()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={exportMonthlyReport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Mês
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Comparar Meses
              </Button>
            </div>
          </div>
        </Card>

        {/* Métricas do Mês Selecionado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">FATURADO</p>
                <p className="text-2xl font-bold">{formatCurrency(currentMonthData.summary.totalFaturado || 0)}</p>
                <p className="text-green-100 text-xs mt-1">
                  Total: {formatCurrency(financialSummary.totalFaturado)}
                </p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">LUCRO</p>
                <p className="text-2xl font-bold">{formatCurrency(currentMonthData.summary.totalLucro || 0)}</p>
                <p className="text-blue-100 text-xs mt-1">
                  Margem: {(currentMonthData.summary.margemLucro || 0).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">CUSTO</p>
                <p className="text-2xl font-bold">{formatCurrency(currentMonthData.summary.totalCusto || 0)}</p>
                <p className="text-red-100 text-xs mt-1">
                  Total: {formatCurrency(financialSummary.totalCusto)}
                </p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">TRANSAÇÕES</p>
                <p className="text-2xl font-bold">{currentMonthData.summary.totalTransactions || 0}</p>
                <p className="text-purple-100 text-xs mt-1">
                  Neste mês
                </p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <Target className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Gráfico de Evolução Mensal */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução dos Últimos 6 Meses</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {Array.from({ length: 6 }, (_, i) => {
              const monthDate = subMonths(new Date(), 5 - i);
              const monthKey = format(monthDate, 'yyyy-MM');
              const monthData = monthlyData[monthKey];
              const lucro = monthData?.summary.totalLucro || 0;
              const maxLucro = Math.max(...Object.values(monthlyData).map((m: any) => m.summary.totalLucro || 0));
              const height = maxLucro > 0 ? (lucro / maxLucro) * 200 : 0;
              
              return (
                <div key={monthKey} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${height}px` }}
                    title={`${format(monthDate, 'MMM/yyyy', { locale: ptBR })}: ${formatCurrency(lucro)}`}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2">
                    {format(monthDate, 'MMM', { locale: ptBR })}
                  </span>
                  <span className="text-xs font-medium">{formatCurrency(lucro)}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Detalhamento do Mês Selecionado */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Detalhamento - {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Diligência</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Faturado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Custo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Lucro</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Correspondente</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentMonthData.transactions
                  .filter((item: any) => {
                    if (!searchTerm) return true;
                    const diligence = diligences.find(d => d.id === item.diligenceId);
                    return diligence?.title.toLowerCase().includes(searchTerm.toLowerCase());
                  })
                  .map((item: any) => {
                    const diligence = diligences.find(d => d.id === item.diligenceId);
                    
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {format(new Date(item.createdAt), 'dd/MM', { locale: ptBR })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {diligence?.title || `Diligência ${item.diligenceId}`}
                            </p>
                            <p className="text-sm text-gray-500">{diligence?.type}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(item.faturado)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-red-600">
                            {formatCurrency(item.custo)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${item.lucro > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(item.lucro)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={item.clientPaymentStatus === 'paid' ? 'success' : 'warning'}>
                            {item.clientPaymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={item.correspondentPaymentStatus === 'paid' ? 'success' : 'warning'}>
                            {item.correspondentPaymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-1">
                            {item.clientPaymentStatus === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsPaid(item.diligenceId, 'client')}
                              >
                                Receber
                              </Button>
                            )}
                            {item.correspondentPaymentStatus === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkAsPaid(item.diligenceId, 'correspondent')}
                              >
                                Pagar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {currentMonthData.transactions.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma transação neste mês</p>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // Dashboard do Cliente
  const renderClientDashboard = () => {
    if (!clientData) return null;
    
    const currentMonthData = getCurrentMonthData();

    return (
      <div className="space-y-6">
        {/* Seletor de Mês */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentMonthData.summary.totalDiligences || 0} diligências
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                disabled={selectedMonth >= new Date()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={exportMonthlyReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Diligências do Mês</p>
                <p className="text-2xl font-bold text-gray-900">{currentMonthData.summary.totalDiligences || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor do Mês</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(currentMonthData.summary.totalValue || 0)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-blue-600">{currentMonthData.summary.completedDiligences || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Médio</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(currentMonthData.summary.averageValue || 0)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Diligências - {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          <div className="space-y-4">
            {currentMonthData.transactions.map((diligence: any) => (
              <div key={diligence.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{diligence.title}</h4>
                  <p className="text-sm text-gray-600">{diligence.type}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(diligence.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(diligence.value)}</p>
                  <Badge variant={diligence.status === 'completed' ? 'success' : 'warning'}>
                    {diligence.status === 'completed' ? 'Concluída' : 'Em andamento'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {currentMonthData.transactions.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma diligência neste mês</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Dashboard do Correspondente
  const renderCorrespondentDashboard = () => {
    if (!correspondentData) return null;
    
    const currentMonthData = getCurrentMonthData();

    return (
      <div className="space-y-6">
        {/* Seletor de Mês */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <p className="text-sm text-gray-600">
                  {currentMonthData.summary.totalDiligences || 0} diligências
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                disabled={selectedMonth >= new Date()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={exportMonthlyReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Diligências do Mês</p>
                <p className="text-2xl font-bold text-gray-900">{currentMonthData.summary.totalDiligences || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ganhos do Mês</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(currentMonthData.summary.totalEarnings || 0)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold text-blue-600">{currentMonthData.summary.completedDiligences || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ganho Médio</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(currentMonthData.summary.averageEarning || 0)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <PiggyBank className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Diligências - {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
          </h3>
          <div className="space-y-4">
            {currentMonthData.transactions.map((diligence: any) => (
              <div key={diligence.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{diligence.title}</h4>
                  <p className="text-sm text-gray-600">{diligence.type}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(diligence.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{formatCurrency(diligence.value)}</p>
                  <Badge variant={diligence.status === 'completed' ? 'success' : 'warning'}>
                    {diligence.status === 'completed' ? 'Concluída' : 'Em andamento'}
                  </Badge>
                </div>
              </div>
            ))}
            
            {currentMonthData.transactions.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma diligência neste mês</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Carregando dados financeiros..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {user?.role === 'admin' ? 'Gestão Financeira' : 'Financeiro'}
        </h1>
        <p className="text-gray-600">
          {user?.role === 'admin' 
            ? 'Controle completo das finanças da plataforma por mês'
            : user?.role === 'client'
            ? 'Acompanhe seus gastos e diligências mensalmente'
            : 'Acompanhe seus ganhos e diligências mensalmente'
          }
        </p>
      </div>

      {user?.role === 'admin' && renderAdminDashboard()}
      {user?.role === 'client' && renderClientDashboard()}
      {user?.role === 'correspondent' && renderCorrespondentDashboard()}
    </div>
  );
};

export default Financial;