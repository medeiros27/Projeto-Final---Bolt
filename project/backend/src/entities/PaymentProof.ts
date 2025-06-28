import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { Diligence } from "./Diligence";
import { User } from "./User";

@Entity("payment_proofs")
export class PaymentProof {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToOne(() => Diligence, (diligence) => diligence.paymentProof)
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

  @Column({ nullable: true })
  pixKey?: string; // Usar "?" para propriedades opcionais

  @Column()
  proofImage: string;

  @Column({
    type: "enum",
    enum: ["pending_verification", "verified", "rejected"],
    default: "pending_verification",
  })
  // Correção: Definir o tipo TypeScript para corresponder ao enum do TypeORM
  status: "pending_verification" | "verified" | "rejected";

  @ManyToOne(() => User)
  @JoinColumn({ name: "uploadedById" })
  uploadedBy: User;

  @Column()
  uploadedById: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "verifiedById" })
  verifiedBy?: User; // Usar "?" para indicar que pode ser undefined

  @Column({ nullable: true })
  verifiedById?: string; // Usar "?" para indicar que pode ser undefined

  @Column({ type: "timestamp", nullable: true })
  verifiedAt?: Date; // Usar "?" para propriedades opcionais

  @Column({ nullable: true })
  rejectionReason?: string; // Usar "?" para propriedades opcionais

  @Column({ nullable: true })
  notes?: string; // Usar "?" para propriedades opcionais

  @UpdateDateColumn() // Adicionado UpdateDateColumn, comum em entidades
  updatedAt: Date;
}
