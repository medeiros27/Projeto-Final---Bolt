import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserForm, { UserFormData } from '../components/Forms/UserForm';
import userService from '../services/userService';
import toast from 'react-hot-toast';

const NewUser: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    
    try {
      await userService.createUser(data);
      toast.success('Usuário criado com sucesso!');
      navigate('/users');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao criar usuário');
      }
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div className="p-6">
      <UserForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default NewUser;