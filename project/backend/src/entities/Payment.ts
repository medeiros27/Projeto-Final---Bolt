import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Diligence } from "./Diligence";
import { User } from "./User";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Diligence, (diligence) => diligence.payments)
  @JoinColumn({ name: "diligenceId" })
  diligence!: Diligence;

  @Column()
  diligenceId!: string;

  @Column({
    type: "enum",
    enum: ["client_payment", "correspondent_payment"],
  })
  type!: "client_payment" | "correspondent_payment";

  @Column("decimal", { precision: 10, scale: 2 })
  amount!: number;

  @Column({
    type: "enum",
    enum: ["pending", "processing", "completed", "failed", "cancelled"],
    default: "pending",
  })
  status!: "pending" | "processing" | "completed" | "failed" | "cancelled";

  @Column({ default: "pix" })
  method!: string;

  @Column({ nullable: true })
  pixKey?: string;

  @Column({ type: "timestamp", nullable: true })
  dueDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  paidDate?: Date;

  @Column({ nullable: true })
  transactionId?: string;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => User, (user) => user.clientPayments, { nullable: true })
  @JoinColumn({ name: "clientId" })
  client?: User;

  @Column({ nullable: true })
  clientId?: string;

  @ManyToOne(() => User, (user) => user.correspondentPayments, { nullable: true })
  @JoinColumn({ name: "correspondentId" })
  correspondent?: User;

  @Column({ nullable: true })
  correspondentId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
