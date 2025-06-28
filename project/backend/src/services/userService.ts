import { User } from '../entities/User'; // Importe a entidade User
import { UserRepository } from '../repositories/UserRepository';

// Definição da interface UserFormData (anteriormente importada do frontend)
interface UserFormData {
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  oab?: string;
  city?: string;
  state?: string;
  // Adicione outras propriedades que seu formulário de usuário pode ter
}

class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(data: UserFormData): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ email: data.email });
    if (existingUser) {
      throw new Error("Email já está em uso");
    }

    const newUser = this.userRepository.create({
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      createdAt: new Date().toISOString(),
      phone: data.phone,
      oab: data.oab,
      city: data.city,
      state: data.state
    });
    await this.userRepository.save(newUser);
    return newUser;
  }

  async updateUser(id: string, data: Partial<UserFormData>): Promise<User> {
    const userToUpdate = await this.userRepository.findOneBy({ id });
    if (!userToUpdate) {
      throw new Error("Usuário não encontrado");
    }

    if (data.email && data.email !== userToUpdate.email) {
      const existingUser = await this.userRepository.findOneBy({ email: data.email });
      if (existingUser && existingUser.id !== id) {
        throw new Error("Email já está em uso");
      }
    }

    Object.assign(userToUpdate, data);
    await this.userRepository.save(userToUpdate);
    return userToUpdate;
  }

  async deleteUser(id: string): Promise<void> {
    const userToDelete = await this.userRepository.findOneBy({ id });
    if (!userToDelete) {
      throw new Error("Usuário não encontrado");
    }

    if (userToDelete.role === 'admin') {
      const adminCount = await this.userRepository.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        throw new Error("Não é possível deletar o último administrador");
      }
    }

    await this.userRepository.remove(userToDelete);
  }

  async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOneBy({ email });
  }

  async getCorrespondents(state?: string, city?: string): Promise<User[]> {
    const whereClause: any = { role: 'correspondent', status: 'active' };
    if (state) {
      whereClause.state = state;
    }
    if (city) {
      whereClause.city = city;
    }
    return this.userRepository.find({ where: whereClause });
  }

  async getPendingCorrespondents(): Promise<User[]> {
    return this.userRepository.find({ where: { role: 'correspondent', status: 'pending' } });
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

export default new UserService();
