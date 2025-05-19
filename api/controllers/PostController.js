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
        // Função para atualizar uma postagem
export const atualizarPostagem = (req, res) => {
    const id = req.params.id;
    const { TITULO_POST_T05, CONTEUDO_POST_T05, CATEGORIA_POST_T05 } = req.body;

    if (!TITULO_POST_T05 || !CONTEUDO_POST_T05) {
        return res.status(400).json({ erro: 'Campos obrigatórios não preenchidos' });
    }

    const query = `
        UPDATE POST_T05
        SET TITULO_POST_T05 = ?, CONTEUDO_POST_T05 = ?, CATEGORIA_POST_T05 = ?
        WHERE ID_POST_T05 = ?
    `;

    db.query(query, [TITULO_POST_T05, CONTEUDO_POST_T05, CATEGORIA_POST_T05 || null, id])
        .then(result => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ erro: 'Postagem não encontrada' });
            }
            res.status(200).json({ mensagem: 'Postagem atualizada com sucesso' });
        })
        .catch(err => {
            console.error('Erro ao atualizar postagem:', err);
            return res.status(500).json({ erro: 'Erro interno ao atualizar postagem' });
        });
};

    // Função para deletar uma postagem
export const deletarPostagem = (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM POST_T05 WHERE ID_POST_T05 = ?';

    db.query(query, [id])
        .then(result => {
            if (result.affectedRows === 0) {
                return res.status(404).json({ erro: 'Postagem não encontrada' });
            }
            res.status(200).json({ mensagem: 'Postagem deletada com sucesso' });
        })
        .catch(err => {
            console.error('Erro ao deletar postagem:', err);
            return res.status(500).json({ erro: 'Erro interno ao deletar postagem' });
        });
};

// Função para curtir uma postagem
export const curtirPostagem = (req, res) => {
    const idPost = req.params.id;
    const idUsuario = req.body.ID_USUARIO_T01;  // Isso garante que o usuário esta logado eu acho 

    // Verificar se o usuário já avaliou essa postagem
    const checkQuery = 'SELECT * FROM AVALIACAO_T08 WHERE ID_POST_T05 = ? AND ID_USUARIO_T01 = ?';

    db.query(checkQuery, [idPost, idUsuario])
        .then(result => {
            if (result.length > 0) {
                return res.status(400).json({ erro: 'Você já avaliou esta postagem.' });
            }

            // Inserir a avaliação (curtir)
            const insertQuery = `
                INSERT INTO AVALIACAO_T08 (ID_POST_T05, ID_USUARIO_T01)
                VALUES (?, ?)
            `;

            db.query(insertQuery, [idPost, idUsuario])
                .then(() => {
                    res.status(200).json({ mensagem: 'Postagem curtida com sucesso' });
                })
                .catch(err => {
                    console.error('Erro ao curtir postagem:', err);
                    return res.status(500).json({ erro: 'Erro interno ao curtir postagem' });
                });
        })
        .catch(err => {
            console.error('Erro ao verificar avaliação existente:', err);
            return res.status(500).json({ erro: 'Erro ao verificar avaliação' });
        });
};
// Função para adicionar ou atualizar avaliação (positiva ou negativa)
export const adicionarOuAtualizarAvaliacao = (req, res) => {
    const idPost = req.params.id;
    const idUsuario = req.body.ID_USUARIO_T01;  
    const tipoAvaliacao = req.body.TIPO_AVALIACAO_T08; 

    // Verificar se o tipo de avaliação é válido
    if (!['positivo', 'negativo'].includes(tipoAvaliacao)) {
        return res.status(400).json({ erro: 'Tipo de avaliação inválido. Use "positivo" ou "negativo".' });
    }

    // Verificar se o usuário já avaliou essa postagem
    const checkQuery = 'SELECT * FROM AVALIACAO_T08 WHERE ID_POST_T05 = ? AND ID_USUARIO_T01 = ?';

    db.query(checkQuery, [idPost, idUsuario])
        .then(result => {
            if (result.length > 0) {
                
                const updateQuery = `
                    UPDATE AVALIACAO_T08 
                    SET TIPO_AVALIACAO_T08 = ? 
                    WHERE ID_POST_T05 = ? AND ID_USUARIO_T01 = ?
                `;

                db.query(updateQuery, [tipoAvaliacao, idPost, idUsuario])
                    .then(() => {
                        res.status(200).json({ mensagem: 'Avaliação atualizada com sucesso' });
                    })
                    .catch(err => {
                        console.error('Erro ao atualizar avaliação:', err);
                        return res.status(500).json({ erro: 'Erro interno ao atualizar avaliação' });
                    });
            } else {
                const insertQuery = `
                    INSERT INTO AVALIACAO_T08 (ID_POST_T05, ID_USUARIO_T01, TIPO_AVALIACAO_T08)
                    VALUES (?, ?, ?)
                `;

                db.query(insertQuery, [idPost, idUsuario, tipoAvaliacao])
                    .then(() => {
                        res.status(200).json({ mensagem: 'Avaliação registrada com sucesso' });
                    })
                    .catch(err => {
                        console.error('Erro ao registrar avaliação:', err);
                        return res.status(500).json({ erro: 'Erro interno ao registrar avaliação' });
                    });
            }
        })
        .catch(err => {
            console.error('Erro ao verificar avaliação existente:', err);
            return res.status(500).json({ erro: 'Erro ao verificar avaliação' });
        });
};

// Função para remover a avaliação 
export const removerAvaliacao = (req, res) => {
    const idPost = req.params.id;
    const idUsuario = req.body.ID_USUARIO_T01;  

    // Verificar se o usuário já avaliou essa postagem
    const checkQuery = 'SELECT * FROM AVALIACAO_T08 WHERE ID_POST_T05 = ? AND ID_USUARIO_T01 = ?';

    db.query(checkQuery, [idPost, idUsuario])
        .then(result => {
            if (result.length === 0) {
                return res.status(400).json({ erro: 'Você não avaliou esta postagem.' });
            }

            // Remover a avaliação 
            const deleteQuery = 'DELETE FROM AVALIACAO_T08 WHERE ID_POST_T05 = ? AND ID_USUARIO_T01 = ?';

            db.query(deleteQuery, [idPost, idUsuario])
                .then(() => {
                    res.status(200).json({ mensagem: 'Avaliação removida com sucesso' });
                })
                .catch(err => {
                    console.error('Erro ao remover avaliação:', err);
                    return res.status(500).json({ erro: 'Erro interno ao remover avaliação' });
                });
        })
        .catch(err => {
            console.error('Erro ao verificar avaliação existente:', err);
            return res.status(500).json({ erro: 'Erro ao verificar avaliação' });
        });
};
