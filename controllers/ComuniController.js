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


// Função para seguir/participar de uma comunidade
export const seguirComunidade = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user?.ID_USUARIO_T01;

    if (!userId) {
        return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    try {
        // Verifica se já é membro
        const [membro] = await db.query(
            'SELECT * FROM usuario_comunidade_t15 WHERE ID_USUARIO_T01 = ? AND ID_COMUNIDADE_T14 = ?',
            [userId, id]
        );

        if (membro.length > 0) {
            return res.status(400).json({ erro: 'Usuário já é membro desta comunidade' });
        }

        // Adiciona como membro
        await db.query(
            'INSERT INTO usuario_comunidade_t15 (ID_USUARIO_T01, ID_COMUNIDADE_T14) VALUES (?, ?)',
            [userId, id]
        );

        res.status(200).json({ mensagem: 'Agora você é membro desta comunidade!' });
    } catch (err) {
        console.error('Erro ao seguir comunidade:', err);
        res.status(500).json({ erro: 'Erro interno ao seguir comunidade' });
    }
};

// Função para adicionar moderador (apenas criador pode fazer isso)
export const adicionarModerador = async (req, res) => {
    const { idComunidade, idUsuario } = req.params;
    const userId = req.session.user?.ID_USUARIO_T01;

    try {
        // Verifica se o usuário atual é o criador
        const [comunidade] = await db.query(
            'SELECT ID_USUARIO_CRIADOR FROM comunidade_t14 WHERE ID_COMUNIDADE_T14 = ?',
            [idComunidade]
        );

        if (comunidade.length === 0) {
            return res.status(404).json({ erro: 'Comunidade não encontrada' });
        }

        if (comunidade[0].ID_USUARIO_CRIADOR !== userId) {
            return res.status(403).json({ erro: 'Apenas o criador pode adicionar moderadores' });
        }

        // Verifica se o usuário já é moderador
        const [moderador] = await db.query(
            'SELECT * FROM moderadores_comunidade WHERE ID_USUARIO_T01 = ? AND ID_COMUNIDADE_T14 = ?',
            [idUsuario, idComunidade]
        );

        if (moderador.length > 0) {
            return res.status(400).json({ erro: 'Este usuário já é moderador desta comunidade' });
        }

        // Adiciona como moderador
        await db.query(
            'INSERT INTO moderadores_comunidade (ID_USUARIO_T01, ID_COMUNIDADE_T14) VALUES (?, ?)',
            [idUsuario, idComunidade]
        );

        res.status(200).json({ mensagem: 'Moderador adicionado com sucesso!' });
    } catch (err) {
        console.error('Erro ao adicionar moderador:', err);
        res.status(500).json({ erro: 'Erro interno ao adicionar moderador' });
    }
};

// Função para listar membros da comunidade
export const listarMembros = async (req, res) => {
    const { id } = req.params;

    try {
        const [membros] = await db.query(`
            SELECT 
                u.ID_USUARIO_T01,
                u.NOME_USUARIO_T01,
                u.FOTO_PERFIL_URL,
                CASE 
                    WHEN c.ID_USUARIO_CRIADOR = u.ID_USUARIO_T01 THEN 'Criador'
                    WHEN EXISTS (
                        SELECT 1 FROM moderadores_comunidade 
                        WHERE ID_USUARIO_T01 = u.ID_USUARIO_T01 
                        AND ID_COMUNIDADE_T14 = ?
                    ) THEN 'Moderador'
                    ELSE 'Membro'
                END as cargo
            FROM usuario_comunidade_t15 uc
            JOIN usuario_t01 u ON uc.ID_USUARIO_T01 = u.ID_USUARIO_T01
            JOIN comunidade_t14 c ON uc.ID_COMUNIDADE_T14 = c.ID_COMUNIDADE_T14
            WHERE uc.ID_COMUNIDADE_T14 = ?
        `, [id, id]);

        res.status(200).json(membros);
    } catch (err) {
        console.error('Erro ao listar membros:', err);
        res.status(500).json({ erro: 'Erro interno ao listar membros' });
    }
};