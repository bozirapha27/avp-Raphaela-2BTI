import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { usuarioModel } from "../models/usuarioModel.js";

const jwtSecret = process.env.JWT_SECRET || "desenvolvimento-escolar";

export async function cadastrar(req, res) {
  const { nome, email, senha } = req.body;

  if (typeof nome !== "string" || nome.trim() === "" ||
      typeof email !== "string" || email.trim() === "" ||
      typeof senha !== "string" || senha.length < 6) {
    return res.status(400).json({ erro: "Informe nome, email válido e senha com pelo menos 6 caracteres." });
  }

  const emailNormalizado = email.trim().toLowerCase();
  if (!emailNormalizado.includes("@") || !emailNormalizado.includes(".")) {
    return res.status(400).json({ erro: "Informe um email válido." });
  }

  try {
    if (await usuarioModel.buscarPorEmail(emailNormalizado)) {
      return res.status(400).json({ erro: "Este email já está cadastrado." });
    }

    const usuario = await usuarioModel.criar({
      nome: nome.trim(),
      email: emailNormalizado,
      senha: await bcrypt.hash(senha, 10)
    });

    return res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso",
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
    });
  } catch (error) {
    return res.status(500).json({ erro: "Não foi possível cadastrar o usuário." });
  }
}

export async function login(req, res) {
  const { email, senha } = req.body;
  if (typeof email !== "string" || typeof senha !== "string") {
    return res.status(400).json({ erro: "Informe email e senha." });
  }

  const usuario = await usuarioModel.buscarPorEmail(email.trim().toLowerCase());
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha))) {
    return res.status(401).json({ erro: "Email ou senha incorretos." });
  }

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, email: usuario.email },
    jwtSecret,
    { expiresIn: "2h" }
  );

  return res.json({
    mensagem: "Login realizado com sucesso",
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }
  });
}
