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

  @ManyToOne(() => Diligence, (diligence) => diligence.statusHistory, { nullable: true }) // Diligence pode ser opcional
  @JoinColumn({ name: "diligenceId" })
  diligence?: Diligence; // Usar "?" para indicar que pode ser undefined

  @Column({ nullable: true })
  diligenceId?: string; // Usar "?" para propriedades opcionais

  @Column({ nullable: true })
  paymentId?: string; // Usar "?" para propriedades opcionais

  @Column({
    type: "enum",
    enum: ["diligence", "payment"],
  })
  // Correção: Definir o tipo TypeScript para corresponder ao enum do TypeORM
  entityType: "diligence" | "payment";

  @Column({ nullable: true })
  paymentType?: string; // Usar "?" para propriedades opcionais

  @Column()
  previousStatus: string;

  @Column()
  newStatus: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  userId: string;

  @Column("text", { nullable: true }) // Razão pode ser opcional
  reason?: string; // Usar "?" para propriedades opcionais

  @CreateDateColumn()
  timestamp: Date;

  // @UpdateDateColumn() // Opcional: Adicione se precisar de uma coluna de data de atualização
  // updatedAt: Date;
}
