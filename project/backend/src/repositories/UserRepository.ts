import { Repository } from "typeorm";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { AppError } from "../middlewares/errorHandler";

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email })
      .getOne();
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }
    
    this.repository.merge(user, userData);
    return this.repository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findCorrespondents(state?: string, city?: string): Promise<User[]> {
    const query = this.repository
      .createQueryBuilder("user")
      .where("user.role = :role", { role: "correspondent" })
      .andWhere("user.status = :status", { status: "active" });

    if (state) {
      query.andWhere("user.state = :state", { state });
    }

    if (city) {
      query.andWhere("user.city ILIKE :city", { city: `%${city}%` });
    }

    return query.getMany();
  }

  async findPendingCorrespondents(): Promise<User[]> {
    return this.repository.find({
      where: {
        role: "correspondent",
        status: "pending",
      },
    });
  }
}