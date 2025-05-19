// postagen.js
import express from 'express';
import { criarPostagem, getTodasPostagens, getPostagemPorId } from '../controllers/PostController.js';

const router = express.Router();

// Criar uma nova postagem
router.post('/', criarPostagem);

// Obter todas as postagens
router.get('/', getTodasPostagens);

// Obter uma postagem específica
router.get('/:id', getPostagemPorId);

export default router;
