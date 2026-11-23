import express from "express";
import "dotenv/config";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/authRoutes.js";
import tarefaRoutes from "./routes/tarefaRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Lista de Tarefas",
      version: "2.0.0",
      description: "API persistente com cadastro, login, JWT e gerenciamento de tarefas."
    },
    servers: [{ url: `http://localhost:${port}` }],
    tags: [
      { name: "Usuários", description: "Cadastro e login" },
      { name: "Tarefas", description: "Operações relacionadas às tarefas" },
      { name: "Upload", description: "Envio de imagens" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      },
      schemas: {
        Tarefa: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            titulo: { type: "string", example: "Estudar Matemática" },
            descricao: { type: "string", example: "Revisar o conteúdo" },
            concluida: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            usuarioId: { type: "integer", example: 1 }
          }
        }
      },
      paths: {
        "/usuarios": {
          post: {
            tags: ["Usuários"],
            summary: "Cadastrar usuário",
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["nome", "email", "senha"] } } } },
            responses: { "201": { description: "Usuário cadastrado" }, "400": { description: "Dados inválidos" } }
          }
        },
        "/login": {
          post: {
            tags: ["Usuários"],
            summary: "Login e geração de token",
            requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["email", "senha"] } } } },
            responses: { "200": { description: "Login realizado" }, "401": { description: "Credenciais inválidas" } }
          }
        },
        "/tarefas": {
          get: { tags: ["Tarefas"], summary: "Listar tarefas do usuário", security: [{ bearerAuth: [] }], responses: { "200": { description: "Lista retornada" }, "401": { description: "Token ausente ou inválido" } } },
          post: { tags: ["Tarefas"], summary: "Criar tarefa", security: [{ bearerAuth: [] }], responses: { "201": { description: "Tarefa criada" }, "400": { description: "Dados inválidos" }, "401": { description: "Token ausente ou inválido" } } }
        },
        "/tarefas/{id}": {
          get: { tags: ["Tarefas"], summary: "Consultar tarefa", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Tarefa encontrada" }, "404": { description: "Tarefa não encontrada" } } },
          put: { tags: ["Tarefas"], summary: "Editar tarefa", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Tarefa atualizada" }, "404": { description: "Tarefa não encontrada" } } },
          patch: { tags: ["Tarefas"], summary: "Concluir ou reabrir tarefa", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Tarefa atualizada" } } },
          delete: { tags: ["Tarefas"], summary: "Excluir tarefa", security: [{ bearerAuth: [] }], parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Tarefa removida" }, "404": { description: "Tarefa não encontrada" } } }
        },
        "/upload": {
          post: {
            tags: ["Upload"],
            summary: "Enviar imagem",
            security: [{ bearerAuth: [] }],
            requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", required: ["imagem"], properties: { imagem: { type: "string", format: "binary" } } } } } },
            responses: { "201": { description: "Imagem enviada" }, "400": { description: "Arquivo inválido" }, "401": { description: "Token ausente ou inválido" } }
          }
        }
      }
    }
  },
  apis: ["./server.js", "./routes/*.js"]
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({
    mensagem: "API de Lista de Tarefas funcionando!",
    disciplina: "Desenvolvimento de Websites",
    bimestre: "4º bimestre"
  });
});

app.use("/", authRoutes);
app.use("/tarefas", tarefaRoutes);
app.use("/upload", uploadRoutes);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ erro: "A imagem deve ter no máximo 2 MB." });
    }
    return res.status(400).json({ erro: error.message });
  }
  if (error) {
    return res.status(400).json({ erro: error.message });
  }
  next();
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

export default app;
