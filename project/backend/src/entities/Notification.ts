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
  id!: string;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: string;

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
  type!: "diligence_assigned" | "payment_received" | "deadline_reminder" | "feedback_received" | "system_update";

  @Column()
  title!: string;

  @Column("text")
  message!: string;

  @Column("jsonb", { nullable: true })
  data?: Record<string, any>;

  @Column({ default: false })
  read!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
