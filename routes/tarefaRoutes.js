import { Router } from "express";
import { autenticar } from "../middlewares/authMiddleware.js";
import { listar, buscar, criar, atualizar, excluir } from "../controllers/tarefaController.js";

const router = Router();

router.use(autenticar);
router.get("/", listar);
router.get("/:id", buscar);
router.post("/", criar);
router.put("/:id", atualizar);
router.patch("/:id", atualizar);
router.delete("/:id", excluir);

export default router;
