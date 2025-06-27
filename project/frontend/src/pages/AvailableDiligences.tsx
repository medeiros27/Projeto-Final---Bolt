import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAvailableDiligences } from '../hooks/useDiligences';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import Pagination from '../components/UI/Pagination';
import { usePagination } from '../hooks/usePagination';
import { useToast } from '../components/UI/ToastContainer';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import { BRAZILIAN_STATES } from '../utils/constants';
import diligenceService from '../services/diligenceService';

const AvailableDiligences: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    state: user?.state || '',
    city: user?.city || '',
    type: '',
    priority: '',
    minValue: '',
    maxValue: ''
  });
  const [sortBy, setSortBy] = useState<'deadline' | 'value' | 'created'>('deadline');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [acceptingDiligence, setAcceptingDiligence] = useState<string | null>(null);

  const { diligences, loading, error, refreshAvailableDiligences } = useAvailableDiligences(
    filters.state, 
    filters.city
  );

  // Filter and sort diligences
  const filteredDiligences = diligences
    .filter(diligence => {
      const matchesSearch = diligence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           diligence.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           diligence.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !filters.type || diligence.type === filters.type;
      const matchesPriority = !filters.priority || diligence.priority === filters.priority;
      const matchesMinValue = !filters.minValue || diligence.value >= parseFloat(filters.minValue);
      const matchesMaxValue = !filters.maxValue || diligence.value <= parseFloat(filters.maxValue);
      
      return matchesSearch && matchesType && matchesPriority && matchesMinValue && matchesMaxValue;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'deadline':
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const {
    currentData: paginatedDiligences,
    currentPage,
    totalPages,
    goToPage
  } = usePagination({
    data: filteredDiligences,
    itemsPerPage: 10
  });

  const getUniqueTypes = () => {
    const types = diligences.map(d => d.type);
    return [...new Set(types)].sort();
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
      return { text: 'Vencido', color: 'text-red-600', urgent: true };
    } else if (diffDays === 0) {
      return { text: 'Hoje', color: 'text-yellow-600', urgent: true };
    } else if (diffDays <= 2) {
      return { text: `${diffDays} dia(s)`, color: 'text-yellow-600', urgent: true };
    } else {
      return { text: `${diffDays} dia(s)`, color: 'text-green-600', urgent: false };
    }
  };

  const handleAcceptDiligence = async (diligenceId: string) => {
    if (!user) return;

    setAcceptingDiligence(diligenceId);
    
    try {
      await diligenceService.acceptDiligence(diligenceId, user.id);
      addToast({
        type: 'success',
        title: 'Diligência aceita!',
        message: 'A diligência foi atribuída a você com sucesso.'
      });
      refreshAvailableDiligences();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao aceitar',
        message: 'Não foi possível aceitar a diligência. Tente novamente.'
      });
    } finally {
      setAcceptingDiligence(null);
    }
  };

  const handleViewDetails = (diligenceId: string) => {
    navigate(`/my-diligences/${diligenceId}`);
  };

  const clearFilters = () => {
    setFilters({
      state: user?.state || '',
      city: user?.city || '',
      type: '',
      priority: '',
      minValue: '',
      maxValue: ''
    });
    setSearchTerm('');
  };

  if (user?.role !== 'correspondent') {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="Acesso Restrito"
          description="Esta página é exclusiva para correspondentes jurídicos."
          action={{
            label: 'Voltar ao Dashboard',
            onClick: () => navigate('/dashboard')
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Carregando diligências disponíveis..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="Erro ao carregar diligências"
          description={error}
          action={{
            label: 'Tentar Novamente',
            onClick: refreshAvailableDiligences
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Diligências Disponíveis</h1>
        <p className="text-gray-600">
          Encontre e aceite diligências na sua região
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card padding="sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Disponíveis</p>
              <p className="text-lg font-bold text-gray-900">{diligences.length}</p>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Valor Médio</p>
              <p className="text-lg font-bold text-gray-900">
                {diligences.length > 0 
                  ? formatCurrency(diligences.reduce((sum, d) => sum + d.value, 0) / diligences.length)
                  : 'R$ 0,00'
                }
              </p>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Urgentes</p>
              <p className="text-lg font-bold text-gray-900">
                {diligences.filter(d => d.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Na Sua Região</p>
              <p className="text-lg font-bold text-gray-900">
                {diligences.filter(d => d.state === user?.state).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por título, descrição ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="deadline">Ordenar por Prazo</option>
                <option value="value">Ordenar por Valor</option>
                <option value="created">Ordenar por Data</option>
              </select>
              
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os Estados</option>
                {BRAZILIAN_STATES.map(state => (
                  <option key={state.code} value={state.code}>{state.code}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Cidade"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os Tipos</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mín.</label>
              <input
                type="number"
                value={filters.minValue}
                onChange={(e) => setFilters(prev => ({ ...prev, minValue: e.target.value }))}
                placeholder="R$ 0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Máx.</label>
              <input
                type="number"
                value={filters.maxValue}
                onChange={(e) => setFilters(prev => ({ ...prev, maxValue: e.target.value }))}
                placeholder="R$ 999999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredDiligences.length} diligência(s) encontrada(s)
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Diligences List */}
      {paginatedDiligences.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma diligência disponível"
          description={
            filteredDiligences.length === 0 && diligences.length > 0
              ? "Nenhuma diligência corresponde aos filtros aplicados."
              : "Não há diligências disponíveis na sua região no momento."
          }
          action={
            filteredDiligences.length === 0 && diligences.length > 0
              ? {
                  label: 'Limpar Filtros',
                  onClick: clearFilters
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {paginatedDiligences.map((diligence) => {
            const priority = getPriorityBadge(diligence.priority);
            const timeRemaining = getTimeRemaining(diligence.deadline);
            const isAccepting = acceptingDiligence === diligence.id;
            
            return (
              <Card key={diligence.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {diligence.title}
                        </h3>
                        <p className="text-gray-600 mb-2 line-clamp-2">
                          {diligence.description}
                        </p>
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant={priority.variant}>{priority.label}</Badge>
                          {timeRemaining.urgent && (
                            <Badge variant="danger">
                              <Clock className="h-3 w-3 mr-1" />
                              {timeRemaining.text}
                            </Badge>
                          )}
                          <Badge variant="info">{diligence.type}</Badge>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatCurrency(diligence.value)}
                        </div>
                        <div className={`text-sm ${timeRemaining.color}`}>
                          Prazo: {timeRemaining.text}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>Cliente: {diligence.client.name}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{diligence.city}, {diligence.state}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {format(new Date(diligence.deadline), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Criada {formatRelativeTime(diligence.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {diligence.attachments.length > 0 && (
                          <span>{diligence.attachments.length} anexo(s)</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(diligence.id)}
                        >
                          Ver Detalhes
                        </Button>
                        
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleAcceptDiligence(diligence.id)}
                          disabled={isAccepting}
                        >
                          {isAccepting ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aceitar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
};

export default AvailableDiligences;