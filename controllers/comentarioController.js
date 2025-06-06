import { db } from "../db.js";


// Criar um novo comentário
export const criarComentario = async (req, res) => {
    try {
        const { ID_POST_T05, ID_USUARIO_T01, CONTEUDO_COMENTARIO_T06 } = req.body;

        if (!ID_POST_T05 || !ID_USUARIO_T01 || !CONTEUDO_COMENTARIO_T06) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }

        const query = `
            INSERT INTO COMENTARIO_T06 
            (ID_POST_T05, ID_USUARIO_T01, CONTEUDO_COMENTARIO_T06) 
            VALUES (?, ?, ?)
        `;

        const [result] = await db.query(query, [ID_POST_T05, ID_USUARIO_T01, CONTEUDO_COMENTARIO_T06]);

        res.status(201).json({
            mensagem: 'Comentário criado com sucesso',
            id_comentario: result.insertId
        });

    } catch (err) {
        console.error('Erro ao criar comentário:', err);
        res.status(500).json({
            erro: 'Erro interno ao criar comentário',
            detalhes: err.message
        });
    }
};

// Obter todos os comentários de um post
export const getComentariosPorPost = async (req, res) => {


    try {
        const postId = req.params.id;

        // Em getComentariosPorPost
        const query = `
    SELECT 
        c.ID_COMENTARIO_T06 as id,
        c.CONTEUDO_COMENTARIO_T06 as conteudo,
        c.DATA_CRIACAO_COMENTARIO_T06 as data,
        u.ID_USUARIO_T01 as autor_id,
        u.NOME_USUARIO_T01 as autor,
        u.FOTO_PERFIL_URL as autor_foto,
        (SELECT COUNT(*) FROM RESPOSTA_COMENTARIO_T07 r 
         WHERE r.ID_COMENTARIO_T06 = c.ID_COMENTARIO_T06) as total_respostas
    FROM COMENTARIO_T06 c
    JOIN USUARIO_T01 u ON c.ID_USUARIO_T01 = u.ID_USUARIO_T01
    WHERE c.ID_POST_T05 = ?
    ORDER BY c.DATA_CRIACAO_COMENTARIO_T06 ASC
`;

        const [comentarios] = await db.query(query, [postId]);

        res.status(200).json(comentarios);

    } catch (err) {
        console.error('Erro ao buscar comentários:', err);
        res.status(500).json({
            erro: 'Erro interno ao buscar comentários',
            detalhes: err.message
        });
    }
};

