import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "desenvolvimento-escolar";

export function autenticar(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Acesso não autorizado. Token ausente." });
  }

  try {
    const token = authorization.slice(7);
    req.usuario = jwt.verify(token, jwtSecret);
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Acesso não autorizado. Token inválido ou expirado." });
  }
}
