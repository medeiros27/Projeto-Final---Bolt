import "reflect-metadata";
import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { AppDataSource } from "./data-source";
import { errorHandler } from "./middlewares/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import { diligenceRoutes } from "./routes/diligenceRoutes";
import { financialRoutes } from "./routes/financialRoutes";
import { notificationRoutes } from "./routes/notificationRoutes";
import { platformRoutes } from "./routes/platformRoutes"; 

AppDataSource.initialize()
  .then(() => {
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
    startServer();
  })
  .catch((error: any) => {
    console.error("Erro ao conectar ao banco de dados:", error);
  });

function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(morgan("dev"));

  // **CORREÇÃO: Adicionando um prefixo /api global para todas as rotas**
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/diligences", diligenceRoutes);
  app.use("/api/financial", financialRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/platform", platformRoutes);
  // Remova outras rotas que não seguem o padrão /api se necessário

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Servidor a ser executado na porta ${PORT}`);
  });
}
