import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { User } from "./User";
import { Attachment } from "./Attachment";
import { Payment } from "./Payment";
import { PaymentProof } from "./PaymentProof";
import { StatusHistory } from "./StatusHistory";

@Entity("diligences")
export class Diligence {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column("text")
  description: string;

  @Column()
  type: string;

  @Column({
    type: "enum",
    enum: ["pending", "assigned", "in_progress", "completed", "cancelled", "disputed"],
    default: "pending",
  })
  status: string;

  @Column({
    type: "enum",
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  })
  priority: string;

  @Column("decimal", { precision: 10, scale: 2 })
  value: number;

  @Column({ type: "timestamp" })
  deadline: Date;

  @Column()
  city: string;

  @Column()
  state: string;

  @ManyToOne(() => User, (user) => user.clientDiligences)
  @JoinColumn({ name: "clientId" })
  client: User;

  @Column()
  clientId: string;

  @ManyToOne(() => User, (user) => user.correspondentDiligences, { nullable: true })
  @JoinColumn({ name: "correspondentId" })
  correspondent: User;

  @Column({ nullable: true })
  correspondentId: string;

  @OneToMany(() => Attachment, (attachment) => attachment.diligence)
  attachments: Attachment[];

  @OneToMany(() => Payment, (payment) => payment.diligence)
  payments: Payment[];

  @OneToOne(() => PaymentProof, (paymentProof) => paymentProof.diligence, { nullable: true })
  paymentProof: PaymentProof;

  @OneToMany(() => StatusHistory, (statusHistory) => statusHistory.diligence)
  statusHistory: StatusHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}