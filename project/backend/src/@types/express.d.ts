import { User } from '../entities/User';

// Define o tipo para a carga útil (payload) do usuário que será anexada ao objeto Request
interface UserPayload {
  id: string;
  role: 'admin' | 'client' | 'correspondent';
  // Adicione aqui outras propriedades do usuário que você possa precisar do token JWT
}

// Estende a interface global do Express para incluir a propriedade 'user'
declare global {
  namespace Express {
    export interface Request {
      user?: User; // O '?' torna a propriedade opcional, pois nem todas as rotas a terão
    }
  }
}

// A linha abaixo é importante para garantir que o TypeScript trate este arquivo como um módulo.
export {};