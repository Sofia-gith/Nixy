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

// Adicione esta função ao seu comuniController.js
export const getComunidadePorId = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user?.ID_USUARIO_T01 || 0;

    try {
        const [comunidade] = await db.query(`
            SELECT 
                c.*,
                u.NOME_USUARIO_T01 as nome_criador,
                u.FOTO_PERFIL_URL as foto_criador,
                (SELECT COUNT(*) FROM usuario_comunidade_t15 
                 WHERE ID_COMUNIDADE_T14 = c.ID_COMUNIDADE_T14) as total_membros,
                CASE 
                    WHEN c.ID_USUARIO_CRIADOR = ? THEN TRUE
                    ELSE FALSE
                END as is_criador,
                (SELECT COUNT(*) FROM moderadores_comunidade 
                 WHERE ID_COMUNIDADE_T14 = c.ID_COMUNIDADE_T14 AND ID_USUARIO_T01 = ?) as is_moderador
            FROM comunidade_t14 c
            JOIN usuario_t01 u ON c.ID_USUARIO_CRIADOR = u.ID_USUARIO_T01
            WHERE c.ID_COMUNIDADE_T14 = ?
        `, [userId, userId, id]);

        if (comunidade.length === 0) {
            return res.status(404).json({ erro: 'Comunidade não encontrada' });
        }

        res.status(200).json(comunidade[0]);
    } catch (err) {
        console.error('Erro ao buscar comunidade:', err);
        return res.status(500).json({ erro: 'Erro interno ao buscar comunidade' });
    }
};
