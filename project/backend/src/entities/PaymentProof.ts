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
  type: string;

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  pixKey: string;

  @Column()
  proofImage: string;

  @Column({
    type: "enum",
    enum: ["pending_verification", "verified", "rejected"],
    default: "pending_verification",
  })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "uploadedById" })
  uploadedBy: User;

  @Column()
  uploadedById: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "verifiedById" })
  verifiedBy: User;

  @Column({ nullable: true })
  verifiedById: string;

  @Column({ type: "timestamp", nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  notes: string;
}