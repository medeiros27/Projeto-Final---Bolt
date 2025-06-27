import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

async function createDatabase() {
  const client = new Client({
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
    const checkResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkResult.rows.length === 0) {
      // Criar o banco de dados
      console.log(`Criando banco de dados: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Banco de dados ${dbName} criado com sucesso!`);
    } else {
      console.log(`Banco de dados ${dbName} já existe.`);
    }

    // Criar extensão uuid-ossp no banco recém-criado
    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '001516',
      database: dbName,
    });

    await dbClient.connect();
    console.log(`Conectado ao banco de dados ${dbName}`);

    // Verificar se a extensão uuid-ossp já existe
    const extensionResult = await dbClient.query(
      `SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'`
    );

    if (extensionResult.rows.length === 0) {
      // Criar extensão uuid-ossp
      console.log('Criando extensão uuid-ossp');
      await dbClient.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      console.log('Extensão uuid-ossp criada com sucesso!');
    } else {
      console.log('Extensão uuid-ossp já existe.');
    }

    await dbClient.end();
  } catch (error) {
    console.error('Erro ao criar banco de dados:', error);
  } finally {
    await client.end();
  }
}

createDatabase()
  .then(() => console.log('Processo concluído'))
  .catch((error) => console.error('Erro no processo:', error));