import { db } from "../db.js";

export const buscarConteudo = async (req, res) => {
    try {
        const { termo } = req.query;
        
        if (!termo || termo.trim() === '') {
            return res.status(400).json({ erro: 'Termo de busca é obrigatório' });
        }

        // Busca comunidades
        const [comunidades] = await db.query(`
            SELECT 
                c.ID_COMUNIDADE_T14 as id,
                c.NOME_COMUNIDADE_T14 as nome,
                c.DESCRICAO_COMUNIDADE_T14 as descricao,
                COUNT(uc.ID_USUARIO_T01) as total_membros
            FROM comunidade_t14 c
            LEFT JOIN usuario_comunidade_t15 uc ON c.ID_COMUNIDADE_T14 = uc.ID_COMUNIDADE_T14
            WHERE c.NOME_COMUNIDADE_T14 LIKE ?
            GROUP BY c.ID_COMUNIDADE_T14
            ORDER BY total_membros DESC
            LIMIT 5
        `, [`%${termo}%`]);

        // Busca posts - CORRIGIDO: removido o JOIN com comunidade_t14
        const [posts] = await db.query(`
            SELECT 
                p.ID_POST_T05 as id,
                p.TITULO_POST_T05 as titulo,
                p.CONTEUDO_POST_T05 as conteudo,
                u.NOME_USUARIO_T01 as autor,
                p.DATA_CRIACAO_POST_T05 as data
            FROM POST_T05 p
            JOIN USUARIO_T01 u ON p.ID_USUARIO_T01 = u.ID_USUARIO_T01
            WHERE p.TITULO_POST_T05 LIKE ? OR p.CONTEUDO_POST_T05 LIKE ?
            ORDER BY p.DATA_CRIACAO_POST_T05 DESC
            LIMIT 5
        `, [`%${termo}%`, `%${termo}%`]);

        res.status(200).json({
            comunidades,
            posts
        });
    } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).json({ erro: 'Erro interno ao realizar busca' });
    }
};