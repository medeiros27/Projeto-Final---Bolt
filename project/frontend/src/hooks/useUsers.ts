import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import userService from '../services/userService';

/**
 * Hook para buscar todos os utilizadores (geralmente para Admins).
 */
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar utilizadores';
      console.error(errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUsers = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return { users, loading, error, refreshUsers };
};

/**
 * Hook para buscar correspondentes com filtros opcionais.
 */
export const useCorrespondents = (state?: string, city?: string) => {
  const [correspondents, setCorrespondents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCorrespondents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // O serviço já faz a chamada correta para a API
      const data = await userService.getCorrespondents(state, city);
      setCorrespondents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar correspondentes';
      console.error(errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [state, city]);

  const refreshCorrespondents = useCallback(() => {
    loadCorrespondents();
  }, [loadCorrespondents]);

  useEffect(() => {
    loadCorrespondents();
  }, [loadCorrespondents]);

  return { correspondents, loading, error, refreshCorrespondents };
};

/**
 * Hook para buscar correspondentes com registo pendente.
 */
export const usePendingCorrespondents = () => {
  const [pendingCorrespondents, setPendingCorrespondents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPendingCorrespondents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Assumindo que userService.getPendingCorrespondents() existe e chama a API
      const data = await userService.getPendingCorrespondents();
      setPendingCorrespondents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar correspondentes pendentes';
      console.error(errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPendingCorrespondents = useCallback(() => {
    loadPendingCorrespondents();
  }, [loadPendingCorrespondents]);

  useEffect(() => {
    loadPendingCorrespondents();
  }, [loadPendingCorrespondents]);

  return {
    pendingCorrespondents,
    loading,
    error,
    refreshPendingCorrespondents
  };
};
