import React, { useState, useEffect } from 'react';
import UsersComponent from '../components/UI/Users';
import platformService from '../services/platformService';
import { User } from '../types';

const Users: React.FC = () => {
  // Estados para armazenar os dados, o estado de carregamento e possíveis erros
  const [clients, setClients] = useState<User[]>([]);
  const [correspondents, setCorrespondents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Função assíncrona para buscar todos os tipos de usuários
    const fetchAllUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Faz as chamadas à API em paralelo para mais eficiência
        const [fetchedClients, fetchedCorrespondents] = await Promise.all([
          platformService.getClients(),
          platformService.getCorrespondents()
        ]);

        setClients(fetchedClients);
        setCorrespondents(fetchedCorrespondents);

      } catch (err) {
        // Se qualquer uma das chamadas falhar, define a mensagem de erro
        setError("Não foi possível carregar os usuários. Verifique a conexão com a API.");
        console.error(err);
      } finally {
        // Garante que o estado de carregamento seja desativado ao final
        setIsLoading(false);
      }
    };

    fetchAllUsers();
  }, []); // O array vazio [] garante que esta função rode apenas uma vez

  // O componente UsersComponent provavelmente precisará ser ajustado
  // para receber as props: clients, correspondents, isLoading, e error.
  return (
    <UsersComponent
      clients={clients}
      correspondents={correspondents}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default Users;
