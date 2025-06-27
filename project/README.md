# JurisConnect Backend

API RESTful para o sistema JurisConnect de gestão de diligências jurídicas.

## Tecnologias Utilizadas

- Node.js
- Express.js
- TypeScript
- TypeORM
- PostgreSQL
- JWT para autenticação

## Requisitos

- Node.js 18+
- PostgreSQL 14+

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`
4. Crie o banco de dados e execute as migrações:
   ```
   npm run db:setup
   ```
5. (Opcional) Execute o seed para criar dados iniciais:
   ```
   npm run seed
   ```

## Executando o Projeto

### Desenvolvimento
```
npm run dev
```

### Produção
```
npm run build
npm start
```

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

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register/client` - Registro de cliente
- `POST /api/auth/register/correspondent` - Registro de correspondente

### Usuários
- `GET /api/users` - Listar todos os usuários (admin)
- `GET /api/users/:id` - Obter usuário por ID
- `GET /api/users/profile` - Obter perfil do usuário autenticado
- `PATCH /api/users/profile` - Atualizar perfil do usuário
- `GET /api/users/correspondents` - Listar correspondentes
- `GET /api/users/correspondents/pending` - Listar correspondentes pendentes
- `PATCH /api/users/correspondents/:id/approve` - Aprovar correspondente
- `PATCH /api/users/correspondents/:id/reject` - Rejeitar correspondente

### Diligências
- `GET /api/diligences` - Listar todas as diligências (admin)
- `GET /api/diligences/:id` - Obter diligência por ID
- `POST /api/diligences` - Criar nova diligência
- `GET /api/diligences/client/my` - Listar diligências do cliente
- `GET /api/diligences/correspondent/my` - Listar diligências do correspondente
- `GET /api/diligences/correspondent/available` - Listar diligências disponíveis
- `PATCH /api/diligences/:id/assign` - Atribuir diligência a correspondente
- `PATCH /api/diligences/:id/accept` - Aceitar diligência
- `PATCH /api/diligences/:id/start` - Iniciar diligência
- `PATCH /api/diligences/:id/complete` - Concluir diligência
- `PATCH /api/diligences/:id/status` - Atualizar status da diligência
- `POST /api/diligences/:id/revert-status` - Reverter status da diligência
- `GET /api/diligences/:id/status-history` - Obter histórico de status

### Financeiro
- `GET /api/financial/summary` - Obter resumo financeiro (admin)
- `GET /api/financial/data` - Obter todos os dados financeiros (admin)
- `GET /api/financial/diligence/:id` - Obter dados financeiros de uma diligência
- `POST /api/financial/payment-proof/:diligenceId` - Enviar comprovante de pagamento
- `PATCH /api/financial/payment-proof/:proofId/verify` - Verificar comprovante de pagamento
- `PATCH /api/financial/payment/:diligenceId/client` - Marcar pagamento do cliente como pago
- `PATCH /api/financial/payment/:diligenceId/correspondent` - Marcar pagamento do correspondente como pago
- `POST /api/financial/payment/:diligenceId/revert-status` - Reverter status de pagamento
- `GET /api/financial/payment/:diligenceId/status-history` - Obter histórico de status de pagamento
- `GET /api/financial/client` - Obter dados financeiros do cliente
- `GET /api/financial/correspondent` - Obter dados financeiros do correspondente

### Notificações
- `GET /api/notifications` - Obter notificações do usuário
- `PATCH /api/notifications/:id/read` - Marcar notificação como lida
- `PATCH /api/notifications/read-all` - Marcar todas as notificações como lidas
- `DELETE /api/notifications/:id` - Excluir notificação

### Anexos
- `POST /api/attachments/:diligenceId` - Fazer upload de anexo
- `GET /api/attachments/:diligenceId` - Obter anexos de uma diligência
- `DELETE /api/attachments/:id` - Excluir anexo

## Usuários de Teste

- **Administrador**:
  - Email: admin@jurisconnect.com
  - Senha: admin123

- **Cliente**:
  - Email: cliente@exemplo.com
  - Senha: cliente123

- **Correspondente**:
  - Email: correspondente@exemplo.com
  - Senha: corresp123