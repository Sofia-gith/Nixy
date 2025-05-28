import { Router } from 'express';
import { criarComunidade } from '../controllers/ComuniController.js';

const router = Router();

router.post('/', criarComunidade);

export default router;

