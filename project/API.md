# JurisConnect API Documentation

## Base URL

```
http://localhost:3000/api
```

## Autenticação

A API utiliza autenticação JWT (JSON Web Token). Para acessar endpoints protegidos, inclua o token no header de autorização:

```
Authorization: Bearer <token>
```

### Endpoints de Autenticação

#### Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@jurisconnect.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user": {
    "id": "1",
    "name": "Administrador",
    "email": "admin@jurisconnect.com",
    "role": "admin",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Registro de Cliente

```
POST /auth/register/client
```

**Request Body:**
```json
{
  "name": "Novo Cliente",
  "email": "cliente@exemplo.com",
  "password": "senha123",
  "phone": "(11) 99999-9999",
  "companyName": "Empresa Advocacia",
  "cnpj": "12.345.678/0001-90",
  "address": "Av. Paulista, 1000, São Paulo, SP",
  "city": "São Paulo",
  "state": "SP"
}
```

#### Registro de Correspondente

```
POST /auth/register/correspondent
```

**Request Body:**
```json
{
  "name": "Novo Correspondente",
  "email": "correspondente@exemplo.com",
  "password": "senha123",
  "phone": "(11) 88888-8888",
  "oab": "SP123456",
  "city": "São Paulo",
  "state": "SP",
  "specialties": ["Direito Trabalhista", "Direito Cível"],
  "coverage": ["SP", "RJ"]
}
```

## Usuários

### Obter Perfil do Usuário

```
GET /users/profile
```

### Atualizar Perfil do Usuário

```
PATCH /users/profile
```

**Request Body:**
```json
{
  "name": "Nome Atualizado",
  "phone": "(11) 99999-9999",
  "city": "São Paulo",
  "state": "SP"
}
```

### Listar Todos os Usuários (Admin)

```
GET /users
```

### Obter Usuário por ID

```
GET /users/:id
```

### Listar Correspondentes

```
GET /users/correspondents
```

**Query Parameters:**
- `state` (opcional): Filtrar por estado
- `city` (opcional): Filtrar por cidade

### Listar Correspondentes Pendentes (Admin)

```
GET /users/correspondents/pending
```

### Aprovar Correspondente (Admin)

```
PATCH /users/correspondents/:id/approve
```

### Rejeitar Correspondente (Admin)

```
PATCH /users/correspondents/:id/reject
```

## Diligências

### Listar Todas as Diligências (Admin)

```
GET /diligences
```

### Obter Diligência por ID

```
GET /diligences/:id
```

### Criar Nova Diligência

```
POST /diligences
```

**Request Body:**
```json
{
  "title": "Citação em Ação de Cobrança",
  "description": "Realizar citação do réu João da Silva na Ação de Cobrança nº 1234567-89.2024.8.26.0001",
  "type": "Citação",
  "priority": "medium",
  "value": 150.00,
  "deadline": "2024-12-30T23:59:59Z",
  "city": "São Paulo",
  "state": "SP",
  "clientId": "2",
  "correspondentId": "3"
}
```

### Listar Diligências do Cliente

```
GET /diligences/client/my
```

### Listar Diligências do Correspondente

```
GET /diligences/correspondent/my
```

### Listar Diligências Disponíveis (Correspondente)

```
GET /diligences/correspondent/available
```

**Query Parameters:**
- `state` (opcional): Filtrar por estado
- `city` (opcional): Filtrar por cidade

### Atribuir Diligência a Correspondente (Admin)

```
PATCH /diligences/:id/assign
```

**Request Body:**
```json
{
  "correspondentId": "3"
}
```

### Aceitar Diligência (Correspondente)

```
PATCH /diligences/:id/accept
```

### Iniciar Diligência (Correspondente)

```
PATCH /diligences/:id/start
```

### Concluir Diligência (Correspondente)

```
PATCH /diligences/:id/complete
```

### Atualizar Status da Diligência

```
PATCH /diligences/:id/status
```

**Request Body:**
```json
{
  "status": "cancelled",
  "reason": "Cancelado a pedido do cliente"
}
```

### Reverter Status da Diligência

