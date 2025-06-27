import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DiligenceForm, { DiligenceFormData } from '../components/Forms/DiligenceForm';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import diligenceService from '../services/diligenceService';
import financialService from '../services/financialService';
import { useToast } from '../components/UI/ToastContainer';

const EditDiligence: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [diligence, setDiligence] = useState<any>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDiligence = async () => {
      if (!id) {
        setError('ID da diligência não fornecido');
        setLoading(false);
        return;
      }

      try {
        const data = await diligenceService.getDiligenceById(id);
        if (!data) {
          setError('Diligência não encontrada');
        } else {
          setDiligence(data);
          
          // Carregar dados financeiros (apenas para admin)
          if (user?.role === 'admin') {
            const finData = await financialService.getFinancialDataByDiligence(id);
            setFinancialData(finData);
          }
        }
      } catch (err) {
        setError('Erro ao carregar diligência');
      } finally {
        setLoading(false);
      }
    };

    loadDiligence();
  }, [id, user]);

  const handleSubmit = async (data: DiligenceFormData) => {
    if (!id || !user) {
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Dados incompletos para atualização'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await diligenceService.updateDiligence(id, data);
      
      addToast({
        type: 'success',
        title: 'Diligência atualizada!',
        message: 'A diligência foi atualizada com sucesso.'
      });
      
      // Redirecionar para a página de detalhes
      if (user.role === 'admin') {
        navigate(`/diligences/${id}`);
      } else {
        navigate(`/my-diligences/${id}`);
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao atualizar',
        message: 'Ocorreu um erro ao atualizar a diligência.'
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const canEditDiligence = (): boolean => {
    if (!user || !diligence) return false;
    
    // Administrador pode editar qualquer diligência
    if (user.role === 'admin') return true;
    
    // Cliente só pode editar suas próprias diligências pendentes
    if (user.role === 'client') {
      return diligence.clientId === user.id && diligence.status === 'pending';
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Carregando diligência..." />
        </div>
      </div>
    );
  }

  if (error || !diligence) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Diligência não encontrada'}
            </h3>
            <Button onClick={() => navigate(-1)}>
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!canEditDiligence()) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Permissão Negada
            </h3>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para editar esta diligência.
              {diligence.status !== 'pending' && ' Apenas diligências pendentes podem ser editadas.'}
            </p>
            <Button onClick={() => navigate(-1)}>
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Preparar dados iniciais para o formulário
  const initialData: DiligenceFormData = {
    title: diligence.title,
    description: diligence.description,
    type: diligence.type,
    priority: diligence.priority,
    value: diligence.value,
    deadline: diligence.deadline,
    city: diligence.city,
    state: diligence.state,
    attachments: [], // Não podemos passar os anexos existentes diretamente, pois são objetos diferentes
    clientId: diligence.clientId,
    correspondentId: diligence.correspondentId
  };

  // Adicionar valor do correspondente para administradores
  if (user.role === 'admin' && financialData) {
    initialData.correspondentValue = financialData.custo;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <h1 className="text-2xl font-bold text-gray-900">Editar Diligência</h1>
        <p className="text-gray-600">
          Atualize as informações da diligência conforme necessário
        </p>
      </div>

      <DiligenceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialData={initialData}
        isEditing={true}
      />
    </div>
  );
};

export default EditDiligence;