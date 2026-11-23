import { tarefaModel } from "../models/tarefaModel.js";

function validarTarefa(body, obrigatorios = false) {
  if (obrigatorios && (typeof body.titulo !== "string" || body.titulo.trim() === "")) {
    return "O campo titulo é obrigatório.";
  }
  if (body.titulo !== undefined && (typeof body.titulo !== "string" || body.titulo.trim() === "")) {
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

export async function listar(req, res) {
  const tarefas = await tarefaModel.listarPorUsuario(req.usuario.id);
  res.json(tarefas);
}

export async function buscar(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensagem: "Tarefa não encontrada" });
  }

  const tarefa = await tarefaModel.buscarPorIdEUsuario(id, req.usuario.id);
  if (!tarefa) {
    return res.status(404).json({ mensagem: "Tarefa não encontrada" });
  }
  res.json(tarefa);
}

export async function criar(req, res) {
  const erro = validarTarefa(req.body, true);
  if (erro) return res.status(400).json({ erro });

  const tarefa = await tarefaModel.criar({
    titulo: req.body.titulo.trim(),
    descricao: typeof req.body.descricao === "string" ? req.body.descricao.trim() : "",
    concluida: typeof req.body.concluida === "boolean" ? req.body.concluida : false,
    usuarioId: req.usuario.id
  });
  res.status(201).json({ mensagem: "Tarefa criada com sucesso", tarefa });
}

export async function atualizar(req, res) {
  const id = Number(req.params.id);
  const existente = await tarefaModel.buscarPorIdEUsuario(id, req.usuario.id);
  if (!existente) return res.status(404).json({ mensagem: "Tarefa não encontrada" });

  const erro = validarTarefa(req.body, req.method === "PUT");
  if (erro) return res.status(400).json({ erro });

  const dados = {};
  if (req.body.titulo !== undefined) dados.titulo = req.body.titulo.trim();
  if (req.body.descricao !== undefined) dados.descricao = req.body.descricao.trim();
  if (req.body.concluida !== undefined) dados.concluida = req.body.concluida;

  await tarefaModel.atualizar(id, req.usuario.id, dados);
  const tarefa = await tarefaModel.buscarPorIdEUsuario(id, req.usuario.id);
  res.json({ mensagem: "Tarefa atualizada com sucesso", tarefa });
}

export async function excluir(req, res) {
  const id = Number(req.params.id);
  const existente = await tarefaModel.buscarPorIdEUsuario(id, req.usuario.id);
  if (!existente) return res.status(404).json({ mensagem: "Tarefa não encontrada" });

  await tarefaModel.excluir(id, req.usuario.id);
  res.json({ mensagem: "Tarefa removida com sucesso" });
}
