#!/bin/bash

# Cores para output
GREEN=\'\\033[0;32m\'
YELLOW=\'\\033[1;33m\'
RED=\'\\033[0;31m\'
NC=\'\\033[0m\' # No Color

echo -e "${YELLOW}Iniciando configuração do banco de dados JurisConnect...${NC}"

# Define o diretório do backend
# Certifique-se de que este caminho está correto em relação onde você executa o init-db.sh
BACKEND_DIR="/home/ubuntu/Projeto-Final---Bolt/project/backend"

# Mudar para o diretório do backend
cd "$BACKEND_DIR" || { echo -e "${RED}Erro: Não foi possível navegar para o diretório do backend: $BACKEND_DIR${NC}"; exit 1; }

# Compilar o backend para garantir que os scripts JS estejam atualizados
echo -e "${YELLOW}Compilando o backend...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao compilar o backend. Verifique as dependências e o código.${NC}"
    exit 1
fi

# Criar banco de dados usando o script JS compilado
echo -e "${YELLOW}Criando banco de dados...${NC}"
# Executa o script compilado diretamente com node
node dist/scripts/createDatabase.js
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao criar o banco de dados. Verifique as credenciais no arquivo .env e o log acima.${NC}"
    exit 1
fi

# Executar migrações
echo -e "${YELLOW}Executando migrações...${NC}"
npm run migration:run
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao executar as migrações. Verifique o log acima.${NC}"
    exit 1
fi

# Executar seed
echo -e "${YELLOW}Populando banco de dados com dados iniciais...${NC}"
npm run seed
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao executar o seed. Verifique o log acima.${NC}"
    exit 1
fi

echo -e "${GREEN}Banco de dados configurado com sucesso!${NC}"
echo -e "${GREEN}Usuários criados:${NC}"
echo -e "${YELLOW}Admin:${NC} admin@jurisconnect.com / admin123"
echo -e "${YELLOW}Cliente:${NC} cliente@exemplo.com / cliente123"
echo -e "${YELLOW}Correspondente:${NC} correspondente@exemplo.com / corresp123"

echo -e "${GREEN}Para iniciar o servidor, execute:${NC} npm run dev"
