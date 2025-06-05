// postagen.js
import express from 'express';
import { 
    criarPostagem, 
    getTodasPostagens, 
    getPostagemPorId, 
    atualizarPostagem,  // Função de atualização de postagem
    deletarPostagem,    // Função de deletação de postagem
    adicionarOuAtualizarAvaliacao,  // Função de adicionar/atualizar avaliação
    removerAvaliacao    // Função de remover avaliação
  } from '../controllers/PostController.js';

const router = express.Router();

// Criar uma nova postagem
router.post('/', criarPostagem);

// Obter todas as postagens
router.get('/', getTodasPostagens);

// Obter uma postagem específica
router.get('/:id', getPostagemPorId);

// Atualizar uma postagem
router.put('/:id', atualizarPostagem);

// Deletar uma postagem
router.delete('/:id', deletarPostagem);

// Adicionar ou atualizar avaliação (positiva ou negativa)
router.post('/:id/avaliacao', adicionarOuAtualizarAvaliacao);

// Remover avaliação (positiva ou negativa)
router.delete('/:id/avaliacao', removerAvaliacao);

export default router;
