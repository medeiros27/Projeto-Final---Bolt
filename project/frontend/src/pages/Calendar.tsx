import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDiligences } from '../hooks/useDiligences';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingState from '../components/UI/LoadingState';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Filter, 
  X,
  Clock,
  MapPin,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { diligences, loading } = useDiligences();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Filtrar diligências com base no usuário atual
  const userDiligences = diligences.filter(diligence => {
    if (user?.role === 'admin') {
      return true; // Admin vê todas
    } else if (user?.role === 'client') {
      return diligence.clientId === user.id;
    } else if (user?.role === 'correspondent') {
      return diligence.correspondentId === user.id;
    }
    return false;
  });

  // Aplicar filtros
  const filteredDiligences = userDiligences.filter(diligence => {
    if (statusFilter !== 'all' && diligence.status !== statusFilter) {
      return false;
    }
    if (priorityFilter !== 'all' && diligence.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  // Navegar para o mês anterior
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navegar para o próximo mês
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Obter dias do mês atual
  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  // Obter diligências para um dia específico
  const getDiligencesForDay = (day: Date) => {
    return filteredDiligences.filter(diligence => {
      const diligenceDate = parseISO(diligence.deadline);
      return isSameDay(diligenceDate, day);
    });
  };

  // Limpar filtros
  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  // Obter badge de status
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

  // Obter badge de prioridade
  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      low: { variant: 'default' as const, label: 'Baixa' },
      medium: { variant: 'warning' as const, label: 'Média' },
      high: { variant: 'danger' as const, label: 'Alta' },
      urgent: { variant: 'danger' as const, label: 'Urgente' }
    };
    
    return priorityMap[priority as keyof typeof priorityMap] || { variant: 'default' as const, label: priority };
  };

  // Navegar para a página de detalhes da diligência
  const handleViewDiligence = (id: string) => {
    if (user?.role === 'admin') {
      navigate(`/diligences/${id}`);
    } else {
      navigate(`/my-diligences/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState text="Carregando calendário..." />
      </div>
    );
  }

  const daysInMonth = getDaysInMonth();
  const selectedDayDiligences = selectedDay ? getDiligencesForDay(selectedDay) : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
        <p className="text-gray-600">Visualize suas diligências em formato de calendário</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                </h2>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Filtros
              </Button>
            </div>

            {/* Filtros */}
            {showFilters && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                </div>
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
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
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

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                <div key={index} className="text-center py-2 text-sm font-medium text-gray-700">
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {/* Espaços vazios para alinhar o primeiro dia do mês */}
              {Array.from({ length: daysInMonth[0].getDay() }).map((_, index) => (
                <div key={`empty-${index}`} className="p-2 h-24"></div>
              ))}

              {/* Dias do mês */}
              {daysInMonth.map((day) => {
                const diligencesForDay = getDiligencesForDay(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isCurrentDay = isToday(day);
                
                return (
                  <div 
                    key={day.toString()} 
                    className={`p-2 border rounded-lg ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : isCurrentDay 
                          ? 'border-blue-200 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                    } cursor-pointer h-24 overflow-hidden`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium ${isCurrentDay ? 'text-blue-700' : 'text-gray-700'}`}>
                        {format(day, 'd')}
                      </span>
                      {diligencesForDay.length > 0 && (
                        <Badge variant={isCurrentDay ? 'primary' : 'default'} size="sm">
                          {diligencesForDay.length}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      {diligencesForDay.slice(0, 2).map((diligence) => (
                        <div 
                          key={diligence.id} 
                          className="text-xs truncate p-1 rounded bg-gray-100"
                          title={diligence.title}
                        >
                          {format(parseISO(diligence.deadline), 'HH:mm')} - {diligence.title}
                        </div>
                      ))}
                      {diligencesForDay.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{diligencesForDay.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Detalhes do dia selecionado */}
        <div>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDay 
                ? format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR }) 
                : 'Selecione um dia'}
            </h3>

            {selectedDay && (
              <>
                {selectedDayDiligences.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhuma diligência para este dia</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayDiligences.map((diligence) => {
                      const status = getStatusBadge(diligence.status);
                      const priority = getPriorityBadge(diligence.priority);
                      
                      return (
                        <div key={diligence.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  {format(parseISO(diligence.deadline), 'HH:mm')}
                                </span>
                              </div>
                              <h4 className="font-medium text-gray-900">{diligence.title}</h4>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant={status.variant}>{status.label}</Badge>
                                <Badge variant={priority.variant}>{priority.label}</Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                                <div className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {diligence.city}, {diligence.state}
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {formatCurrency(diligence.value)}
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDiligence(diligence.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {!selectedDay && (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Clique em um dia no calendário para ver as diligências</p>
              </div>
            )}
          </Card>

          {/* Resumo */}
          <Card className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-700">Este Mês</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredDiligences.filter(d => {
                      const date = parseISO(d.deadline);
                      return isSameMonth(date, currentMonth);
                    }).length}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm font-medium text-green-700">Concluídas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredDiligences.filter(d => d.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>

            {/* Próximas diligências */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Próximas Diligências</h4>
              <div className="space-y-2">
                {filteredDiligences
                  .filter(d => {
                    const date = parseISO(d.deadline);
                    const today = new Date();
                    return date >= today && d.status !== 'completed' && d.status !== 'cancelled';
                  })
                  .sort((a, b) => parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime())
                  .slice(0, 3)
                  .map(diligence => (
                    <div key={diligence.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                      <div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            {format(parseISO(diligence.deadline), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {diligence.title}
                        </p>
                      </div>
                      <Badge variant={getStatusBadge(diligence.status).variant} size="sm">
                        {getStatusBadge(diligence.status).label}
                      </Badge>
                    </div>
                  ))}
                {filteredDiligences.filter(d => {
                  const date = parseISO(d.deadline);
                  const today = new Date();
                  return date >= today && d.status !== 'completed' && d.status !== 'cancelled';
                }).length === 0 && (
                  <div className="text-center py-2 text-sm text-gray-500">
                    Nenhuma diligência pendente
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;