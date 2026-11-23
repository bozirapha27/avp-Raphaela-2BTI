import { Router } from "express";
import { cadastrar, login } from "../controllers/authController.js";

const router = Router();

router.post("/usuarios", cadastrar);
router.post("/login", login);

export default router;
