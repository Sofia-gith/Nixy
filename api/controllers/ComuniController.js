import { db } from "../db.js";

// Função de criar comunidade (modo teste sem sessão)
export async function criarComunidade(req, res) {
  try {
    const { nome, descricao, idUsuarioCriador } = req.body; 

    if (!nome) {
      return res.status(400).json({ error: 'Nome da comunidade é obrigatório' });
    }

    if (!idUsuarioCriador) {
      return res.status(400).json({ error: 'idUsuarioCriador é obrigatório para teste' });
    }
    const [existing] = await db.query(
      'SELECT * FROM comunidade_t14 WHERE NOME_COMUNIDADE_T14 = ?',
      [nome]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Já existe uma comunidade com este nome' });
    }

    const [result] = await db.query(
      'INSERT INTO comunidade_t14 (NOME_COMUNIDADE_T14, DESCRICAO_COMUNIDADE_T14, ID_USUARIO_CRIADOR) VALUES (?, ?, ?)',
      [nome, descricao || null, idUsuarioCriador]
    );

    // Insere na tabela de relação usuário-comunidade
    await db.query(
      'INSERT INTO usuario_comunidade_t15 (ID_USUARIO_T01, ID_COMUNIDADE_T14) VALUES (?, ?)',
      [idUsuarioCriador, result.insertId]
    );

    res.status(201).json({
      id: result.insertId,
      nome,
      descricao: descricao || null,
      idUsuarioCriador
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar comunidade' });
  }
}