// Atualizar um comentário
export const atualizarComentario = async (req, res) => {
    try {
        const comentarioId = req.params.id;
        const { CONTEUDO_COMENTARIO_T06, ID_USUARIO_T01 } = req.body;

        if (!CONTEUDO_COMENTARIO_T06) {
            return res.status(400).json({ erro: 'Conteúdo do comentário é obrigatório' });
        }

        // Verifica se o comentário existe e se o usuário é o autor
        const [checkResult] = await db.query(
            'SELECT ID_USUARIO_T01 FROM COMENTARIO_T06 WHERE ID_COMENTARIO_T06 = ?',
            [comentarioId]
        );

        if (checkResult.length === 0) {
            return res.status(404).json({ erro: 'Comentário não encontrado' });
        }

        if (checkResult[0].ID_USUARIO_T01 !== ID_USUARIO_T01) {
            return res.status(403).json({ erro: 'Você não tem permissão para editar este comentário' });
        }

        // Atualiza o comentário
        const [result] = await db.query(
            'UPDATE COMENTARIO_T06 SET CONTEUDO_COMENTARIO_T06 = ? WHERE ID_COMENTARIO_T06 = ?',
            [CONTEUDO_COMENTARIO_T06, comentarioId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Comentário não encontrado' });
        }

        res.status(200).json({ mensagem: 'Comentário atualizado com sucesso' });

    } catch (err) {
        console.error('Erro ao atualizar comentário:', err);
        res.status(500).json({ erro: 'Erro interno ao atualizar comentário' });
    }
};

// Deletar um comentário
export const deletarComentario = async (req, res) => {
    try {
        const comentarioId = req.params.id;
        const userId = req.body.ID_USUARIO_T01;

        if (!userId) {
            return res.status(401).json({ erro: 'Usuário não autenticado' });
        }

        // Verifica se o comentário existe e se o usuário é o autor
        const [checkResult] = await db.query(
            'SELECT ID_USUARIO_T01 FROM COMENTARIO_T06 WHERE ID_COMENTARIO_T06 = ?',
            [comentarioId]
        );

        if (checkResult.length === 0) {
            return res.status(404).json({ erro: 'Comentário não encontrado' });
        }

        if (checkResult[0].ID_USUARIO_T01 !== userId) {
            return res.status(403).json({ erro: 'Você não tem permissão para deletar este comentário' });
        }

        // Deleta o comentário
        const [result] = await db.query(
            'DELETE FROM COMENTARIO_T06 WHERE ID_COMENTARIO_T06 = ?',
            [comentarioId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Comentário não encontrado' });
        }

        res.status(200).json({ mensagem: 'Comentário deletado com sucesso' });

    } catch (err) {
        console.error('Erro ao deletar comentário:', err);
        res.status(500).json({ erro: 'Erro interno ao deletar comentário' });
    }
};


//resposta comentarios

// Criar uma resposta a um comentário
export const criarRespostaComentario = async (req, res) => {
    try {
        const { ID_COMENTARIO_T06, ID_USUARIO_T01, CONTEUDO_RESPOSTA_T07 } = req.body;

        if (!ID_COMENTARIO_T06 || !ID_USUARIO_T01 || !CONTEUDO_RESPOSTA_T07) {
            return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
        }

        const query = `
            INSERT INTO RESPOSTA_COMENTARIO_T07 
            (ID_COMENTARIO_T06, ID_USUARIO_T01, CONTEUDO_RESPOSTA_T07) 
            VALUES (?, ?, ?)
        `;

        const [result] = await db.query(query, [ID_COMENTARIO_T06, ID_USUARIO_T01, CONTEUDO_RESPOSTA_T07]);

        res.status(201).json({
            mensagem: 'Resposta criada com sucesso',
            id_resposta: result.insertId
        });

    } catch (err) {
        console.error('Erro ao criar resposta:', err);
        res.status(500).json({
            erro: 'Erro interno ao criar resposta',
            detalhes: err.message
        });
    }
};

// Obter todas as respostas de um comentário
export const getRespostasPorComentario = async (req, res) => {


    try {
        const comentarioId = req.params.id;

        const query = `
            SELECT 
                r.ID_RESPOSTA_T07 as id,
                r.CONTEUDO_RESPOSTA_T07 as conteudo,
                r.DATA_CRIACAO_RESPOSTA_T07 as data,
                u.ID_USUARIO_T01 as autor_id,
                u.NOME_USUARIO_T01 as autor,
                u.FOTO_PERFIL_URL as autor_foto
            FROM RESPOSTA_COMENTARIO_T07 r
            JOIN USUARIO_T01 u ON r.ID_USUARIO_T01 = u.ID_USUARIO_T01
            WHERE r.ID_COMENTARIO_T06 = ?
            ORDER BY r.DATA_CRIACAO_RESPOSTA_T07 ASC
        `;

        const [respostas] = await db.query(query, [comentarioId]);

        res.status(200).json(respostas);

    } catch (err) {
        console.error('Erro ao buscar respostas:', err);
        res.status(500).json({
            erro: 'Erro interno ao buscar respostas',
            detalhes: err.message
        });
    }
};

// Deletar uma resposta
export const deletarResposta = async (req, res) => {
    try {
        const respostaId = req.params.id;
        const userId = req.body.ID_USUARIO_T01;

        if (!userId) {
            return res.status(401).json({ erro: 'Usuário não autenticado' });
        }

        // Verifica se a resposta existe e se o usuário é o autor
        const [checkResult] = await db.query(
            'SELECT ID_USUARIO_T01 FROM RESPOSTA_COMENTARIO_T07 WHERE ID_RESPOSTA_T07 = ?',
            [respostaId]
        );

        if (checkResult.length === 0) {
            return res.status(404).json({ erro: 'Resposta não encontrada' });
        }

        if (checkResult[0].ID_USUARIO_T01 !== userId) {
            return res.status(403).json({ erro: 'Você não tem permissão para deletar esta resposta' });
        }

        // Deleta a resposta
        const [result] = await db.query(
            'DELETE FROM RESPOSTA_COMENTARIO_T07 WHERE ID_RESPOSTA_T07 = ?',
            [respostaId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Resposta não encontrada' });
        }

        res.status(200).json({ mensagem: 'Resposta deletada com sucesso' });

    } catch (err) {
        console.error('Erro ao deletar resposta:', err);
        res.status(500).json({ erro: 'Erro interno ao deletar resposta' });
    }
};