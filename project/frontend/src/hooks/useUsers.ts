import { useState, useEffect } from 'react';
import { User } from '../types';
import userService from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = () => {
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refreshUsers
  };
};

export const useCorrespondents = (state?: string, city?: string) => {
  const [correspondents, setCorrespondents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCorrespondents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getCorrespondents(state, city);
      setCorrespondents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar correspondentes');
    } finally {
      setLoading(false);
    }
  };

  const refreshCorrespondents = () => {
    loadCorrespondents();
  };

  useEffect(() => {
    loadCorrespondents();
  }, [state, city]);

  return {
    correspondents,
    loading,
    error,
    refreshCorrespondents
  };
};

export const usePendingCorrespondents = () => {
  const [pendingCorrespondents, setPendingCorrespondents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPendingCorrespondents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getPendingCorrespondents();
      setPendingCorrespondents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar correspondentes pendentes');
    } finally {
      setLoading(false);
    }
  };

  const refreshPendingCorrespondents = () => {
    loadPendingCorrespondents();
  };

  useEffect(() => {
    loadPendingCorrespondents();
  }, []);

  return {
    pendingCorrespondents,
    loading,
    error,
    refreshPendingCorrespondents
  };
};