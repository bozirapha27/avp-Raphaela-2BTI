import express from "express";
import "dotenv/config";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const port = 3000;

app.use(express.json());

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Lista de Tarefas",
      version: "1.0.0",
      description: "API para cadastrar, consultar, atualizar e excluir tarefas."
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ],
    tags: [
      {
        name: "Tarefas",
        description: "Operações relacionadas às tarefas"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "Token"
        }
      },
      schemas: {
        Tarefa: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1
            },
            titulo: {
              type: "string",
              example: "Estudar Matemática"
            },
            descricao: {
              type: "string",
              example: "Revisar prismas e pirâmides"
            },
            concluida: {
              type: "boolean",
              example: false
            }
          }
        }
      }
    }
  },
  apis: ["./server.js"]
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: API de Lista de Tarefas
 *   version: 1.0.0
 *   description: API para cadastrar, consultar, atualizar e excluir tarefas.
 * servers:
 *   - url: http://localhost:3000
 * tags:
 *   - name: Tarefas
 *     description: Operações relacionadas às tarefas
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: Token
 *   schemas:
 *     Tarefa:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         titulo:
 *           type: string
 *           example: Estudar Matemática
 *         descricao:
 *           type: string
 *           example: Revisar prismas e pirâmides
 *         concluida:
 *           type: boolean
 *           example: false
 */

const tarefas = [
  {
    id: 1,
    titulo: "Estudar Matemática",
    descricao: "Revisar prismas e pirâmides",
    concluida: false
  },
  {
    id: 2,
    titulo: "Fazer trabalho de TI",
    descricao: "Finalizar a API de lista de tarefas",
    concluida: false
  },
  {
    id: 3,
    titulo: "Estudar Biologia",
    descricao: "Revisar platelmintos e nematelmintos",
    concluida: true
  }
];

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  const tokenSecreto = process.env.TOKEN_SECRETO;

  if (authHeader !== `Bearer ${tokenSecreto}`) {
    return res.status(401).json({
      erro: "Acesso não autorizado. Token ausente ou inválido"
    });
  }

  next();
}

app.get("/", (req, res) => {
  res.json({
    mensagem: "API de Lista de Tarefas funcionando!",
    disciplina: "Desenvolvimento de Websites",
    bimestre: "3º bimestre"
  });
});

/**
 * @swagger
 * /tarefas:
 *   get:
 *     tags: [Tarefas]
 *     summary: Lista todas as tarefas
 *     description: Retorna todas as tarefas cadastradas. Esta rota é pública.
 *     responses:
 *       200:
 *         description: Lista de tarefas retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarefa'
 */
app.get("/tarefas", (req, res) => {
  res.json(tarefas);
});

/**
 * @swagger
 * /tarefas/{id}:
 *   get:
 *     tags: [Tarefas]
 *     summary: Busca uma tarefa por ID
 *     description: Retorna uma tarefa específica usando seu ID. Esta rota é pública.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da tarefa que será consultada.
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Tarefa encontrada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarefa'
 *       404:
 *         description: Tarefa não encontrada.
 *         content:
 *           application/json:
 *             example:
 *               mensagem: Tarefa não encontrada
 */
app.get("/tarefas/:id", (req, res) => {
  const id = Number(req.params.id);

  const tarefa = tarefas.find((tarefa) => tarefa.id === id);

  if (!tarefa) {
    return res.status(404).json({
      mensagem: "Tarefa não encontrada"
    });
  }

  res.json(tarefa);
});

/**
 * @swagger
 * /tarefas:
 *   post:
 *     tags: [Tarefas]
 *     summary: Cadastra uma nova tarefa
 *     description: Cria uma tarefa. Esta rota precisa de um Bearer Token válido.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               concluida:
 *                 type: boolean
 *           example:
 *             titulo: Estudar Matemática
 *             descricao: Revisar prismas e pirâmides
 *             concluida: false
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               mensagem: Tarefa criada com sucesso
 *               tarefa:
 *                 id: 4
 *                 titulo: Estudar Matemática
 *                 descricao: Revisar prismas e pirâmides
 *                 concluida: false
 *       400:
 *         description: Dados enviados são inválidos.
 *       401:
 *         description: Token ausente ou inválido.
 *         content:
 *           application/json:
 *             example:
 *               erro: Acesso não autorizado. Token ausente ou inválido
 */
