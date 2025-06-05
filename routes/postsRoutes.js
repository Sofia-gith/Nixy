import express from "express";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import { criarPostagem, adicionarOuAtualizarAvaliacao } from "../controllers/PostController.js";

console.log('Rotas de postagens carregadas');
const router = express.Router();


router.post('/:id/avaliar', adicionarOuAtualizarAvaliacao);
router.post("/", uploadMiddleware, criarPostagem);

export default router;
