import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler";
import { UserRepository } from "../repositories/UserRepository";

interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
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

    req.user = {
      id: user.id,
      role: user.role,
    };

    return next();
  } catch (error) {
    throw new AppError("Token inválido", 401);
  }
};

export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Não autorizado", 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError("Permissão negada", 403);
    }

    return next();
  };
};