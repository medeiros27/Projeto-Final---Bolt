import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1750980000000 implements MigrationInterface {
    name = 'CreateInitialSchema1750980000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela de usuários
        await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'client', 'correspondent');
            CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'pending', 'inactive', 'suspended');
            
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'client',
                "status" "public"."users_status_enum" NOT NULL DEFAULT 'pending',
                "phone" character varying,
                "oab" character varying,
                "city" character varying,
                "state" character varying,
                "companyName" character varying,
                "cnpj" character varying,
                "address" character varying,
                "verified" boolean NOT NULL DEFAULT false,
                "specialties" text,
                "coverage" text,
                "rating" double precision,
                "totalDiligences" integer,
                "completionRate" double precision,
                "responseTime" double precision,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela de diligências
        await queryRunner.query(`
            CREATE TYPE "public"."diligences_status_enum" AS ENUM('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed');
            CREATE TYPE "public"."diligences_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent');
            
            CREATE TABLE "diligences" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text NOT NULL,
                "type" character varying NOT NULL,
                "status" "public"."diligences_status_enum" NOT NULL DEFAULT 'pending',
                "priority" "public"."diligences_priority_enum" NOT NULL DEFAULT 'medium',
                "value" decimal(10,2) NOT NULL,
                "deadline" TIMESTAMP NOT NULL,
                "city" character varying NOT NULL,
                "state" character varying NOT NULL,
                "clientId" uuid NOT NULL,
                "correspondentId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_diligences" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela de anexos
        await queryRunner.query(`
            CREATE TABLE "attachments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "url" character varying NOT NULL,
                "type" character varying NOT NULL,
                "size" integer NOT NULL,
                "diligenceId" uuid NOT NULL,
                "uploadedById" uuid NOT NULL,
                "uploadedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_attachments" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela de pagamentos
        await queryRunner.query(`
            CREATE TYPE "public"."payments_type_enum" AS ENUM('client_payment', 'correspondent_payment');
            CREATE TYPE "public"."payments_status_enum" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');
            
            CREATE TABLE "payments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "diligenceId" uuid NOT NULL,
                "type" "public"."payments_type_enum" NOT NULL,
                "amount" decimal(10,2) NOT NULL,
                "status" "public"."payments_status_enum" NOT NULL DEFAULT 'pending',
                "method" character varying NOT NULL DEFAULT 'pix',
                "pixKey" character varying,
                "dueDate" TIMESTAMP,
                "paidDate" TIMESTAMP,
                "transactionId" character varying,
                "notes" character varying,
                "clientId" uuid,
                "correspondentId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_payments" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela de comprovantes de pagamento
        await queryRunner.query(`
            CREATE TYPE "public"."payment_proofs_type_enum" AS ENUM('client_payment', 'correspondent_payment');
            CREATE TYPE "public"."payment_proofs_status_enum" AS ENUM('pending_verification', 'verified', 'rejected');
            
            CREATE TABLE "payment_proofs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "diligenceId" uuid NOT NULL,
                "type" "public"."payment_proofs_type_enum" NOT NULL,
                "amount" decimal(10,2) NOT NULL,
                "pixKey" character varying,
                "proofImage" character varying NOT NULL,
                "status" "public"."payment_proofs_status_enum" NOT NULL DEFAULT 'pending_verification',
                "uploadedById" uuid NOT NULL,
                "uploadedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "verifiedById" uuid,
                "verifiedAt" TIMESTAMP,
                "rejectionReason" character varying,
                "notes" character varying,
                CONSTRAINT "REL_payment_proofs_diligenceId" UNIQUE ("diligenceId"),
                CONSTRAINT "PK_payment_proofs" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela de notificações
        await queryRunner.query(`
            CREATE TYPE "public"."notifications_type_enum" AS ENUM('diligence_assigned', 'payment_received', 'deadline_reminder', 'feedback_received', 'system_update');
            
            CREATE TABLE "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "type" "public"."notifications_type_enum" NOT NULL,
                "title" character varying NOT NULL,
                "message" text NOT NULL,
                "data" jsonb,
                "read" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
            )
        `);

        // Criar tabela de histórico de status
        await queryRunner.query(`
            CREATE TYPE "public"."status_history_entityType_enum" AS ENUM('diligence', 'payment');
            
            CREATE TABLE "status_history" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "diligenceId" uuid,
                "paymentId" uuid,
                "entityType" "public"."status_history_entityType_enum" NOT NULL,
                "paymentType" character varying,
                "previousStatus" character varying NOT NULL,
                "newStatus" character varying NOT NULL,
                "userId" uuid NOT NULL,
                "reason" text NOT NULL,
                "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_status_history" PRIMARY KEY ("id")
            )
        `);

        // Criar chaves estrangeiras
        await queryRunner.query(`
            ALTER TABLE "diligences" ADD CONSTRAINT "FK_diligences_clientId" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            ALTER TABLE "diligences" ADD CONSTRAINT "FK_diligences_correspondentId" FOREIGN KEY ("correspondentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            
            ALTER TABLE "attachments" ADD CONSTRAINT "FK_attachments_diligenceId" FOREIGN KEY ("diligenceId") REFERENCES "diligences"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "attachments" ADD CONSTRAINT "FK_attachments_uploadedById" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            
            ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_diligenceId" FOREIGN KEY ("diligenceId") REFERENCES "diligences"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_clientId" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_correspondentId" FOREIGN KEY ("correspondentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            
            ALTER TABLE "payment_proofs" ADD CONSTRAINT "FK_payment_proofs_diligenceId" FOREIGN KEY ("diligenceId") REFERENCES "diligences"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "payment_proofs" ADD CONSTRAINT "FK_payment_proofs_uploadedById" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            ALTER TABLE "payment_proofs" ADD CONSTRAINT "FK_payment_proofs_verifiedById" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
            
            ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            
            ALTER TABLE "status_history" ADD CONSTRAINT "FK_status_history_diligenceId" FOREIGN KEY ("diligenceId") REFERENCES "diligences"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
            ALTER TABLE "status_history" ADD CONSTRAINT "FK_status_history_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);

        // Criar usuário admin padrão
        await queryRunner.query(`
            INSERT INTO "users" ("name", "email", "password", "role", "status")
            VALUES ('Administrador', 'admin@jurisconnect.com', '$2a$08$Cf1f11ePArKlBJomM0F6a.8tWyCd0chvbuVwE1Ln/ltILweLqkKOK', 'admin', 'active')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover chaves estrangeiras
        await queryRunner.query(`
            ALTER TABLE "diligences" DROP CONSTRAINT "FK_diligences_clientId";
            ALTER TABLE "diligences" DROP CONSTRAINT "FK_diligences_correspondentId";
            
            ALTER TABLE "attachments" DROP CONSTRAINT "FK_attachments_diligenceId";
            ALTER TABLE "attachments" DROP CONSTRAINT "FK_attachments_uploadedById";
            
            ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_diligenceId";
            ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_clientId";
            ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_correspondentId";
            
            ALTER TABLE "payment_proofs" DROP CONSTRAINT "FK_payment_proofs_diligenceId";
            ALTER TABLE "payment_proofs" DROP CONSTRAINT "FK_payment_proofs_uploadedById";
            ALTER TABLE "payment_proofs" DROP CONSTRAINT "FK_payment_proofs_verifiedById";
            
            ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_userId";
            
            ALTER TABLE "status_history" DROP CONSTRAINT "FK_status_history_diligenceId";
            ALTER TABLE "status_history" DROP CONSTRAINT "FK_status_history_userId";
        `);

        // Remover tabelas
        await queryRunner.query(`DROP TABLE "status_history"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "payment_proofs"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`DROP TABLE "diligences"`);
        await queryRunner.query(`DROP TABLE "users"`);

        // Remover enums
        await queryRunner.query(`DROP TYPE "public"."status_history_entityType_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_proofs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_proofs_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payments_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."diligences_priority_enum"`);
        await queryRunner.query(`DROP TYPE "public"."diligences_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }
}