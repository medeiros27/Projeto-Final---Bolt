#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando configuração do banco de dados JurisConnect...${NC}"

# Criar banco de dados
echo -e "${YELLOW}Criando banco de dados...${NC}"
npm run db:create

# Verificar se o banco foi criado com sucesso
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao criar o banco de dados. Verifique as credenciais no arquivo .env${NC}"
    exit 1
fi

# Executar migrações
echo -e "${YELLOW}Executando migrações...${NC}"
npm run migration:run

# Verificar se as migrações foram executadas com sucesso
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao executar as migrações.${NC}"
    exit 1
fi

# Executar seed
echo -e "${YELLOW}Populando banco de dados com dados iniciais...${NC}"
npm run seed

# Verificar se o seed foi executado com sucesso
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao executar o seed.${NC}"
    exit 1
fi

echo -e "${GREEN}Banco de dados configurado com sucesso!${NC}"
echo -e "${GREEN}Usuários criados:${NC}"
echo -e "${YELLOW}Admin:${NC} admin@jurisconnect.com / admin123"
echo -e "${YELLOW}Cliente:${NC} cliente@exemplo.com / cliente123"
echo -e "${YELLOW}Correspondente:${NC} correspondente@exemplo.com / corresp123"

echo -e "${GREEN}Para iniciar o servidor, execute:${NC} npm run dev"