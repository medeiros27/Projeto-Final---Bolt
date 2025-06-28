import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";
import { AppError } from "../middlewares/errorHandler";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User) as UserRepository;
  }

  async registerClient(clientData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ email: clientData.email });
    if (existingUser) {
      throw new AppError("Email já registrado", 409);
    }

    const hashedPassword = await bcrypt.hash(clientData.password!, 10);

    const user = this.userRepository.create({
      ...clientData,
      password: hashedPassword,
      role: "client",
      status: "active", // Ou "pending", dependendo da sua lógica de negócio
    });

    await this.userRepository.save(user);
    return user;
  }

  async registerCorrespondent(correspondentData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ email: correspondentData.email });
    if (existingUser) {
      throw new AppError("Email já registrado", 409);
    }

    const hashedPassword = await bcrypt.hash(correspondentData.password!, 10);

    const user = this.userRepository.create({
      ...correspondentData,
      password: hashedPassword,
      role: "correspondent",
      status: "pending", // Correspondentes geralmente precisam de aprovação
    });

    await this.userRepository.save(user);
    return user;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await this.userRepository.findByEmailWithPassword(email); // Usando o método personalizado

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN });

    // Remova a senha do objeto do usuário antes de retornar
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword as User, token };
  }

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
      const user = await this.userRepository.findOneBy({ id: decoded.id });

      if (!user) {
        throw new AppError("Usuário não encontrado", 401);
      }

      return user;
    } catch (error) {
      throw new AppError("Token inválido ou expirado", 401);
    }
  }
}
