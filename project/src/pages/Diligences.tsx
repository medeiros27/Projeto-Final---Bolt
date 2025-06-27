import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDiligences } from '../hooks/useDiligences';
import { usePagination } from '../hooks/usePagination';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Pagination from '../components/UI/Pagination';
import LoadingState from '../components/UI/LoadingState';
import ErrorState from '../components/UI/ErrorState';
import EmptyState from '../components/UI/EmptyState';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  MapPin,
  User,
  DollarSign,
  Clock,
  AlertCircle,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '../components/UI/ToastContainer';
import diligenceService from '../services/diligenceService';

const Diligences: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { diligences, loading, error, refreshDiligences } = useDiligences();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filtrar diligências
  const filteredDiligences = diligences.filter(diligence => {
    const matchesSearch = diligence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         diligence.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         diligence.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || diligence.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || diligence.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Paginação
  const {
    currentPage,
    totalPages,
    currentData: paginatedDiligences,
    goToPage,
    itemsPerPage: currentItemsPerPage,
    setItemsPerPage: updateItemsPerPage,
    totalItems
  } = usePagination({
    data: filteredDiligences,
    itemsPerPage,
    persistKey: `diligences_${user?.role}`
  });

  // Atualizar itemsPerPage quando o estado local mudar
  useEffect(() => {
    updateItemsPerPage(itemsPerPage);
  }, [itemsPerPage, updateItemsPerPage]);

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

  const getPageTitle = () => {
    if (user?.role === 'admin') return 'Todas as Diligências';
    if (user?.role === 'client') return 'Minhas Diligências';
    if (user?.role === 'correspondent') return 'Minhas Diligências';
    return 'Diligências';
  };

  const getPageDescription = () => {
    if (user?.role === 'admin') return 'Gerencie todas as diligências do sistema';
    if (user?.role === 'client') return 'Acompanhe suas diligências solicitadas';
    if (user?.role === 'correspondent') return 'Gerencie suas diligências atribuídas';
    return 'Lista de diligências';
  };

  const canCreateDiligence = () => {
    return user?.role === 'admin' || user?.role === 'client';
  };

  const canEditDiligence = (diligence: any) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'client' && diligence.clientId === user.id && diligence.status === 'pending') return true;
    return false;
  };

  const canDeleteDiligence = (diligence: any) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'client' && diligence.clientId === user.id && diligence.status === 'pending') return true;
    return false;
  };

  const handleDeleteDiligence = async (diligence: any) => {
    if (!window.confirm(`Tem certeza que deseja excluir a diligência "${diligence.title}"?`)) {
      return;
    }

    setIsDeleting(diligence.id);
    
    try {
      await diligenceService.deleteDiligence(diligence.id);
      addToast({
        type: 'success',
        title: 'Diligência excluída!',
        message: 'A diligência foi excluída com sucesso.'
      });
      refreshDiligences();
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao excluir',
        message: 'Não foi possível excluir a diligência. Tente novamente.'
      });
    } finally {
      setIsDeleting(null);
    }
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
    } else if (diffDays <= 3) {
      return { text: `${diffDays} dia(s) restante(s)`, color: 'text-yellow-600', urgent: true };
    } else {
      return { text: `${diffDays} dia(s) restante(s)`, color: 'text-green-600', urgent: false };
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState text="Carregando diligências..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Erro ao carregar diligências" 
          message={error} 
          onRetry={refreshDiligences} 
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600">{getPageDescription()}</p>
        </div>
        {canCreateDiligence() && (
          <Button onClick={() => navigate(user?.role === 'admin' ? '/diligences/new' : '/new-diligence')}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Diligência
          </Button>
        )}
      </div>

      <Card className="mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar diligências..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filtros
                {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                  <Badge variant="primary" className="ml-2">
                    {(statusFilter !== 'all' ? 1 : 0) + (priorityFilter !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
              
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5 por página</option>
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
              </select>
            </div>
          </div>
          
          {/* Filtros avançados */}
          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Filtros Avançados</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar Filtros
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos os Status</option>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todas as Prioridades</option>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                {filteredDiligences.length} diligência(s) encontrada(s)
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de Diligências */}
      {paginatedDiligences.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={diligences.length === 0 ? "Nenhuma diligência encontrada" : "Nenhum resultado para os filtros aplicados"}
          description={
            diligences.length === 0 
              ? "Ainda não há diligências cadastradas." 
              : "Tente ajustar os filtros de busca para encontrar o que procura."
          }
          action={
            canCreateDiligence() && diligences.length === 0 
              ? {
                  label: "Criar Primeira Diligência",
                  onClick: () => navigate(user?.role === 'admin' ? '/diligences/new' : '/new-diligence')
                }
              : {
                  label: "Limpar Filtros",
                  onClick: clearFilters,
                  variant: "outline"
                }
          }
        />
      ) : (
        <>
          <div className="grid gap-6 mb-6">
            {paginatedDiligences.map((diligence) => {
              const status = getStatusBadge(diligence.status);
              const priority = getPriorityBadge(diligence.priority);
              const timeRemaining = getTimeRemaining(diligence.deadline);
              const isBeingDeleted = isDeleting === diligence.id;
              
              return (
                <Card key={diligence.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{diligence.title}</h3>
                          <p className="text-gray-600 mb-2 line-clamp-2">{diligence.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant={status.variant}>{status.label}</Badge>
                            <Badge variant={priority.variant}>{priority.label}</Badge>
                            {timeRemaining.urgent && (
                              <Badge variant="danger">
                                <Clock className="h-3 w-3 mr-1" />
                                {timeRemaining.text}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-green-600 mb-1">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(diligence.value)}
                          </div>
                          <div className={`text-sm ${timeRemaining.color}`}>
                            {timeRemaining.text}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>Cliente: {diligence.client.name}</span>
                        </div>
                        
                        {/* Informações do correspondente - VISÍVEL APENAS PARA ADMIN */}
                        {user?.role === 'admin' && diligence.correspondent && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span>Correspondente: {diligence.correspondent.name}</span>
                          </div>
                        )}
                        
                        {/* Informações do correspondente - VISÍVEL APENAS PARA O PRÓPRIO CORRESPONDENTE */}
                        {user?.role === 'correspondent' && 
                         diligence.correspondent && 
                         user.id === diligence.correspondent.id && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span>Correspondente: {diligence.correspondent.name}</span>
                          </div>
                        )}
                        
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
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Criada em {format(new Date(diligence.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/${user?.role === 'admin' ? 'diligences' : 'my-diligences'}/${diligence.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          
                          {canEditDiligence(diligence) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/${user?.role === 'admin' ? 'diligences' : 'my-diligences'}/${diligence.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          )}
                          
                          {canDeleteDiligence(diligence) && (
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDeleteDiligence(diligence)}
                              disabled={isBeingDeleted}
                            >
                              {isBeingDeleted ? (
                                <span className="flex items-center">
                                  <span className="animate-spin h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full"></span>
                                  Excluindo...
                                </span>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Excluir
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={totalItems}
              itemsPerPage={currentItemsPerPage}
              className="mt-6"
            />
          )}
        </>
      )}
    </div>
  );
};

export default Diligences;