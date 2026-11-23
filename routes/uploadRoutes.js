import { Router } from "express";
import { autenticar } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.post("/", autenticar, upload.single("imagem"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: "Nenhuma imagem foi enviada." });
  }
  res.status(201).json({
    mensagem: "Imagem enviada com sucesso",
    arquivo: req.file.filename,
    url: `/uploads/${req.file.filename}`
  });
});

export default router;
