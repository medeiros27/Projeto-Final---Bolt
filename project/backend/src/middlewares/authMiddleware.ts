import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";
import { UserRepository } from "../repositories/UserRepository";

// Definir o tipo para a carga útil do token
interface TokenPayload {
  id: string;
  role: 'admin' | 'client' | 'correspondent'; // Garantir que o role no token também seja específico
  iat: number;
  exp: number;
}

// SOLUÇÃO: Corrigir a interface para usar o tipo específico para 'role'
export interface IAuthRequest extends Request {
  user: {
    id: string;
    role: 'admin' | 'client' | 'correspondent';
  };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token não fornecido", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "jurisconnect_secret_key"
    ) as TokenPayload;

    const userRepository = new UserRepository();
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 401);
    }

    if (user.status !== "active") {
      throw new AppError("Usuário inativo ou pendente", 401);
    }

    // A conversão de tipo agora está consistente com a interface
    (req as IAuthRequest).user = {
      id: user.id,
      role: user.role as 'admin' | 'client' | 'correspondent',
    };

    return next();
  } catch (error) {
    throw new AppError("Token inválido", 401);
  }
};

export const checkRole = (roles: Array<'admin' | 'client' | 'correspondent'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authRequest = req as IAuthRequest;
    
    if (!authRequest.user) {
      throw new AppError("Não autorizado", 401);
    }

    if (!roles.includes(authRequest.user.role)) {
      throw new AppError("Permissão negada", 403);
    }

    return next();
  };
};
