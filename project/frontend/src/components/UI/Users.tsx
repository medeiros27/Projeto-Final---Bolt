import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';
import { usePagination } from '../../hooks/usePagination';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import Pagination from './Pagination';
import ConfirmModal from '../Modals/ConfirmModal';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  UserX,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '../UI/ToastContainer';
import userService from '../../services/userService';

const Users: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { users, loading, error, refreshUsers } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'approve' | 'reject';
    user: any;
    title: string;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar usuários
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Paginação
  const {
    currentPage,
    totalPages,
    currentData: paginatedUsers,
    goToPage,
    itemsPerPage: currentItemsPerPage,
    setItemsPerPage: updateItemsPerPage,
    totalItems
  } = usePagination({
    data: filteredUsers,
    itemsPerPage,
    persistKey: 'users_list'
  });

  // Atualizar itemsPerPage quando o estado local mudar
  useEffect(() => {
    updateItemsPerPage(itemsPerPage);
  }, [itemsPerPage, updateItemsPerPage]);

  const getRoleBadge = (role: string) => {
    const roleMap = {
      admin: { variant: 'danger' as const, label: 'Administrador' },
      client: { variant: 'info' as const, label: 'Cliente' },
      correspondent: { variant: 'success' as const, label: 'Correspondente' }
    };
    
    return roleMap[role as keyof typeof roleMap] || { variant: 'default' as const, label: role };
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { variant: 'success' as const, label: 'Ativo' },
      pending: { variant: 'warning' as const, label: 'Pendente' },
      inactive: { variant: 'danger' as const, label: 'Inativo' }
    };
    
    return statusMap[status as keyof typeof statusMap] || { variant: 'default' as const, label: status };
  };

  const handleDeleteUser = async () => {
    if (!confirmAction || confirmAction.type !== 'delete') return;

    setIsLoading(true);
    try {
      await userService.deleteUser(confirmAction.user.id);
      addToast({
        type: 'success',
        title: 'Usuário excluído!',
        message: 'O usuário foi excluído com sucesso.'
      });
      refreshUsers();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      if (error instanceof Error) {
        addToast({
          type: 'error',
          title: 'Erro ao excluir',
          message: error.message
        });
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao excluir',
          message: 'Não foi possível excluir o usuário. Tente novamente.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCorrespondent = async () => {
    if (!confirmAction || confirmAction.type !== 'approve') return;

    setIsLoading(true);
    try {
      await userService.approveCorrespondent(confirmAction.user.id);
      addToast({
        type: 'success',
        title: 'Correspondente aprovado!',
        message: 'O correspondente foi aprovado com sucesso.'
      });
      refreshUsers();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao aprovar',
        message: 'Não foi possível aprovar o correspondente. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectCorrespondent = async () => {
    if (!confirmAction || confirmAction.type !== 'reject') return;

    setIsLoading(true);
    try {
      await userService.rejectCorrespondent(confirmAction.user.id);
      addToast({
        type: 'success',
        title: 'Correspondente rejeitado',
        message: 'O correspondente foi rejeitado com sucesso.'
      });
      refreshUsers();
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao rejeitar',
        message: 'Não foi possível rejeitar o correspondente. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case 'delete':
        await handleDeleteUser();
        break;
      case 'approve':
        await handleApproveCorrespondent();
        break;
      case 'reject':
        await handleRejectCorrespondent();
        break;
    }
  };

  const openConfirmModal = (type: 'delete' | 'approve' | 'reject', user: any) => {
    const actions = {
      delete: {
        title: 'Excluir Usuário',
        message: `Tem certeza que deseja excluir o usuário "${user.name}"? Esta ação não pode ser desfeita.`
      },
      approve: {
        title: 'Aprovar Correspondente',
        message: `Tem certeza que deseja aprovar o correspondente "${user.name}"? Ele poderá receber diligências após a aprovação.`
      },
      reject: {
        title: 'Rejeitar Correspondente',
        message: `Tem certeza que deseja rejeitar o correspondente "${user.name}"? O cadastro será removido do sistema.`
      }
    };

    setConfirmAction({
      type,
      user,
      ...actions[type]
    });
    setShowConfirmModal(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState text="Carregando usuários..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Erro ao carregar usuários" 
          message={error} 
          onRetry={refreshUsers} 
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600">Gerencie todos os usuários do sistema</p>
        </div>
        <Button onClick={() => navigate('/users/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
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
                {(roleFilter !== 'all' || statusFilter !== 'all') && (
                  <Badge variant="primary" className="ml-2">
                    {(roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos os Perfis</option>
                    <option value="admin">Administrador</option>
                    <option value="client">Cliente</option>
                    <option value="correspondent">Correspondente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="active">Ativo</option>
                    <option value="pending">Pendente</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                {filteredUsers.length} usuário(s) encontrado(s)
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de Usuários */}
      {paginatedUsers.length === 0 ? (
        <EmptyState
          icon={Search}
          title={users.length === 0 ? "Nenhum usuário encontrado" : "Nenhum resultado para os filtros aplicados"}
          description={
            users.length === 0 
              ? "Ainda não há usuários cadastrados." 
              : "Tente ajustar os filtros de busca para encontrar o que procura."
          }
          action={
            users.length === 0 
              ? {
                  label: "Criar Primeiro Usuário",
                  onClick: () => navigate('/users/new')
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
            {paginatedUsers.map((user) => {
              const role = getRoleBadge(user.role);
              const status = getStatusBadge(user.status);
              
              return (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          <Badge variant={role.variant}>{role.label}</Badge>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2" />
                            <span>{user.email}</span>
                          </div>
                          
                          {user.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          
                          {user.city && user.state && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{user.city}, {user.state}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Cadastro: {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </div>
                          
                          {user.oab && (
                            <div className="flex items-center">
                              <UserCheck className="h-4 w-4 mr-2" />
                              <span>OAB: {user.oab}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      {user.status === 'pending' && user.role === 'correspondent' && (
                        <>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => openConfirmModal('approve', user)}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => openConfirmModal('reject', user)}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => openConfirmModal('delete', user)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
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

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        type={confirmAction?.type === 'approve' ? 'success' : 'danger'}
        isLoading={isLoading}
        confirmText={
          confirmAction?.type === 'approve' ? 'Aprovar' :
          confirmAction?.type === 'reject' ? 'Rejeitar' : 'Excluir'
        }
      />
    </div>
  );
};

export default Users;