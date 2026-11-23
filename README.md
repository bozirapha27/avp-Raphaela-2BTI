# Lista de Tarefas

Sistema escolar de lista de tarefas desenvolvido com Node.js, Express, SQLite, Prisma e React.

## Tecnologias

- Backend: Node.js, Express, Prisma, SQLite
- Autenticação: bcrypt e JWT
- Upload: Multer
- Documentação: Swagger
- Frontend: React com Vite e JSX

## Estrutura

```text
server.js
controllers/       Processamento das requisições
routes/            Definição das rotas
models/            Acesso ao banco com Prisma
middlewares/       Autenticação e upload
prisma/            Schema e migrações
frontend/          Interface React
uploads/           Imagens enviadas
```

## Configuração

1. Instale as dependências do backend:

```bash
npm install
```

2. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Exemplo de `.env`:

```text
PORT=3000
JWT_SECRET=troque-este-segredo
DATABASE_URL="file:./dev.db"
```

3. Gere o cliente e prepare o banco:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Inicie o backend:

```bash
npm start
```

API: `http://localhost:3000`  
Swagger: `http://localhost:3000/api-docs`

## Frontend

1. Instale e execute:

```bash
npm run frontend:install
npm run frontend
```

Frontend: `http://localhost:5173`

Para configurar outra URL da API, copie `frontend/.env.example` para `frontend/.env` e ajuste `VITE_API_URL`.

## Utilização

1. Crie uma conta no formulário de cadastro.
2. Faça login com email e senha.
3. Cadastre uma tarefa informando título e descrição.
4. Use Editar para alterar uma tarefa.
5. Use o botão de conclusão para concluir ou reabrir.
6. Use Excluir para remover a tarefa.
7. Use Sair para encerrar a sessão.

Cada usuário visualiza somente as tarefas vinculadas ao próprio cadastro.
