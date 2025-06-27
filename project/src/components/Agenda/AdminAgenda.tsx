import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiligences } from '../../hooks/useDiligences';
import Card from '../UI/Card';
import Badge from '../UI/Badge';
import Button from '../UI/Button';
import { 
  Calendar, 
  Clock, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';
import { format, addDays, isSameDay, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Diligence } from '../../types';

const AdminAgenda: React.FC = () => {
  const navigate = useNavigate();
  const { diligences, loading } = useDiligences();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all'
  });

  // Gerar dias visíveis (7 dias a partir da data selecionada)
  useEffect(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(selectedDate, i));
    }
    setVisibleDays(days);
  }, [selectedDate]);

  // Navegar para a semana anterior
  const goToPreviousWeek = () => {
    setSelectedDate(prev => addDays(prev, -7));
  };

  // Navegar para a próxima semana
  const goToNextWeek = () => {
    setSelectedDate(prev => addDays(prev, 7));
  };

  // Filtrar diligências para o dia selecionado
  const getDiligencesForDay = (date: Date): Diligence[] => {
    return diligences.filter(diligence => {
      // Filtrar por status e prioridade
      if (filters.status !== 'all' && diligence.status !== filters.status) return false;
      if (filters.priority !== 'all' && diligence.priority !== filters.priority) return false;
      
      // Verificar se a data da diligência é a mesma do dia selecionado
      const deadlineDate = parseISO(diligence.deadline);
      return isSameDay(deadlineDate, date);
    });
  };

  // Obter diligências atrasadas
  const getOverdueDiligences = (): Diligence[] => {
    const today = new Date();
    return diligences.filter(diligence => {
      // Filtrar por status e prioridade
      if (filters.status !== 'all' && diligence.status !== filters.status) return false;
      if (filters.priority !== 'all' && diligence.priority !== filters.priority) return false;
      
      // Verificar se a diligência está atrasada
      const deadlineDate = parseISO(diligence.deadline);
      return isBefore(deadlineDate, today) && 
             diligence.status !== 'completed' && 
             diligence.status !== 'cancelled';
    });
  };

  // Obter diligências para hoje
  const getTodayDiligences = (): Diligence[] => {
    const today = new Date();
    return getDiligencesForDay(today);
  };

  // Obter diligências para amanhã
  const getTomorrowDiligences = (): Diligence[] => {
    const tomorrow = addDays(new Date(), 1);
    return getDiligencesForDay(tomorrow);
  };

  // Obter diligências urgentes (alta prioridade ou urgente)
  const getUrgentDiligences = (): Diligence[] => {
    return diligences.filter(diligence => 
      (diligence.priority === 'high' || diligence.priority === 'urgent') &&
      diligence.status !== 'completed' &&
      diligence.status !== 'cancelled' &&
      (filters.status === 'all' || diligence.status === filters.status)
    );
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

  const handleViewDiligence = (id: string) => {
    navigate(`/diligences/${id}`);
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

  const overdueDiligences = getOverdueDiligences();
  const todayDiligences = getTodayDiligences();
  const tomorrowDiligences = getTomorrowDiligences();
  const urgentDiligences = getUrgentDiligences();

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Agenda do Administrador</h2>
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
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="assigned">Atribuída</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
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

      {/* Resumo Rápido */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-center">
            <h3 className="text-sm font-medium text-blue-900">Hoje</h3>
            <p className="text-2xl font-bold text-blue-700">{todayDiligences.length}</p>
          </div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-center">
            <h3 className="text-sm font-medium text-green-900">Amanhã</h3>
            <p className="text-2xl font-bold text-green-700">{tomorrowDiligences.length}</p>
          </div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-center">
            <h3 className="text-sm font-medium text-red-900">Urgentes</h3>
            <p className="text-2xl font-bold text-red-700">{urgentDiligences.length}</p>
          </div>
        </div>
      </div>

      {/* Navegação da Semana */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <div className="text-sm font-medium text-gray-700">
          {format(visibleDays[0], "dd 'de' MMMM", { locale: ptBR })} - 
          {format(visibleDays[6], " dd 'de' MMMM", { locale: ptBR })}
        </div>
        <Button variant="outline" size="sm" onClick={goToNextWeek}>
          Próxima
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Calendário Semanal */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {visibleDays.map((day, index) => {
          const isToday = isSameDay(day, new Date());
          const dayDiligences = getDiligencesForDay(day);
          
          return (
            <div 
              key={index} 
              className={`text-center p-2 rounded-lg ${
                isToday ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-500">
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div className={`text-sm font-semibold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                {format(day, 'dd')}
              </div>
              <div className="mt-1">
                {dayDiligences.length > 0 ? (
                  <Badge variant={isToday ? 'primary' : 'default'}>
                    {dayDiligences.length}
                  </Badge>
                ) : (
                  <span className="text-xs text-gray-400">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista de Diligências do Dia */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">
          Diligências para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
        </h3>
        
        {getDiligencesForDay(selectedDate).length === 0 ? (
          <div className="text-center py-4 text-sm text-gray-500">
            Nenhuma diligência para este dia
          </div>
        ) : (
          getDiligencesForDay(selectedDate).map(diligence => (
            <div 
              key={diligence.id} 
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
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
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant={getStatusBadge(diligence.status).variant} size="sm">
                      {getStatusBadge(diligence.status).label}
                    </Badge>
                    <Badge variant={getPriorityBadge(diligence.priority).variant} size="sm">
                      {getPriorityBadge(diligence.priority).label}
                    </Badge>
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
          ))
        )}
      </div>
    </Card>
  );
};

export default AdminAgenda;