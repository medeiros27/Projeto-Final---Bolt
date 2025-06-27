import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDiligences } from '../../hooks/useDiligences';
import Card from '../UI/Card';
import Badge from '../UI/Badge';
import Button from '../UI/Button';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  MapPin, 
  DollarSign,
  Eye,
  Filter,
  CheckCircle
} from 'lucide-react';
import { format, parseISO, isBefore, isToday, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Diligence } from '../../types';
import { formatCurrency } from '../../utils/formatters';

const CorrespondentAgenda: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { diligences, loading } = useDiligences();
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');
  const [regionFilter, setRegionFilter] = useState('all');

  // Filtrar diligências do correspondente
  const correspondentDiligences = diligences.filter(d => d.correspondentId === user?.id);

  // Aplicar filtros
  const filteredDiligences = correspondentDiligences.filter(diligence => {
    // Filtrar por status
    if (statusFilter === 'active' && 
        (diligence.status === 'completed' || diligence.status === 'cancelled')) {
      return false;
    } else if (statusFilter !== 'all' && statusFilter !== 'active' && diligence.status !== statusFilter) {
      return false;
    }

    // Filtrar por região
    if (regionFilter !== 'all' && diligence.state !== regionFilter) {
      return false;
    }

    return true;
  });

  // Ordenar por data
  const sortedDiligences = [...filteredDiligences].sort((a, b) => {
    return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
  });

  // Agrupar por data
  const groupedDiligences: { [key: string]: Diligence[] } = {};
  
  sortedDiligences.forEach(diligence => {
    const date = format(parseISO(diligence.deadline), 'yyyy-MM-dd');
    if (!groupedDiligences[date]) {
      groupedDiligences[date] = [];
    }
    groupedDiligences[date].push(diligence);
  });

  // Obter estados únicos para filtro
  const uniqueStates = Array.from(new Set(correspondentDiligences.map(d => d.state))).sort();

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

  const handleViewDiligence = (id: string) => {
    navigate(`/my-diligences/${id}`);
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (isSameDay(date, today)) {
      return 'Hoje';
    } else if (isSameDay(date, tomorrow)) {
      return 'Amanhã';
    } else {
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    }
  };

  // Verificar se existem diligências urgentes (prazo hoje ou amanhã)
  const urgentDiligences = correspondentDiligences.filter(diligence => {
    if (diligence.status === 'completed' || diligence.status === 'cancelled') {
      return false;
    }
    
    const deadlineDate = parseISO(diligence.deadline);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    return isToday(deadlineDate) || isSameDay(deadlineDate, tomorrow);
  });

  if (loading) {
    return (
      <Card className="mb-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Minha Agenda</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Ativas</option>
                <option value="all">Todas</option>
                <option value="assigned">Atribuídas</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluídas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Região</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {urgentDiligences.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-900">Diligências Urgentes</h3>
              <p className="text-sm text-yellow-700">
                {urgentDiligences.length} diligência(s) com prazo para hoje ou amanhã
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumo de Status */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">Atribuídas</p>
          <p className="text-lg font-bold text-blue-600">
            {correspondentDiligences.filter(d => d.status === 'assigned').length}
          </p>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-700">Em Andamento</p>
          <p className="text-lg font-bold text-purple-600">
            {correspondentDiligences.filter(d => d.status === 'in_progress').length}
          </p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700">Concluídas</p>
          <p className="text-lg font-bold text-green-600">
            {correspondentDiligences.filter(d => d.status === 'completed').length}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-700">Total</p>
          <p className="text-lg font-bold text-gray-600">
            {correspondentDiligences.length}
          </p>
        </div>
      </div>

      {/* Lista de Diligências */}
      <div className="space-y-4">
        {Object.keys(groupedDiligences).length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            Nenhuma diligência encontrada para os filtros selecionados
          </div>
        ) : (
          Object.entries(groupedDiligences).map(([date, diligences]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                {getDateLabel(date)}
                <Badge variant="default" className="ml-2">{diligences.length}</Badge>
              </h3>
              
              <div className="space-y-2">
                {diligences.map(diligence => {
                  const status = getStatusBadge(diligence.status);
                  const isOverdue = isBefore(parseISO(diligence.deadline), new Date()) && 
                                    diligence.status !== 'completed' && 
                                    diligence.status !== 'cancelled';
                  
                  return (
                    <div 
                      key={diligence.id} 
                      className={`p-2 border rounded-lg ${
                        isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {format(parseISO(diligence.deadline), 'HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {diligence.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant={status.variant} size="sm">
                              {status.label}
                            </Badge>
                            <span className="text-xs text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                              {diligence.city}, {diligence.state}
                            </span>
                            <span className="text-xs text-green-600 flex items-center">
                              <DollarSign className="h-3 w-3 text-green-500 mr-1" />
                              {formatCurrency(diligence.value)}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewDiligence(diligence.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default CorrespondentAgenda;