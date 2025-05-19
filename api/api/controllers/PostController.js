import { db } from "../db.js";

// Função para criar uma postagem
export const criarPostagem = (req, res) => {
    const { ID_USUARIO_T01, TITULO_POST_T05, CONTEUDO_POST_T05, CATEGORIA_POST_T05 } = req.body;

    if (!ID_USUARIO_T01 || !TITULO_POST_T05 || !CONTEUDO_POST_T05) {
        return res.status(400).json({ erro: 'Campos obrigatórios não preenchidos' });
    }

    const query = `
        INSERT INTO POST_T05 
        (ID_USUARIO_T01, TITULO_POST_T05, CONTEUDO_POST_T05, CATEGORIA_POST_T05) 
        VALUES (?, ?, ?, ?)
    `;

    db.query(query, [ID_USUARIO_T01, TITULO_POST_T05, CONTEUDO_POST_T05, CATEGORIA_POST_T05 || null])
        .then(result => {
            res.status(201).json({ mensagem: 'Postagem criada com sucesso', id_post: result.insertId });
        })
        .catch(err => {
            console.error('Erro ao criar postagem:', err);
            return res.status(500).json({ erro: 'Erro interno ao criar postagem' });
        });
};

// Função para obter todas as postagens
export const getTodasPostagens = (req, res) => {
    const query = 'SELECT * FROM POST_T05';

    db.query(query)
        .then(result => {
            res.status(200).json(result);
        })
        .catch(err => {
            console.error('Erro ao buscar postagens:', err);
            return res.status(500).json({ erro: 'Erro ao buscar postagens' });
        });
};

// Função para obter uma postagem por ID
export const getPostagemPorId = (req, res) => {
    const id = req.params.id;
    const query = 'SELECT * FROM POST_T05 WHERE ID_POST_T05 = ?';

    db.query(query, [id])
        .then(result => {
            if (result.length === 0) {
                return res.status(404).json({ erro: 'Postagem não encontrada' });
            }
            res.status(200).json(result[0]);
        })
        .catch(err => {
            console.error('Erro ao buscar postagem:', err);
            return res.status(500).json({ erro: 'Erro ao buscar postagem' });
        });
};
