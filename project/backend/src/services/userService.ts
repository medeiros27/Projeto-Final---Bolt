import { User } from '../@types';
import { UserFormData } from '../components/Forms/UserForm';

// Simulação de API - em produção, isso seria substituído por chamadas HTTP reais
class UserService {
  private static instance: UserService;
  private users: User[] = [];

  private constructor() {
    this.loadMockData();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private loadMockData() {
    const mockData = localStorage.getItem('jurisconnect_users');
    if (mockData) {
      this.users = JSON.parse(mockData);
    } else {
      // Inicializar com usuários padrão se não existirem
      this.users = [
        {
          id: '1',
          name: 'Administrador',
          email: 'admin@jurisconnect.com',
          role: 'admin',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'João Silva',
          email: 'cliente@exemplo.com',
          role: 'client',
          status: 'active',
          createdAt: '2024-01-15T00:00:00Z',
          phone: '(11) 99999-9999'
        },
        {
          id: '3',
          name: 'Maria Santos',
          email: 'correspondente@exemplo.com',
          role: 'correspondent',
          status: 'active',
          createdAt: '2024-01-20T00:00:00Z',
          phone: '(11) 88888-8888',
          oab: 'SP123456',
          city: 'São Paulo',
          state: 'SP'
        }
      ];
      this.saveMockData();
    }
  }

  private saveMockData() {
    localStorage.setItem('jurisconnect_users', JSON.stringify(this.users));
  }

  async createUser(data: UserFormData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar se email já existe
    const existingUser = this.users.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      createdAt: new Date().toISOString(),
      phone: data.phone,
      oab: data.oab,
      city: data.city,
      state: data.state
    };

    this.users.push(newUser);
    this.saveMockData();

    return newUser;
  }

  async updateUser(id: string, data: Partial<UserFormData>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se email já existe (exceto para o próprio usuário)
    if (data.email) {
      const existingUser = this.users.find(u => u.email === data.email && u.id !== id);
      if (existingUser) {
        throw new Error('Email já está em uso');
      }
    }

    const updatedUser = {
      ...this.users[index],
      ...data,
      id // Garantir que o ID não seja alterado
    };

    this.users[index] = updatedUser;
    this.saveMockData();

    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('Usuário não encontrado');
    }

    // Não permitir deletar o último admin
    const user = this.users[index];
    if (user.role === 'admin') {
      const adminCount = this.users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        throw new Error('Não é possível deletar o último administrador');
      }
    }

    this.users.splice(index, 1);
    this.saveMockData();
  }

  async getUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.users.find(u => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.users.find(u => u.email === email) || null;
  }

  async getCorrespondents(state?: string, city?: string): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let correspondents = this.users.filter(u => u.role === 'correspondent' && u.status === 'active');
    
    if (state) {
      correspondents = correspondents.filter(u => u.state === state);
    }
    
    if (city) {
      correspondents = correspondents.filter(u => u.city?.toLowerCase().includes(city.toLowerCase()));
    }
    
    return correspondents;
  }

  async getPendingCorrespondents(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.users.filter(u => u.role === 'correspondent' && u.status === 'pending');
  }

  async approveCorrespondent(id: string): Promise<User> {
    return this.updateUser(id, { status: 'active' });
  }

  async rejectCorrespondent(id: string): Promise<void> {
    await this.deleteUser(id);
  }

  async updateUserStatus(id: string, status: User['status']): Promise<User> {
    return this.updateUser(id, { status });
  }
}

export default UserService.getInstance();