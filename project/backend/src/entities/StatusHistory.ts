import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Diligence } from "./Diligence";
import { User } from "./User";

@Entity("status_history")
export class StatusHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Diligence, (diligence) => diligence.statusHistory)
  @JoinColumn({ name: "diligenceId" })
  diligence: Diligence;

  @Column({ nullable: true })
  diligenceId: string;

  @Column({ nullable: true })
  paymentId: string;

  @Column({
    type: "enum",
    enum: ["diligence", "payment"],
  })
  entityType: string;

  @Column({ nullable: true })
  paymentType: string;

  @Column()
  previousStatus: string;

  @Column()
  newStatus: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @Column("text")
  reason: string;

  @CreateDateColumn()
  timestamp: Date;
}