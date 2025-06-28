import { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../middlewares/errorHandler";
import { User } from "../entities/User"; // Importe a entidade User
import { IAuthRequest } from "../middlewares/authMiddleware"; // Importe a interface IAuthRequest

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  getAllUsers = async (req: Request, res: Response): Promise<Response> => {
    const users = await this.userRepository.find(); // Alterado de findAll() para find()
    return res.json(users);
  };

  getUserById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const user = await this.userRepository.findOneBy({ id }); // Alterado de findById(id) para findOneBy({ id })

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return res.json(user);
  };

  createUser = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      throw new AppError("Dados obrigatórios não fornecidos", 400);
    }

    const existingUser = await this.userRepository.findOneBy({ email }); // Alterado de findByEmail(email) para findOneBy({ email })
    if (existingUser) {
      throw new AppError("Email já registrado", 409);
    }

    const user = this.userRepository.create({ name, email, password, role });
    await this.userRepository.save(user);

    return res.status(201).json(user);
  };

  updateUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { name, email, role, status, phone, oab, city, state, companyName, cnpj, address, verified, specialties, coverage, rating, totalDiligences, completionRate, responseTime } = req.body;

    const user = await this.userRepository.findOneBy({ id }); // Alterado de findById(id) para findOneBy({ id })

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Atualiza as propriedades do usuário
    this.userRepository.merge(user, { name, email, role, status, phone, oab, city, state, companyName, cnpj, address, verified, specialties, coverage, rating, totalDiligences, completionRate, responseTime });
    await this.userRepository.save(user);

    return res.json(user);
  };

  deleteUser = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const user = await this.userRepository.findOneBy({ id }); // Alterado de findById(id) para findOneBy({ id })

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    await this.userRepository.remove(user); // Use remove() para deletar a entidade

    return res.status(204).send();
  };

  // Métodos específicos para perfil do usuário logado
  getProfile = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    if (!authRequest.user || !authRequest.user.id) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const userId = authRequest.user.id;
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return res.json(user);
  };

  updateProfile = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    if (!authRequest.user || !authRequest.user.id) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const userId = authRequest.user.id;
    const { name, phone, city, state, address, specialties, coverage, companyName, cnpj, oab } = req.body;

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // Atualiza as propriedades do usuário
    this.userRepository.merge(user, { name, phone, city, state, address, specialties, coverage, companyName, cnpj, oab });
    await this.userRepository.save(user);

    return res.json(user);
  };

  // Métodos específicos para correspondentes
  getCorrespondents = async (req: Request, res: Response): Promise<Response> => {
    const { state, city } = req.query;
    const correspondents = await this.userRepository.findCorrespondents(state as string, city as string); // Mantém o método personalizado
    return res.json(correspondents);
  };

  getPendingCorrespondents = async (req: Request, res: Response): Promise<Response> => {
    const pendingCorrespondents = await this.userRepository.findPendingCorrespondents(); // Mantém o método personalizado
    return res.json(pendingCorrespondents);
  };

  approveCorrespondent = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const correspondent = await this.userRepository.findOneBy({ id }); // Alterado de findById(id) para findOneBy({ id })

    if (!correspondent) {
      throw new AppError("Correspondente não encontrado", 404);
    }

    if (correspondent.role !== "correspondent") {
      throw new AppError("Usuário não é um correspondente", 400);
    }

    correspondent.status = "active";
    await this.userRepository.save(correspondent);

    return res.json(correspondent);
  };

  rejectCorrespondent = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const correspondent = await this.userRepository.findOneBy({ id }); // Alterado de findById(id) para findOneBy({ id })

    if (!correspondent) {
      throw new AppError("Correspondente não encontrado", 404);
    }

    if (correspondent.role !== "correspondent") {
      throw new AppError("Usuário não é um correspondente", 400);
    }

    await this.userRepository.remove(correspondent); // Use remove() para deletar a entidade

    return res.status(204).send();
  };
}
