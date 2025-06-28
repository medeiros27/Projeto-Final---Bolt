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

@Entity("attachments")
export class Attachment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  url!: string;

  @Column()
  type!: string; // Se houver tipos específicos (ex: \'image\', \'pdf\'), pode ser um enum

  @Column("int")
  size!: number;

  @ManyToOne(() => Diligence, (diligence) => diligence.attachments)
  @JoinColumn({ name: "diligenceId" })
  diligence!: Diligence;

  @Column()
  diligenceId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "uploadedById" })
  uploadedBy!: User;

  @Column()
  uploadedById!: string;

  @CreateDateColumn()
  uploadedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
