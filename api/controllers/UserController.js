import bcrypt from "bcrypt";
import { db } from "../db.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

//esqueci a senha


export const esqueceuSenha = async (req, res) => {
    const { email } = req.body;

    // Salva o token no banco com tempo de expiração

    try {
        const usuario = { email }; 
        if (!usuario) {
            return res.render('esqueciAsenha', { mensagem: 'E-mail não encontrado.' });
        }

        const token = crypto.randomBytes(32).toString('hex');

        await db.query(
            "INSERT INTO RESET_SENHA_T01 (EMAIL, TOKEN, EXPIRA_EM) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))",
            [email, token]
            );

        const resetLink = `http://localhost:8080/resetar-senha/${token}`;

        let transporter;

        if (process.env.NODE_ENV === 'production') {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
        } else {
        
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
        }

        

    
        const info = await transporter.sendMail({
            from: '"Nixy App" <no-reply@nixy.com>',
            to: email,
            subject: 'Recuperação de Senha',
            html: `<p>Você solicitou uma recuperação de senha. Clique no link abaixo:</p>
                   <a href="${resetLink}">Redefinir senha</a>`,
        });

       
        if (process.env.NODE_ENV !== 'production') {
            console.log('📬 Preview email: %s', nodemailer.getTestMessageUrl(info));
        }

        res.render('esqueciAsenha', { mensagem: 'Email de recuperação enviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        res.render('esqueciAsenha', { mensagem: 'Erro ao enviar email.' });
    }
};


  //resetar a senha

  export const exibirFormularioReset = (req, res) => {
    const { token } = req.params;
    res.render("novaSenha", { token, mensagem: null });
  };

  export const redefinirSenha = async (req, res) => {
    const { token } = req.params;
    const { senha, confirmarSenha } = req.body;

    console.log("Senha:", senha);
    console.log("Confirmar Senha:", confirmarSenha);
  
    if (senha !== confirmarSenha) {
      return res.send("Senhas não coincidem.");
    }
  
    const [rows] = await db.query("SELECT * FROM RESET_SENHA_T01 WHERE TOKEN = ? AND EXPIRA_EM > NOW()", [token]);
  
    if (rows.length === 0) {
      return res.send("Token inválido ou expirado.");
    }
  
    const email = rows[0].EMAIL;
    const hashedSenha = await bcrypt.hash(senha, 10);
  
    await db.query("UPDATE USUARIO_T01 SET SENHA_USUARIO_T01 = ? WHERE EMAIL_USUARIO_T01 = ?", [hashedSenha, email]);
    await db.query("DELETE FROM RESET_SENHA_T01 WHERE EMAIL = ?", [email]);
  
    res.send("Senha redefinida com sucesso!");
  };

  export const formularioResetarSenha = async (req, res) => {
    const { token } = req.params;
    res.render("novaSenha", { token, mensagem: null });

    const [rows] = await db.query(
        "SELECT * FROM RESET_SENHA_T01 WHERE TOKEN = ? AND EXPIRA_EM > NOW()",
        [token]
    );
    

    if (rows.length === 0) {
        return res.send("Token inválido ou expirado.");
    }

    res.render("novaSenha", { token });
};

//crud

export const getUsers = async (req, res) => {
    try {
        const query = "SELECT * FROM USUARIO_T01";
        const [data] = await db.query(query);
        return res.status(200).json(data);
    } catch (err) {
        console.error("Erro ao buscar usuários", err);
        return res.status(500).json(err);
    }
};

export const createUser = async (req, res) => {
    try {
        const { nome, email, senha, confirmSenha } = req.body;

        if (senha.trim() !== confirmSenha.trim()) {
            return res.status(400).render("cadastro", {
                mostrarMenu: false,
                error: "As senhas não coincidem",
                nome,
                email
            });
        }

        if (senha.length < 8) {
            return res.status(400).render("cadastro", {
                mostrarMenu: false,
                error: "A senha precisa ter no mínimo 8 caracteres",
                nome,
                email
            });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const query = "INSERT INTO USUARIO_T01 (NOME_USUARIO_T01, EMAIL_USUARIO_T01, SENHA_USUARIO_T01) VALUES (?, ?, ?)";
        const values = [nome, email, hashedPassword];

        const [result] = await db.query(query, values);

        console.log("Usuário criado com sucesso:", result);
        res.redirect('/login');
    } catch (err) {
        console.error("Erro ao criar usuário", err);
        return res.status(500).render("cadastro", {
            mostrarMenu: false,
            error: "Erro ao criar usuário. Tente novamente",
            nome: req.body.nome,
            email: req.body.email
        });
    }
};

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
        const updatedSenha = senha ? await bcrypt.hash(senha, 10) : user.SENHA_USUARIO_T01;

        const query = "UPDATE USUARIO_T01 SET NOME_USUARIO_T01 = ?, EMAIL_USUARIO_T01 = ?, SENHA_USUARIO_T01 = ? WHERE ID_USUARIO_T01 = ?";
        const values = [updatedNome, updatedEmail, updatedSenha, id];

        const [result] = await db.query(query, values);

        console.log("Usuário atualizado com sucesso:", result);
        return res.status(200).json(result);
    } catch (err) {
        console.error("Erro ao atualizar usuário", err);
        return res.status(500).json(err);
    }
};

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
};

export const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const [rows] = await db.query("SELECT * FROM USUARIO_T01 WHERE EMAIL_USUARIO_T01 = ?", [email]);

        if (rows.length === 0) {
            return res.status(404).render("login", {
                mostrarMenu: false,
                error: "Usuário não encontrado",
                email
            });
        }

        const user = rows[0];
        const senhaValida = await bcrypt.compare(senha, user.SENHA_USUARIO_T01);

        if (!senhaValida) {
            return res.status(401).render("login", {
                mostrarMenu: false,
                error: "Senha incorreta",
                email
            });
        }

        req.session.user = user;
        console.log("Usuário logado com sucesso:", user);

        res.redirect('/');
    } catch (err) {
        console.error("Erro ao fazer login", err);
        return res.status(500).render("login", {
            mostrarMenu: false,
            error: "Erro no login. Tente novamente.",
            email: req.body.email
        });
    }
};