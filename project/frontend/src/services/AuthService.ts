import api from './api';
import { User } from '../types';
import { LoginFormData } from '../pages/Login'; // Supondo que você tenha este tipo

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Envia as credenciais para o endpoint de login da API.
   * @param credentials - Email e senha do usuário.
   * @returns Uma promessa com os dados do usuário e o token JWT.
   */
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    return api.post('/auth/login', credentials);
  }

  /**
   * Envia os dados de um novo usuário para o endpoint de registo.
   * @param userData - Dados do novo usuário.
   * @returns Uma promessa com os dados do usuário criado.
   */
  async register(userData: Partial<User>): Promise<User> {
    return api.post('/auth/register', userData);
  }
}

export default AuthService.getInstance();
