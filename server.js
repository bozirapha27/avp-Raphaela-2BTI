import express from "express";
import "dotenv/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const port = process.env.PORT || 3000;
const jwtSecret = process.env.JWT_SECRET || "desenvolvimento-escolar";

app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.join(__dirname, "uploads");

const storage = multer.diskStorage({
  destination: uploadsPath,
  filename: (req, file, callback) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nomeSeguro = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
    callback(null, nomeSeguro);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const formatosPermitidos = ["image/jpeg", "image/png", "image/webp"];
    if (!formatosPermitidos.includes(file.mimetype)) {
      return callback(new Error("Apenas arquivos JPG, PNG ou WEBP são permitidos."));
    }
    callback(null, true);
  }
});

const tarefas = [
  { id: 1, titulo: "Estudar Matemática", descricao: "Revisar prismas e pirâmides", concluida: false },
  { id: 2, titulo: "Fazer trabalho de TI", descricao: "Finalizar a API de lista de tarefas", concluida: false },
  { id: 3, titulo: "Estudar Biologia", descricao: "Revisar platelmintos e nematelmintos", concluida: true }
];
const usuarios = [];

function gerarId(lista) {
  if (lista.length === 0) return 1;
  return Math.max(...lista.map((item) => item.id)) + 1;
}

function autenticar(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Acesso não autorizado. Token ausente." });
  }

  const token = authorization.slice(7);
  try {
    req.usuario = jwt.verify(token, jwtSecret);
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Acesso não autorizado. Token inválido." });
  }
}

function validarTarefa(body, obrigatorios = false) {
  if (obrigatorios) {
    if (typeof body.titulo !== "string" || body.titulo.trim() === "") {
      return "O campo titulo é obrigatório.";
    }
  } else if (body.titulo !== undefined && (typeof body.titulo !== "string" || body.titulo.trim() === "")) {
    return "O campo titulo deve ser um texto não vazio.";
  }

  if (body.descricao !== undefined && typeof body.descricao !== "string") {
    return "O campo descricao deve ser um texto.";
  }
  if (body.concluida !== undefined && typeof body.concluida !== "boolean") {
    return "O campo concluida deve ser verdadeiro ou falso.";
  }
  return null;
}

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Lista de Tarefas",
      version: "1.0.0",
      description: "API para cadastrar usuários, autenticar e gerenciar tarefas."
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
            descricao: { type: "string", example: "Revisar conteúdo" },
            concluida: { type: "boolean", example: false }
          }
        }
      }
    }
  },
  apis: ["./server.js"]
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/uploads", express.static(uploadsPath));

app.get("/", (req, res) => {
  res.json({
    mensagem: "API de Lista de Tarefas funcionando!",
    disciplina: "Desenvolvimento de Websites",
    bimestre: "3º bimestre"
  });
});

/**
 * @swagger
 * /usuarios:
 *   post:
 *     tags: [Usuários]
 *     summary: Cadastra um usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome: { type: string }
 *               email: { type: string }
 *               senha: { type: string }
 *     responses:
 *       201: { description: Usuário cadastrado com sucesso }
 *       400: { description: Dados inválidos ou usuário já existente }
 */
app.post("/usuarios", async (req, res) => {
  const { nome, email, senha } = req.body;
  if (typeof nome !== "string" || nome.trim() === "" ||
      typeof email !== "string" || email.trim() === "" ||
      typeof senha !== "string" || senha.length < 6) {
    return res.status(400).json({ erro: "Informe nome, email e senha com pelo menos 6 caracteres." });
  }

  const emailNormalizado = email.trim().toLowerCase();
  if (usuarios.some((usuario) => usuario.email === emailNormalizado)) {
    return res.status(400).json({ erro: "Este email já está cadastrado." });
  }

  const usuario = {
    id: gerarId(usuarios),
    nome: nome.trim(),
    email: emailNormalizado,
    senha: await bcrypt.hash(senha, 10)
  };
  usuarios.push(usuario);

  res.status(201).json({
    mensagem: "Usuário cadastrado com sucesso",
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
  });
});

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Usuários]
 *     summary: Realiza login e retorna um token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email: { type: string }
 *               senha: { type: string }
 *     responses:
 *       200: { description: Login realizado com sucesso }
 *       400: { description: Dados inválidos }
 *       401: { description: Email ou senha incorretos }
 */
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  if (typeof email !== "string" || typeof senha !== "string") {
    return res.status(400).json({ erro: "Informe email e senha." });
  }

  const usuario = usuarios.find((item) => item.email === email.trim().toLowerCase());
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.status(401).json({ erro: "Email ou senha incorretos." });
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    jwtSecret,
    { expiresIn: "2h" }
  );
  res.json({ mensagem: "Login realizado com sucesso", token });
});

/**
 * @swagger
 * /tarefas:
 *   get:
 *     tags: [Tarefas]
 *     summary: Lista todas as tarefas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Lista de tarefas retornada com sucesso }
 *       401: { description: Token ausente ou inválido }
 */
