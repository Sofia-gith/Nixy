import { db } from "../db.js";

// Verifica se o usuário é moderador de uma comunidade específica

export const verificarModerador = async (req, res, next) => {
    const { id } = req.params; // Agora usando 'id' em vez de 'comunidadeId'
    const userId = req.session.user?.ID_USUARIO_T01;

    console.log(`Verificando moderador - ComunidadeID: ${id}, UserID: ${userId}`);

    if (!userId) {
        return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    try {
        const [result] = await db.query(`
            SELECT 
                c.ID_USUARIO_CRIADOR,
                (SELECT COUNT(*) FROM moderadores_comunidade 
                 WHERE ID_COMUNIDADE_T14 = ? AND ID_USUARIO_T01 = ?) AS is_moderador
            FROM comunidade_t14 c
            WHERE c.ID_COMUNIDADE_T14 = ?
        `, [id, userId, id]);

        console.log('Resultado da query:', result);

        if (result.length === 0) {
            console.log('Comunidade não encontrada no banco de dados');
            return res.status(404).json({ erro: 'Comunidade não encontrada' });
        }

        const isCriador = result[0].ID_USUARIO_CRIADOR === userId;
        const isModerador = result[0].is_moderador > 0;

        if (!isCriador && !isModerador) {
            return res.status(403).json({ erro: 'Acesso negado: você não é moderador desta comunidade' });
        }

        req.isCriador = isCriador;
        next();
    } catch (err) {
        console.error('Erro detalhado ao verificar moderador:', err);
        return res.status(500).json({ erro: 'Erro interno ao verificar permissões' });
    }
};

// Adiciona um moderador à comunidade (apenas o criador pode fazer isso)
export const adicionarModerador = async (req, res) => {
    const { comunidadeId } = req.params;
    const { userId } = req.body;
    const criadorId = req.session.user?.ID_USUARIO_T01;

    if (!req.isCriador) {
        return res.status(403).json({ erro: 'Apenas o criador da comunidade pode adicionar moderadores' });
    }

    try {
        // Verifica se o usuário já é moderador
        const [check] = await db.query(
            'SELECT * FROM moderadores_comunidade WHERE ID_COMUNIDADE_T14 = ? AND ID_USUARIO_T01 = ?',
            [comunidadeId, userId]
        );

        if (check.length > 0) {
            return res.status(400).json({ erro: 'Este usuário já é moderador desta comunidade' });
        }

        // Adiciona como moderador
        await db.query(
            'INSERT INTO moderadores_comunidade (ID_COMUNIDADE_T14, ID_USUARIO_T01, DATA_NOMECAO) VALUES (?, ?, NOW())',
            [comunidadeId, userId]
        );

        res.status(201).json({ mensagem: 'Moderador adicionado com sucesso' });
    } catch (err) {
        console.error('Erro ao adicionar moderador:', err);
        return res.status(500).json({ erro: 'Erro interno ao adicionar moderador' });
    }
};

// Remove um moderador da comunidade (apenas o criador pode fazer isso)
export const removerModerador = async (req, res) => {
    const { comunidadeId, userId } = req.params;
    const criadorId = req.session.user?.ID_USUARIO_T01;

    if (!req.isCriador) {
        return res.status(403).json({ erro: 'Apenas o criador da comunidade pode remover moderadores' });
    }

    try {
        // Não permite remover o criador
        const [comunidade] = await db.query(
            'SELECT ID_USUARIO_CRIADOR FROM comunidade_t14 WHERE ID_COMUNIDADE_T14 = ?',
            [comunidadeId]
        );

        if (comunidade[0].ID_USUARIO_CRIADOR === parseInt(userId)) {
            return res.status(400).json({ erro: 'Não é possível remover o criador da comunidade' });
        }

        // Remove o moderador
        const [result] = await db.query(
            'DELETE FROM moderadores_comunidade WHERE ID_COMUNIDADE_T14 = ? AND ID_USUARIO_T01 = ?',
            [comunidadeId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Moderador não encontrado nesta comunidade' });
        }

        res.status(200).json({ mensagem: 'Moderador removido com sucesso' });
    } catch (err) {
        console.error('Erro ao remover moderador:', err);
        return res.status(500).json({ erro: 'Erro interno ao remover moderador' });
    }
};

// Deleta uma comunidade (apenas criador ou moderadores)
export const deletarComunidade = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user?.ID_USUARIO_T01;

    console.log('\n=== INÍCIO DO PROCESSO DE DELEÇÃO ===');
    console.log('Tentando deletar comunidade ID:', id); 
    console.log('Usuário autenticado ID:', userId);

    if (!userId) {
        console.log('Erro: Usuário não autenticado');
        return res.status(401).json({ erro: 'Usuário não autenticado' });
    }

    try {
        console.log('\n[1/6] Verificando comunidade...');
        const [comunidade] = await db.query(
            'SELECT ID_USUARIO_CRIADOR FROM comunidade_t14 WHERE ID_COMUNIDADE_T14 = ?',
            [id]
        );

        if (comunidade.length === 0) {
            console.log('Erro: Comunidade não encontrada');
            return res.status(404).json({ erro: 'Comunidade não encontrada' });
        }

        if (comunidade[0].ID_USUARIO_CRIADOR !== userId) {
            console.log('Erro: Apenas o criador pode deletar');
            return res.status(403).json({ erro: 'Apenas o criador pode deletar a comunidade' });
        }

        console.log('\n[2/6] Removendo membros da comunidade...');
        await db.query(
            'DELETE FROM usuario_comunidade_t15 WHERE ID_COMUNIDADE_T14 = ?',
            [id]
        );

        console.log('\n[3/6] Removendo moderadores...');
        await db.query(
            'DELETE FROM moderadores_comunidade WHERE ID_COMUNIDADE_T14 = ?',
            [id]
        );

        console.log('\n[4/6] Buscando posts para remover avaliações...');
        const [posts] = await db.query(
            'SELECT ID_POST_T05 FROM POST_T05 WHERE ID_COMUNIDADE_T14 = ?',
            [id]
        );

        console.log(`Encontrados ${posts.length} posts para remover`);
        for (const post of posts) {
            console.log(`Removendo avaliações do post ${post.ID_POST_T05}...`);
            await db.query(
                'DELETE FROM AVALIACAO_T08 WHERE ID_POST_T05 = ?',
                [post.ID_POST_T05]
            );
        }

        console.log('\n[5/6] Removendo posts...');
        await db.query(
            'DELETE FROM POST_T05 WHERE ID_COMUNIDADE_T14 = ?',
            [id]
        );

        console.log('\n[6/6] Removendo comunidade...');
        await db.query(
            'DELETE FROM comunidade_t14 WHERE ID_COMUNIDADE_T14 = ?',
            [id]
        );

        console.log('\n=== DELEÇÃO CONCLUÍDA COM SUCESSO ===');
        
        return res.status(200).json({ mensagem: 'Comunidade deletada com sucesso' });
    } catch (err) {
        console.error('\n=== ERRO DURANTE A DELEÇÃO ===');
        console.error('Erro detalhado:', err);
        
        return res.status(500).json({ 
            erro: 'Erro interno ao deletar comunidade',
            detalhes: process.env.NODE_ENV === 'development' ? err.message : null
        });
    }
};

// Lista moderadores de uma comunidade
export const listarModeradores = async (req, res) => {
    const { comunidadeId } = req.params;

    try {
        const [moderadores] = await db.query(`
            SELECT 
                u.ID_USUARIO_T01 as id,
                u.NOME_USUARIO_T01 as nome,
                u.FOTO_PERFIL_URL as foto,
                CASE 
                    WHEN c.ID_USUARIO_CRIADOR = u.ID_USUARIO_T01 THEN 'Criador'
                    ELSE 'Moderador'
                END as tipo
            FROM usuario_t01 u
            LEFT JOIN comunidade_t14 c ON c.ID_USUARIO_CRIADOR = u.ID_USUARIO_T01 AND c.ID_COMUNIDADE_T14 = ?
            WHERE 
                c.ID_USUARIO_CRIADOR = u.ID_USUARIO_T01 OR
                u.ID_USUARIO_T01 IN (
                    SELECT ID_USUARIO_T01 FROM moderadores_comunidade 
                    WHERE ID_COMUNIDADE_T14 = ?
                )
        `, [comunidadeId, comunidadeId]);

        res.status(200).json(moderadores);
    } catch (err) {
        console.error('Erro ao listar moderadores:', err);
        return res.status(500).json({ erro: 'Erro interno ao listar moderadores' });
    }
};