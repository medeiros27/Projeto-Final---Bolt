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
  Eye,
  Filter,
  CheckCircle,
  X
} from 'lucide-react';
import { format, parseISO, isBefore, isToday, addDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Diligence } from '../../types';

const ClientAgenda: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { diligences, loading } = useDiligences();
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('upcoming');

  // Filtrar diligências do cliente
  const clientDiligences = diligences.filter(d => d.clientId === user?.id);

  // Aplicar filtros
  const filteredDiligences = clientDiligences.filter(diligence => {
    // Filtrar por status
    if (statusFilter !== 'all' && diligence.status !== statusFilter) {
      return false;
    }

    // Filtrar por data
    const deadlineDate = parseISO(diligence.deadline);
    const today = new Date();
    
    if (dateFilter === 'today') {
      return isToday(deadlineDate);
    } else if (dateFilter === 'overdue') {
      return isBefore(deadlineDate, today) && 
             diligence.status !== 'completed' && 
             diligence.status !== 'cancelled';
    } else if (dateFilter === 'week') {
      const nextWeek = addDays(today, 7);
      return !isBefore(deadlineDate, today) && isBefore(deadlineDate, nextWeek);
    }
    
    // upcoming (padrão)
    return !isBefore(deadlineDate, today) || 
           (diligence.status !== 'completed' && diligence.status !== 'cancelled');
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

  if (loading) {
    return (
      <Card className="mb-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  // Verificar se existem diligências atrasadas
  const overdueDiligences = clientDiligences.filter(diligence => {
    const deadlineDate = parseISO(diligence.deadline);
    return isBefore(deadlineDate, new Date()) && 
           diligence.status !== 'completed' && 
           diligence.status !== 'cancelled';
  });

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
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="assigned">Atribuída</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="upcoming">Próximas</option>
                <option value="today">Hoje</option>
                <option value="week">Esta semana</option>
                <option value="overdue">Atrasadas</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {overdueDiligences.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900">Diligências Atrasadas</h3>
              <p className="text-sm text-red-700">
                {overdueDiligences.length} diligência(s) com prazo vencido
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resumo de Status */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-700">Pendentes</p>
          <p className="text-lg font-bold text-yellow-600">
            {clientDiligences.filter(d => d.status === 'pending').length}
          </p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">Em Andamento</p>
          <p className="text-lg font-bold text-blue-600">
            {clientDiligences.filter(d => d.status === 'assigned' || d.status === 'in_progress').length}
          </p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700">Concluídas</p>
          <p className="text-lg font-bold text-green-600">
            {clientDiligences.filter(d => d.status === 'completed').length}
          </p>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-700">Total</p>
          <p className="text-lg font-bold text-gray-600">
            {clientDiligences.length}
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
                          <div className="flex items-center mt-1">
                            <Badge variant={status.variant} size="sm">
                              {status.label}
                            </Badge>
                            {diligence.correspondent ? (
                              <span className="ml-2 text-xs text-gray-500 flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                Correspondente atribuído
                              </span>
                            ) : (
                              <span className="ml-2 text-xs text-gray-500 flex items-center">
                                <X className="h-3 w-3 text-gray-400 mr-1" />
                                Sem correspondente
                              </span>
                            )}
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

export default ClientAgenda;