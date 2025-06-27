import "reflect-metadata";
import "express-async-errors";
import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
// SOLUÇÃO: A importação estava correta, mas o erro indica que o compilador não o encontra.
// Garantir que o arquivo `data-source.ts` existe em `src/`.
import { AppDataSource } from "./data-source";
import { errorHandler } from "./middlewares/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import { diligenceRoutes } from "./routes/diligenceRoutes";
import { financialRoutes } from "./routes/financialRoutes";
import { notificationRoutes } from "./routes/notificationRoutes";
import { attachmentRoutes } from "./routes/attachmentRoutes";
import { statusRoutes } from "./routes/statusRoutes";

// Validar variáveis de ambiente essenciais
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 'JWT_SECRET'];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    // Em um cenário real, isso impediria o servidor de iniciar.
    console.error(`ERRO FATAL: A variável de ambiente ${varName} não está definida.`);
    process.exit(1);
  }
}

// Inicializar conexão com o banco de dados
AppDataSource.initialize()
  .then(() => {
    console.log("Conexão com o banco de dados estabelecida com sucesso.");
    startServer();
  })
  .catch((error: any) => { // SOLUÇÃO: Adicionar tipo explícito ao parâmetro 'error'
    console.error("Erro ao conectar ao banco de dados:", error);
  });

function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middlewares
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(morgan("dev"));

  // Rotas da API
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/diligences", diligenceRoutes);
  app.use("/api/financial", financialRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/attachments", attachmentRoutes);
  app.use("/api/status", statusRoutes);

  // Rota de verificação de saúde da API
  app.get("/", (req, res) => {
    res.send("API JurisConnect está operacional!");
  });

  // Middleware de tratamento de erros (deve ser o último)
  app.use(errorHandler);

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}
