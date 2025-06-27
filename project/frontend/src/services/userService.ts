import api from './api';
import { User } from '../types';
import { UserFormData } from '../components/Forms/UserForm';

class UserService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Busca todos os utilizadores da API.
   */
  async getUsers(): Promise<User[]> {
    return api.get('/users');
  }

  /**
   * Busca um utilizador específico pelo seu ID.
   */
  async getUserById(id: string): Promise<User | null> {
    return api.get(`/users/${id}`);
  }

  /**
   * Cria um novo utilizador.
   */
  async createUser(data: UserFormData): Promise<User> {
    return api.post('/users', data);
  }

  /**
   * Atualiza um utilizador existente.
   */
  async updateUser(id: string, data: Partial<UserFormData>): Promise<User> {
    return api.put(`/users/${id}`, data);
  }

  /**
   * Elimina um utilizador.
   */
  async deleteUser(id: string): Promise<void> {
    return api.delete(`/users/${id}`);
  }

  /**
   * Aprova o registo de um correspondente.
   */
  async approveCorrespondent(id: string): Promise<User> {
    return api.patch(`/users/${id}/approve`);
  }
}

export default UserService.getInstance();
