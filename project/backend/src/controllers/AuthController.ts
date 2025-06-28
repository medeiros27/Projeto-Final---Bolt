import { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { AuthService } from "../services/AuthService";
import { AppError } from "../middlewares/errorHandler";

export class AuthController {
  private userRepository: UserRepository;
  private authService: AuthService;

  constructor() {
    this.userRepository = new UserRepository();
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Email e senha são obrigatórios", 400);
    }

    const { user, token } = await this.authService.login(email, password);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone,
        oab: user.oab,
        city: user.city,
        state: user.state,
        companyName: user.companyName,
        cnpj: user.cnpj,
        address: user.address,
        verified: user.verified,
        specialties: user.specialties,
        coverage: user.coverage,
        rating: user.rating,
        totalDiligences: user.totalDiligences,
        completionRate: user.completionRate,
        responseTime: user.responseTime,
        createdAt: user.createdAt
      },
      token,
    });
  };

  registerClient = async (req: Request, res: Response): Promise<Response> => {
    const {
      name,
      email,
      password,
      phone,
      companyName,
      cnpj,
      address,
      city,
      state,
    } = req.body;

    if (!name || !email || !password) {
      throw new AppError("Dados obrigatórios não fornecidos", 400);
    }

    const user = await this.authService.registerClient({
      name,
      email,
      password,
      phone,
      companyName,
      cnpj,
      address,
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

  registerCorrespondent = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    const {
      name,
      email,
      password,
      phone,
      oab,
      city,
      state,
      specialties,
      coverage,
      // Removido experience e education, pois não estão na entidade User
    } = req.body;

    if (!name || !email || !password || !oab || !city || !state) {
      throw new AppError("Dados obrigatórios não fornecidos", 400);
    }

    const user = await this.authService.registerCorrespondent({
      name,
      email,
      password,
      phone,
      oab,
      city,
      state,
      specialties,
      coverage,
      // Removido experience e education do objeto passado
    });

    return res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  };
}
