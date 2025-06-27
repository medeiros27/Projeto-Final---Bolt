import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../middlewares/errorHandler";
import { User } from "../entities/User";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user) {
      throw new AppError("Email ou senha incorretos", 401);
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("Email ou senha incorretos", 401);
    }

    if (user.status !== "active") {
      throw new AppError("Usuário inativo ou pendente de aprovação", 401);
    }

    const jwtSecret = process.env.JWT_SECRET || "jurisconnect_secret_key";
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";

    // Solução definitiva: forçar os tipos para resolver o problema do TypeScript
    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiresIn } as any
    );

    // Create a new user object without the password property
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as User, token };
  }

  async registerClient(clientData: any): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(clientData.email);

    if (existingUser) {
      throw new AppError("Email já está em uso", 400);
    }

    const hashedPassword = await bcrypt.hash(clientData.password, 8);

    const user = await this.userRepository.create({
      ...clientData,
      password: hashedPassword,
      role: "client",
      status: "active", // Clientes são ativados automaticamente
    });

    return user;
  }

  async registerCorrespondent(correspondentData: any): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(correspondentData.email);

    if (existingUser) {
      throw new AppError("Email já está em uso", 400);
    }

    // Validar OAB
    if (!correspondentData.oab || !/^[A-Z]{2}\d{4,6}$/.test(correspondentData.oab)) {
      throw new AppError("Número de OAB inválido", 400);
    }

    const hashedPassword = await bcrypt.hash(correspondentData.password, 8);

    const user = await this.userRepository.create({
      ...correspondentData,
      password: hashedPassword,
      role: "correspondent",
      status: "pending", // Correspondentes precisam ser aprovados
      verified: false,
      rating: 0,
      totalDiligences: 0,
      completionRate: 0,
      responseTime: 0,
    });

    return user;
  }
}