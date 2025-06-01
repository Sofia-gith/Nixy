import express from "express";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import { criarPostagem } from "../controllers/PostController.js";
import { adicionarOuAtualizarAvaliacao } from '../controllers/postController.js';
const router = express.Router();


router.post('/:id/avaliar', adicionarOuAtualizarAvaliacao);
router.post("/", uploadMiddleware, criarPostagem);

export default router;