```
POST /diligences/:id/revert-status
```

**Request Body:**
```json
{
  "targetStatus": "in_progress",
  "reason": "Diligência ainda não foi concluída"
}
```

### Obter Histórico de Status da Diligência

```
GET /diligences/:id/status-history
```

## Sistema de Status

### Verificar Possibilidade de Reversão

```
GET /status/can-revert
```

**Query Parameters:**
- `entityId`: ID da entidade (diligência ou pagamento)
- `entityType`: Tipo de entidade (`diligence` ou `payment`)
- `paymentType` (opcional): Tipo de pagamento (`client` ou `correspondent`)

**Response:**
```json
{
  "possible": true,
  "message": "Reversão possível"
}
```

### Reverter Status

```
POST /status/revert
```

**Request Body:**
```json
{
  "entityId": "1",
  "entityType": "diligence",
  "targetStatus": "in_progress",
  "reason": "Diligência ainda não foi concluída",
  "paymentType": "client"
}
```

**Response:**
```json
{
  "success": true,
  "previousStatus": "completed",
  "newStatus": "in_progress",
  "timestamp": "2024-12-25T10:30:00Z",
  "message": "Status revertido com sucesso de completed para in_progress",
  "entity": {
    "id": "1",
    "title": "Citação em Ação de Cobrança",
    "status": "in_progress",
    ...
  }
}
```

### Obter Histórico de Status de Diligência

```
GET /status/history/diligence/:id
```

### Obter Histórico de Status de Pagamento

```
GET /status/history/payment/:id
```

### Obter Todo o Histórico de Status (Admin)

```
GET /status/history/all
```

## Financeiro

### Obter Resumo Financeiro (Admin)

```
GET /financial/summary
```

### Obter Todos os Dados Financeiros (Admin)

```
GET /financial/data
```

### Obter Dados Financeiros de uma Diligência

```
GET /financial/diligence/:id
```

### Enviar Comprovante de Pagamento (Cliente)

```
POST /financial/payment-proof/:diligenceId
```

**Request Body:**
```json
{
  "pixKey": "cliente@exemplo.com",
  "amount": 150.00
}
```

### Verificar Comprovante de Pagamento (Admin)

```
PATCH /financial/payment-proof/:proofId/verify
```

**Request Body:**
```json
{
  "isApproved": true
}
```

### Marcar Pagamento do Cliente como Pago (Admin)

```
PATCH /financial/payment/:diligenceId/client
```

### Marcar Pagamento do Correspondente como Pago (Admin)

```
PATCH /financial/payment/:diligenceId/correspondent
```

### Reverter Status de Pagamento (Admin)

```
POST /financial/payment/:diligenceId/revert-status
```

**Request Body:**
```json
{
  "targetStatus": "pending",
  "reason": "Pagamento incorreto",
  "paymentType": "client"
}
```

### Obter Histórico de Status de Pagamento

```
GET /financial/payment/:diligenceId/status-history
```

### Obter Dados Financeiros do Cliente

```
GET /financial/client
```

### Obter Dados Financeiros do Correspondente

```
GET /financial/correspondent
```

## Notificações

### Obter Notificações do Usuário

```
GET /notifications
```

### Marcar Notificação como Lida

```
PATCH /notifications/:id/read
```

### Marcar Todas as Notificações como Lidas

```
PATCH /notifications/read-all
```

### Excluir Notificação

```
DELETE /notifications/:id
```

## Anexos

### Fazer Upload de Anexo

```
POST /attachments/:diligenceId
```

**Request Body:**
```json
{
  "name": "documento.pdf",
  "type": "application/pdf",
  "size": 245760
}
```

### Obter Anexos de uma Diligência

```
GET /attachments/:diligenceId
```

### Excluir Anexo

```
DELETE /attachments/:id
```

## Códigos de Status

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `204 No Content`: Requisição bem-sucedida, sem conteúdo para retornar
- `400 Bad Request`: Erro de validação ou dados inválidos
- `401 Unauthorized`: Autenticação necessária
- `403 Forbidden`: Sem permissão para acessar o recurso
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

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