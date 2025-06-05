import express from 'express';
import { db } from '../db.js';
import { ensureAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

// GET: lista de anotações
router.get('/', ensureAuthenticated, async (req, res) => {
  const userId = req.session.user.ID_USUARIO_T01;

  const [anotacoes] = await db.query(
    "SELECT * FROM ANOTACAO_T01 WHERE ID_USUARIO_T01 = ? ORDER BY DATA_CRIACAO DESC",
    [userId]
  );

  res.render('anotacoes', {
    user: req.session.user,
    usuarioNome: req.session.user.NOME_USUARIO_T01,
    mostrarMenu: true,
    anotacoes
  });
});

// POST: criar nova anotação
router.post('/nova', ensureAuthenticated, async (req, res) => {
  const { titulo, conteudo } = req.body;
  const userId = req.session.user.ID_USUARIO_T01;

  await db.query(
    "INSERT INTO ANOTACAO_T01 (ID_USUARIO_T01, TITULO_ANOTACAO_T01, TEXTO) VALUES (?, ?, ?)",
    [userId, titulo, conteudo]
  );

  res.redirect('/anotacoes');
});

// POST: editar anotação
router.post('/editar', ensureAuthenticated, async (req, res) => {
  const { id, titulo, conteudo } = req.body;
  const userId = req.session.user.ID_USUARIO_T01;

  await db.query(
    "UPDATE ANOTACAO_T01 SET TITULO_ANOTACAO_T01 = ?, TEXTO = ? WHERE ID_ANOTACAO_T01 = ? AND ID_USUARIO_T01 = ?",
    [titulo, conteudo, id, userId]
  );

  res.redirect('/anotacoes');
});

// POST: excluir anotação
router.post('/excluir/:id', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;

  await db.query(
    "DELETE FROM ANOTACAO_T01 WHERE ID_ANOTACAO_T01 = ? AND ID_USUARIO_T01 = ?",
    [id, req.session.user.ID_USUARIO_T01]
  );

  res.redirect('/anotacoes');
});

export default router;
