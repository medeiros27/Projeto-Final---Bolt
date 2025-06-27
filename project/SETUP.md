# Configuração do Ambiente JurisConnect Backend

Este guia fornece instruções detalhadas para configurar o ambiente de desenvolvimento do backend do JurisConnect.

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## Passos para Configuração

### 1. Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd jurisconnect-backend
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=jurisconnect

# JWT
JWT_SECRET=jurisconnect_secret_key_change_in_production
JWT_EXPIRES_IN=1d
```

Substitua `sua_senha` pela senha do seu PostgreSQL.

### 4. Configurar o Banco de Dados

#### Opção 1: Usando o script de inicialização

Execute o script de inicialização que criará o banco de dados, executará as migrações e populará com dados iniciais:

```bash
./init-db.sh
```

#### Opção 2: Configuração manual

1. Crie o banco de dados:

```bash
npm run db:create
```

2. Execute as migrações:

```bash
npm run migration:run
```

3. (Opcional) Popule o banco com dados iniciais:

```bash
npm run seed
```

### 5. Iniciar o Servidor

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

## Usuários de Teste

Após executar o seed, os seguintes usuários estarão disponíveis:

- **Administrador**:
  - Email: admin@jurisconnect.com
  - Senha: admin123

- **Cliente**:
  - Email: cliente@exemplo.com
  - Senha: cliente123

- **Correspondente**:
  - Email: correspondente@exemplo.com
  - Senha: corresp123

## Comandos Úteis

- `npm run dev`: Inicia o servidor em modo de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm start`: Inicia o servidor em modo de produção
- `npm run migration:generate -- -n NomeDaMigracao`: Gera uma nova migração
- `npm run migration:run`: Executa as migrações pendentes
- `npm run migration:revert`: Reverte a última migração
- `npm run seed`: Popula o banco de dados com dados iniciais

## Estrutura do Projeto

```
src/
├── controllers/       # Controladores da API
├── entities/          # Entidades do TypeORM
├── middlewares/       # Middlewares do Express
├── migrations/        # Migrações do TypeORM
├── repositories/      # Repositórios para acesso ao banco
├── routes/            # Rotas da API
├── scripts/           # Scripts utilitários
├── services/          # Serviços com regras de negócio
├── types/             # Definições de tipos TypeScript
├── data-source.ts     # Configuração do TypeORM
└── index.ts           # Ponto de entrada da aplicação
```

## Solução de Problemas

### Erro de conexão com o PostgreSQL

Verifique se:
- O PostgreSQL está em execução
- As credenciais no arquivo `.env` estão corretas
- O usuário tem permissão para criar bancos de dados

### Erro nas migrações

Se houver erros ao executar as migrações:
1. Verifique se o banco de dados existe
2. Tente reverter as migrações: `npm run migration:revert`
3. Execute novamente: `npm run migration:run`

### Erro de permissão no script init-db.sh

Se o script não tiver permissão de execução:
```bash
chmod +x init-db.sh
```