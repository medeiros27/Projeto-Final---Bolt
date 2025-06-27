import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminAgenda from './AdminAgenda';
import ClientAgenda from './ClientAgenda';
import CorrespondentAgenda from './CorrespondentAgenda';

const AgendaManager: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminAgenda />;
    case 'client':
      return <ClientAgenda />;
    case 'correspondent':
      return <CorrespondentAgenda />;
    default:
      return null;
  }
};

export default AgendaManager;