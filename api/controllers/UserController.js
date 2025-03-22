import { json } from "express";
import { db } from "../db.js";


export const getUsers = async (req, res) => {
    try {
        const query = "SELECT * FROM USUARIO_T01";

        const [data] = await db.query(query);

        return res.status(200).json(data);
    } catch (err) {
        console.error("Erro ao buscar usuários", err);
        return res.status(500).json(err);
    }
}

export const createUser = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        const query = "INSERT INTO USUARIO_T01 (NOME_USUARIO_T01, EMAIL_USUARIO_T01, SENHA_USUARIO_T01) VALUES (?, ?, ?)";

        const values = [nome, email, senha];

        const [result] = await db.query(query, values);

        console.log("Usuário criado com sucesso:", result);

        res.redirect('/cadastro');
    } catch (err) {
        console.error("Erro ao criar usuário", err);
        return res.status(500).json(err);
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id, nome, email, senha } = req.body;

        const [rows] = await db.query("SELECT * FROM USUARIO_T01 WHERE ID_USUARIO_T01 = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const user = rows[0];
        const updatedNome = nome || user.NOME_USUARIO_T01;
        const updatedEmail = email || user.EMAIL_USUARIO_T01;
        const updatedSenha = senha || user.SENHA_USUARIO_T01;

        const query = "UPDATE USUARIO_T01 SET NOME_USUARIO_T01 = ?, EMAIL_USUARIO_T01 = ?, SENHA_USUARIO_T01 = ? WHERE ID_USUARIO_T01 = ?";

        const values = [updatedNome, updatedEmail, updatedSenha, id];

        const [result] = await db.query(query, values);

        console.log("Usuário atualizado com sucesso:", result);

        return res.status(200).json(result);
    } catch (err) {
        console.error("Erro ao atualizar usuário", err);
        return res.status(500).json(err);
    }

}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.body;

        const [rows] = await db.query("SELECT * FROM USUARIO_T01 WHERE ID_USUARIO_T01 = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const query = "DELETE FROM USUARIO_T01 WHERE ID_USUARIO_T01 = ?";
        const [result] = await db.query(query, [id]);

        console.log("Usuário deletado com sucesso:", result);

        return res.status(200).json(result);
    } catch (err) {
        console.error("Erro ao deletar usuário", err);
        return res.status(500).json(err);
    }
}

export const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const [rows] = await db.query("SELECT * FROM USUARIO_T01 WHERE EMAIL_USUARIO_T01 = ? AND SENHA_USUARIO_T01 = ?", [email, senha]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        const user = rows[0];

        req.session.user = user;

        console.log("Usuário logado com sucesso:", user);

        res.redirect('/');
    } catch (err) {
        console.error("Erro ao fazer login", err);
        return res.status(500).json(err);
    }
}