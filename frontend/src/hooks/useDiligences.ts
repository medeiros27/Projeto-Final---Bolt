import { useState, useEffect, useCallback } from 'react';
import { Diligence } from '../types';
import diligenceService from '../services/diligenceService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para buscar diligências com base no perfil do utilizador autenticado.
 */
export const useDiligences = () => {
  const [diligences, setDiligences] = useState<Diligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Usamos useCallback para evitar que a função seja recriada em cada renderização
  const loadDiligences = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      // **CORREÇÃO: Agora chama apenas um método, pois o backend faz a lógica**
      const data = await diligenceService.getDiligences();
      setDiligences(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar diligências';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]); // A dependência agora é apenas o 'user'

  // Expõe uma função para que os componentes possam recarregar os dados
  const refreshDiligences = useCallback(() => {
    loadDiligences();
  }, [loadDiligences]);

  useEffect(() => {
    loadDiligences();
  }, [loadDiligences]); // O useEffect agora depende da função 'loadDiligences'

  return {
    diligences,
    loading,
    error,
    refreshDiligences
  };
};

/**
 * Hook para buscar diligências disponíveis para correspondentes.
 */
export const useAvailableDiligences = (state?: string, city?: string) => {
  const [diligences, setDiligences] = useState<Diligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usamos useCallback aqui também por consistência e performance
  const loadAvailableDiligences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // O serviço já faz a chamada correta para a API
      const data = await diligenceService.getAvailableDiligences(state, city);
      setDiligences(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar diligências disponíveis';
      console.error(errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [state, city]); // Recarrega quando os filtros de estado ou cidade mudam

  const refreshAvailableDiligences = useCallback(() => {
    loadAvailableDiligences();
  }, [loadAvailableDiligences]);

  useEffect(() => {
    loadAvailableDiligences();
  }, [loadAvailableDiligences]);

  return {
    diligences,
    loading,
    error,
    refreshAvailableDiligences
  };
};