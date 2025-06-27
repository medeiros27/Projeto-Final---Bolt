import "reflect-metadata";
import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Diligence } from "./entities/Diligence";
import { Attachment } from "./entities/Attachment";
import { Payment } from "./entities/Payment";
import { PaymentProof } from "./entities/PaymentProof";
import { Notification } from "./entities/Notification";
import { StatusHistory } from "./entities/StatusHistory";
import { CreateInitialSchema1750980000000 } from "./migrations/1750980000000-CreateInitialSchema";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "001516", // Lembre-se de usar a senha correta
    database: process.env.DB_DATABASE || "jurisconnect",
    synchronize: process.env.NODE_ENV === "development", // Use 'false' em produção
    logging: process.env.NODE_ENV === "development",
    entities: [
        User, 
        Diligence, 
        Attachment, 
        Payment, 
        PaymentProof, 
        Notification, 
        StatusHistory
    ],
    migrations: [
        CreateInitialSchema1750980000000
    ],
    subscribers: [],
});
