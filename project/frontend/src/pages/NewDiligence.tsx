import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DiligenceForm, { DiligenceFormData } from '../components/Forms/DiligenceForm';
import diligenceService from '../services/diligenceService';
import userService from '../services/userService';
import { useToast } from '../components/UI/ToastContainer';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const NewDiligence: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Partial<DiligenceFormData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pré-carregar dados iniciais se necessário
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Se for cliente, pré-preencher cidade e estado
        if (user?.role === 'client' && user.city && user.state) {
          setInitialData({
            city: user.city,
            state: user.state
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadInitialData();
    }
  }, [user]);

  const handleSubmit = async (data: DiligenceFormData) => {
    if (!user) {
      addToast({
        type: 'error',
        title: 'Usuário não autenticado',
        message: 'Você precisa estar logado para criar uma diligência'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await diligenceService.createDiligence(data, user.id);
      
      addToast({
        type: 'success',
        title: 'Diligência criada!',
        message: 'A diligência foi criada com sucesso.'
      });
      
      // Redirecionar para a página apropriada
      if (user.role === 'admin') {
        navigate('/diligences');
      } else {
        navigate('/my-diligences');
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao criar diligência',
        message: 'Ocorreu um erro ao criar a diligência. Tente novamente.'
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <LoadingSpinner size="lg" text="Carregando..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nova Diligência</h1>
        <p className="text-gray-600">
          Preencha os dados para criar uma nova diligência jurídica
        </p>
      </div>

      <DiligenceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        initialData={initialData}
      />
    </div>
  );
};

export default NewDiligence;