app.post("/tarefas", autenticar, (req, res) => {
  const novaTarefa = {
    id: tarefas.length + 1,
    titulo: req.body.titulo,
    descricao: req.body.descricao,
    concluida: false
  };

  tarefas.push(novaTarefa);

  res.status(201).json({
    mensagem: "Tarefa criada com sucesso",
    tarefa: novaTarefa
  });
});

/**
 * @swagger
 * /tarefas/{id}:
 *   patch:
 *     tags: [Tarefas]
 *     summary: Atualiza parcialmente uma tarefa
 *     description: Atualiza apenas os campos enviados. Esta rota precisa de um Bearer Token válido.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da tarefa que será atualizada.
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               concluida:
 *                 type: boolean
 *           example:
 *             concluida: true
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               mensagem: Tarefa atualizada com sucesso
 *               tarefa:
 *                 id: 1
 *                 titulo: Estudar Matemática
 *                 descricao: Revisar prismas e pirâmides
 *                 concluida: true
 *       400:
 *         description: Dados enviados são inválidos.
 *       401:
 *         description: Token ausente ou inválido.
 *       404:
 *         description: Tarefa não encontrada.
 *         content:
 *           application/json:
 *             example:
 *               mensagem: Tarefa não encontrada
 */
app.patch("/tarefas/:id", autenticar, (req, res) => {
  const id = Number(req.params.id);

  const { titulo, descricao, concluida } = req.body;

  const tarefa = tarefas.find((tarefa) => tarefa.id === id);

  if (!tarefa) {
    return res.status(404).json({
      mensagem: "Tarefa não encontrada"
    });
  }

  if (titulo !== undefined) {
    tarefa.titulo = titulo;
  }

  if (descricao !== undefined) {
    tarefa.descricao = descricao;
  }

  if (concluida !== undefined) {
    tarefa.concluida = concluida;
  }

  res.json({
    mensagem: "Tarefa atualizada com sucesso",
    tarefa: tarefa
  });
});
app.put("/tarefas/:id", autenticar, (req, res) => {
  const id = Number(req.params.id);

  const tarefa = tarefas.find((tarefa) => tarefa.id === id);

  if (!tarefa) {
    return res.status(404).json({
      mensagem: "Tarefa não encontrada"
    });
  }

  tarefa.titulo = req.body.titulo;
  tarefa.descricao = req.body.descricao;
  tarefa.concluida = req.body.concluida;

  res.json({
    mensagem: "Tarefa substituída com sucesso",
    tarefa: tarefa
  });
});

/**
 * @swagger
 * /tarefas/{id}:
 *   delete:
 *     tags: [Tarefas]
 *     summary: Exclui uma tarefa
 *     description: Exclui uma tarefa usando seu ID. Esta rota precisa de um Bearer Token válido.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da tarefa que será excluída.
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Tarefa removida com sucesso.
 *         content:
 *           application/json:
 *             example:
 *               mensagem: Tarefa removida com sucesso
 *       401:
 *         description: Token ausente ou inválido.
 *       404:
 *         description: Tarefa não encontrada.
 *         content:
 *           application/json:
 *             example:
 *               mensagem: Tarefa não encontrada
 */
app.delete("/tarefas/:id", autenticar, (req, res) => {
  const id = Number(req.params.id);

  const tarefaIndex = tarefas.findIndex(
    (tarefa) => tarefa.id === id
  );

  if (tarefaIndex === -1) {
    return res.status(404).json({
      mensagem: "Tarefa não encontrada"
    });
  }

  tarefas.splice(tarefaIndex, 1);

  res.json({
    mensagem: "Tarefa removida com sucesso"
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});