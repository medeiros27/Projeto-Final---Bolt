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
import { attachmentRoutes } from "./routes/attachmentRoutes";
import { statusRoutes } from "./routes/statusRoutes";

// Inicializar conexão com o banco de dados
AppDataSource.initialize()
  .then(() => {
    console.log("Conexão com o banco de dados estabelecida");
    startServer();
  })
  .catch((error) => console.log("Erro ao conectar ao banco de dados:", error));

function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middlewares
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(morgan("dev"));

  // Rotas
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/diligences", diligenceRoutes);
  app.use("/api/financial", financialRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/attachments", attachmentRoutes);
  app.use("/api/status", statusRoutes);

  // Rota de teste
  app.get("/", (req, res) => {
    res.send("JurisConnect API está funcionando!");
  });

  // Middleware de tratamento de erros
  app.use(errorHandler);

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}