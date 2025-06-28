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
  id: string;

  @ManyToOne(() => Diligence, (diligence) => diligence.payments)
  @JoinColumn({ name: "diligenceId" })
  diligence: Diligence;

  @Column()
  diligenceId: string;

  @Column({
    type: "enum",
    enum: ["client_payment", "correspondent_payment"],
  })
  // Correção: Definir o tipo TypeScript para corresponder ao enum do TypeORM
  type: "client_payment" | "correspondent_payment";

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: ["pending", "processing", "completed", "failed", "cancelled"],
    default: "pending",
  })
  // Correção: Definir o tipo TypeScript para corresponder ao enum do TypeORM
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";

  @Column({ default: "pix" })
  method: string;

  @Column({ nullable: true })
  pixKey?: string; // Usar "?" para propriedades opcionais

  @Column({ type: "timestamp", nullable: true })
  dueDate?: Date; // Usar "?" para propriedades opcionais

  @Column({ type: "timestamp", nullable: true })
  paidDate?: Date; // Usar "?" para propriedades opcionais

  @Column({ nullable: true })
  transactionId?: string; // Usar "?" para propriedades opcionais

  @Column({ nullable: true })
  notes?: string; // Usar "?" para propriedades opcionais

  @ManyToOne(() => User, (user) => user.clientPayments, { nullable: true })
  @JoinColumn({ name: "clientId" })
  client?: User; // Usar "?" para indicar que pode ser undefined

  @Column({ nullable: true })
  clientId?: string; // Usar "?" para indicar que pode ser undefined

  @ManyToOne(() => User, (user) => user.correspondentPayments, { nullable: true })
  @JoinColumn({ name: "correspondentId" })
  correspondent?: User; // Usar "?" para indicar que pode ser undefined

  @Column({ nullable: true })
  correspondentId?: string; // Usar "?" para indicar que pode ser undefined

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
