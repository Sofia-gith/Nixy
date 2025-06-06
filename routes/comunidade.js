import { Router } from 'express';
import { criarComunidade } from '../controllers/ComuniController.js';
import { adicionarOuAtualizarAvaliacao } from '../controllers/postController.js';
import { deletarComunidade } from '../controllers/moderadorController.js';

const router = Router();

router.post('/', criarComunidade);
router.post('/:id/avaliar', adicionarOuAtualizarAvaliacao);
router.delete('/:id', deletarComunidade);

export default router;

