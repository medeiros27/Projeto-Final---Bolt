import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: "enum",
    enum: [
      "diligence_assigned",
      "payment_received",
      "deadline_reminder",
      "feedback_received",
      "system_update",
    ],
  })
  // Correção: Definir o tipo TypeScript para corresponder ao enum do TypeORM
  type: "diligence_assigned" | "payment_received" | "deadline_reminder" | "feedback_received" | "system_update";

  @Column()
  title: string;

  @Column("text")
  message: string;

  @Column("jsonb", { nullable: true })
  data?: Record<string, any>; // Usar "?" para propriedades opcionais

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;

  // @UpdateDateColumn() // Opcional: Adicione se precisar de uma coluna de data de atualização
  // updatedAt: Date;
}
