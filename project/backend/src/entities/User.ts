import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Diligence } from "./Diligence";
import { Notification } from "./Notification";
import { Payment } from "./Payment";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string; // Adicionado '!'

  @Column()
  name!: string; // Adicionado '!'

  @Column({ unique: true })
  email!: string; // Adicionado '!'

  @Column({ select: false })
  password!: string; // Adicionado '!'

  @Column({
    type: "enum",
    enum: ["admin", "client", "correspondent"],
    default: "client",
  })
  role!: "admin" | "client" | "correspondent"; // Adicionado '!'

  @Column({
    type: "enum",
    enum: ["active", "pending", "inactive", "suspended"],
    default: "pending",
  })
  status!: "active" | "pending" | "inactive" | "suspended"; // Adicionado '!'

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  oab?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  companyName?: string;

  @Column({ nullable: true })
  cnpj?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: false })
  verified!: boolean; // Adicionado '!'

  @Column("simple-array", { nullable: true })
  specialties?: string[];

  @Column("simple-array", { nullable: true })
  coverage?: string[];

  @Column({ type: "float", nullable: true })
  rating?: number;

  @Column({ nullable: true })
  totalDiligences?: number;

  @Column({ type: "float", nullable: true })
  completionRate?: number;

  @Column({ type: "float", nullable: true })
  responseTime?: number;

  @OneToMany(() => Diligence, (diligence) => diligence.client)
  clientDiligences!: Diligence[]; // Adicionado '!'

  @OneToMany(() => Diligence, (diligence) => diligence.correspondent)
  correspondentDiligences!: Diligence[]; // Adicionado '!'

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[]; // Adicionado '!'

  @OneToMany(() => Payment, (payment) => payment.client)
  clientPayments!: Payment[]; // Adicionado '!'

  @OneToMany(() => Payment, (payment) => payment.correspondent)
  correspondentPayments!: Payment[]; // Adicionado '!'

  @CreateDateColumn()
  createdAt!: Date; // Adicionado '!'

  @UpdateDateColumn()
  updatedAt!: Date; // Adicionado '!'
}
