import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingState from '../components/UI/LoadingState';
import ErrorState from '../components/UI/ErrorState';
import { 
  RotateCcw, 
  History, 
  FileText, 
  DollarSign,
  User,
  Calendar,
  Search,
  Filter,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import statusManagementService from '../services/statusManagementService';

const StatusManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [reversions, setReversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadReversions();
  }, []);

  const loadReversions = async () => {
    try {
      setLoading(true);
      const allReversions = await statusManagementService.getAllReversions();
      const formattedReversions = statusManagementService.formatReversionHistory(allReversions);
      setReversions(formattedReversions);
    } catch (error) {
      console.error('Erro ao carregar reversões:', error);
      setError('Não foi possível carregar o histórico de reversões');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar reversões
  const filteredReversions = reversions.filter(reversion => {
    const matchesSearch = 
      reversion.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reversion.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reversion.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || reversion.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <History className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
            <p className="text-gray-600">
              Esta página é exclusiva para administradores do sistema.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState text="Carregando histórico de reversões..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState 
          title="Erro ao carregar histórico" 
          message={error} 
          onRetry={loadReversions} 
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Status</h1>
        <p className="text-gray-600">
          Histórico completo de reversões de status de diligências e pagamentos
        </p>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por status ou motivo..."
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
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {typeFilter !== 'all' && (
                  <Badge variant="primary" className="ml-2">1</Badge>
                )}
              </Button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Todos os Tipos</option>
                    <option value="Diligência">Diligências</option>
                    <option value="Pagamento">Pagamentos</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                {filteredReversions.length} reversão(ões) encontrada(s)
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Lista de Reversões */}
      <div className="space-y-4">
        {filteredReversions.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma reversão encontrada
              </h3>
              <p className="text-gray-600">
                {reversions.length === 0 
                  ? 'Ainda não há reversões de status registradas.' 
                  : 'Nenhuma reversão corresponde aos filtros aplicados.'
                }
              </p>
            </div>
          </Card>
        ) : (
          filteredReversions.map((reversion) => (
            <Card key={reversion.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-gray-100">
                  {reversion.type === 'Diligência' ? (
                    <FileText className="h-6 w-6 text-blue-600" />
                  ) : (
                    <DollarSign className="h-6 w-6 text-green-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Reversão de {reversion.type}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{reversion.date}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Status Anterior:</p>
                      <Badge 
                        variant={
                          reversion.from.includes('Concluída') || reversion.from.includes('Pago') 
                            ? 'success' 
                            : reversion.from.includes('Pendente') 
                              ? 'warning' 
                              : 'info'
                        }
                      >
                        {reversion.from}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Novo Status:</p>
                      <Badge 
                        variant={
                          reversion.to.includes('Concluída') || reversion.to.includes('Pago') 
                            ? 'success' 
                            : reversion.to.includes('Pendente') 
                              ? 'warning' 
                              : 'info'
                        }
                      >
                        {reversion.to}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Motivo:</p>
                    <p className="text-sm text-gray-900">{reversion.reason}</p>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="h-3 w-3 mr-1" />
                    <span>
                      Realizado por: {reversion.userId === '1' ? 'Administrador' : `Usuário ${reversion.userId}`}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StatusManagementPage;