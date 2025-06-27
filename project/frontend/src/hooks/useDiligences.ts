import { useState, useEffect } from 'react';
import { Diligence } from '../types';
import diligenceService from '../services/diligenceService';
import { useAuth } from '../contexts/AuthContext';

export const useDiligences = () => {
  const [diligences, setDiligences] = useState<Diligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadDiligences = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: Diligence[];
      
      if (user?.role === 'admin') {
        data = await diligenceService.getDiligences();
      } else if (user?.role === 'client') {
        data = await diligenceService.getDiligencesByClient(user.id);
      } else if (user?.role === 'correspondent') {
        data = await diligenceService.getDiligencesByCorrespondent(user.id);
      } else {
        data = [];
      }
      
      setDiligences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar diligências');
    } finally {
      setLoading(false);
    }
  };

  const refreshDiligences = () => {
    loadDiligences();
  };

  useEffect(() => {
    if (user) {
      loadDiligences();
    }
  }, [user]);

  return {
    diligences,
    loading,
    error,
    refreshDiligences
  };
};

export const useAvailableDiligences = (state?: string, city?: string) => {
  const [diligences, setDiligences] = useState<Diligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableDiligences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await diligenceService.getAvailableDiligences(state, city);
      setDiligences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar diligências disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const refreshAvailableDiligences = () => {
    loadAvailableDiligences();
  };

  useEffect(() => {
    loadAvailableDiligences();
  }, [state, city]);

  return {
    diligences,
    loading,
    error,
    refreshAvailableDiligences
  };
};