app.get("/tarefas", autenticar, (req, res) => {
  res.json(tarefas);
});

/**
 * @swagger
 * /tarefas/{id}:
 *   get:
 *     tags: [Tarefas]
 *     summary: Busca uma tarefa por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Tarefa encontrada }
 *       404: { description: Tarefa não encontrada }
 *       401: { description: Token ausente ou inválido }
 */
app.get("/tarefas/:id", autenticar, (req, res) => {
  const id = Number(req.params.id);
  const tarefa = tarefas.find((item) => item.id === id);
  if (!Number.isInteger(id) || !tarefa) {
    return res.status(404).json({ mensagem: "Tarefa não encontrada" });
  }
  res.json(tarefa);
});

/**
 * @swagger
 * /tarefas:
 *   post:
 *     tags: [Tarefas]
 *     summary: Cadastra uma tarefa
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo]
 *             properties:
 *               titulo: { type: string }
 *               descricao: { type: string }
 *               concluida: { type: boolean }
 *     responses:
 *       201: { description: Tarefa criada }
 *       400: { description: Dados inválidos }
 *       401: { description: Token ausente ou inválido }
 */
app.post("/tarefas", autenticar, (req, res) => {
  const erro = validarTarefa(req.body, true);
  if (erro) return res.status(400).json({ erro });

  const novaTarefa = {
    id: gerarId(tarefas),
    titulo: req.body.titulo.trim(),
    descricao: typeof req.body.descricao === "string" ? req.body.descricao.trim() : "",
    concluida: typeof req.body.concluida === "boolean" ? req.body.concluida : false
  };
  tarefas.push(novaTarefa);
  res.status(201).json({ mensagem: "Tarefa criada com sucesso", tarefa: novaTarefa });
});

app.patch("/tarefas/:id", autenticar, (req, res) => {
  const id = Number(req.params.id);
  const tarefa = tarefas.find((item) => item.id === id);
  if (!tarefa) return res.status(404).json({ mensagem: "Tarefa não encontrada" });

  const erro = validarTarefa(req.body, false);
  if (erro) return res.status(400).json({ erro });
  if (req.body.titulo !== undefined) tarefa.titulo = req.body.titulo.trim();
  if (req.body.descricao !== undefined) tarefa.descricao = req.body.descricao.trim();
  if (req.body.concluida !== undefined) tarefa.concluida = req.body.concluida;

  res.json({ mensagem: "Tarefa atualizada com sucesso", tarefa });
});

/**
 * @swagger
 * /tarefas/{id}:
 *   put:
 *     tags: [Tarefas]
 *     summary: Substitui uma tarefa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo]
 *             properties:
 *               titulo: { type: string }
 *               descricao: { type: string }
 *               concluida: { type: boolean }
 *     responses:
 *       200: { description: Tarefa substituída }
 *       400: { description: Dados inválidos }
 *       404: { description: Tarefa não encontrada }
 *       401: { description: Token ausente ou inválido }
 */
app.put("/tarefas/:id", autenticar, (req, res) => {
  const id = Number(req.params.id);
  const tarefa = tarefas.find((item) => item.id === id);
  if (!tarefa) return res.status(404).json({ mensagem: "Tarefa não encontrada" });

  const erro = validarTarefa(req.body, true);
  if (erro) return res.status(400).json({ erro });

  tarefa.titulo = req.body.titulo.trim();
  tarefa.descricao = typeof req.body.descricao === "string" ? req.body.descricao.trim() : "";
  tarefa.concluida = typeof req.body.concluida === "boolean" ? req.body.concluida : false;
  res.json({ mensagem: "Tarefa substituída com sucesso", tarefa });
});

/**
 * @swagger
 * /tarefas/{id}:
 *   delete:
 *     tags: [Tarefas]
 *     summary: Exclui uma tarefa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Tarefa removida }
 *       404: { description: Tarefa não encontrada }
 *       401: { description: Token ausente ou inválido }
 */
app.delete("/tarefas/:id", autenticar, (req, res) => {
  const id = Number(req.params.id);
  const indice = tarefas.findIndex((item) => item.id === id);
  if (indice === -1) return res.status(404).json({ mensagem: "Tarefa não encontrada" });

  tarefas.splice(indice, 1);
  res.json({ mensagem: "Tarefa removida com sucesso" });
});

/**
 * @swagger
 * /upload:
 *   post:
 *     tags: [Upload]
 *     summary: Envia uma imagem
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [imagem]
 *             properties:
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201: { description: Imagem enviada }
 *       400: { description: Arquivo ausente ou inválido }
 *       401: { description: Token ausente ou inválido }
 */
app.post("/upload", autenticar, upload.single("imagem"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: "Nenhuma imagem foi enviada." });
  }
  res.status(201).json({
    mensagem: "Imagem enviada com sucesso",
    arquivo: req.file.filename,
    url: `/uploads/${req.file.filename}`
  });
});

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