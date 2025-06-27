"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
async function createDatabase() {
    const client = new pg_1.Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '001516',
        database: 'postgres', // Conectar ao banco padrão para criar o novo banco
    });
    try {
        await client.connect();
        console.log('Conectado ao PostgreSQL');
        const dbName = process.env.DB_DATABASE || 'jurisconnect';
        // Verificar se o banco já existe
        const checkResult = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
        if (checkResult.rows.length === 0) {
            // Criar o banco de dados
            console.log(`Criando banco de dados: ${dbName}`);
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`Banco de dados ${dbName} criado com sucesso!`);
        }
        else {
            console.log(`Banco de dados ${dbName} já existe.`);
        }
        // Criar extensão uuid-ossp no banco recém-criado
        const dbClient = new pg_1.Client({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            user: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || '001516',
            database: dbName,
        });
        await dbClient.connect();
        console.log(`Conectado ao banco de dados ${dbName}`);
        // Verificar se a extensão uuid-ossp já existe
        const extensionResult = await dbClient.query(`SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'`);
        if (extensionResult.rows.length === 0) {
            // Criar extensão uuid-ossp
            console.log('Criando extensão uuid-ossp');
            await dbClient.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
            console.log('Extensão uuid-ossp criada com sucesso!');
        }
        else {
            console.log('Extensão uuid-ossp já existe.');
        }
        await dbClient.end();
    }
    catch (error) {
        console.error('Erro ao criar banco de dados:', error);
    }
    finally {
        await client.end();
    }
}
createDatabase()
    .then(() => console.log('Processo concluído'))
    .catch((error) => console.error('Erro no processo:', error));
