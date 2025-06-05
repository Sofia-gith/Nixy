import { Router } from 'express';
import { criarComunidade } from '../controllers/ComuniController.js';
import { adicionarOuAtualizarAvaliacao } from '../controllers/postController.js';

const router = Router();

router.post('/', criarComunidade);
router.post('/:id/avaliar', adicionarOuAtualizarAvaliacao);

export default router;

