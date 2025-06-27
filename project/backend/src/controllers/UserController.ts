import { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../middlewares/errorHandler";
// Importar a interface IAuthRequest do nosso middleware
import { IAuthRequest } from "../middlewares/authMiddleware";

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    const users = await this.userRepository.findAll();
    return res.json(users);
  };

  getUserById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return res.json(user);
  };

  createUser = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, password, role, status, phone, oab, city, state } = req.body;

    if (!name || !email || !password || !role) {
      throw new AppError("Dados obrigatórios não fornecidos", 400);
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("Email já está em uso", 400);
    }

    const user = await this.userRepository.create({
      name,
      email,
      password,
      role,
      status: status || "active",
      phone,
      oab,
      city,
      state,
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  };

  // 2. Mantenha a assinatura padrão e faça a conversão de tipo internamente
  getProfile = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    if (!authRequest.user || !authRequest.user.id) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const userId = authRequest.user.id;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return res.json(user);
  };

  // 3. Fazer o mesmo para updateProfile
  updateProfile = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    if (!authRequest.user || !authRequest.user.id) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const userId = authRequest.user.id;
    const { name, phone, city, state, address } = req.body;

    const updatedUser = await this.userRepository.update(userId, {
      name,
      phone,
      city,
      state,
      address,
    });

    return res.json(updatedUser);
  };

  getCorrespondents = async (req: Request, res: Response): Promise<Response> => {
    const { state, city } = req.query;
    
    const correspondents = await this.userRepository.findCorrespondents(
      state as string,
      city as string
    );
    
    return res.json(correspondents);
  };

  getPendingCorrespondents = async (req: Request, res: Response): Promise<Response> => {
    const pendingCorrespondents = await this.userRepository.findPendingCorrespondents();
    return res.json(pendingCorrespondents);
  };

  approveCorrespondent = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    
    const correspondent = await this.userRepository.findById(id);
    
    if (!correspondent) {
      throw new AppError("Correspondente não encontrado", 404);
    }
    
    if (correspondent.role !== "correspondent") {
      throw new AppError("Usuário não é um correspondente", 400);
    }
    
    const updatedCorrespondent = await this.userRepository.update(id, {
      status: "active",
      verified: true,
    });
    
    return res.json(updatedCorrespondent);
  };

  rejectCorrespondent = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    
    const correspondent = await this.userRepository.findById(id);
    
    if (!correspondent) {
      throw new AppError("Correspondente não encontrado", 404);
    }
    
    if (correspondent.role !== "correspondent") {
      throw new AppError("Usuário não é um correspondente", 400);
    }
    
    await this.userRepository.delete(id);
    
    return res.status(204).send();
  };
}
