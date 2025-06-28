import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Repository } from "typeorm";

export class UserRepository extends Repository<User> {
  constructor() {
    super(User, AppDataSource.manager);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.email = :email", { email })
      .getOne();
  }

  async findCorrespondents(state?: string, city?: string): Promise<User[]> {
    const query = this
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
    return this.find({
      where: {
        role: "correspondent",
        status: "pending",
      },
    });
  }
}
