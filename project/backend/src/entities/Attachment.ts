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

@Entity("attachments")
export class Attachment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column()
  type: string;

  @Column("int")
  size: number;

  @ManyToOne(() => Diligence, (diligence) => diligence.attachments)
  @JoinColumn({ name: "diligenceId" })
  diligence: Diligence;

  @Column()
  diligenceId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "uploadedById" })
  uploadedBy: User;

  @Column()
  uploadedById: string;

  @CreateDateColumn()
  uploadedAt: Date;
}