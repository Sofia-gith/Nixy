import express from "express"
const routes = express.Router();
import upload from '../middlewares/upload.js';
import { deletarPostagem, atualizarPostagem } from "../controllers/PostController.js";
import { buscarConteudo } from "../controllers/searchController.js";
import { mudarNome } from "../controllers/UserController.js";
import { 
    criarComentario, 
    getComentariosPorPost, 
    atualizarComentario, 
    deletarComentario,
    criarRespostaComentario,
    getRespostasPorComentario,
    deletarResposta
} from "../controllers/comentarioController.js";
import { uploadFotoPerfil } from "../controllers/UserController.js";
import { getUsers, createUser, updateUser, deleteUser, login } from "../controllers/UserController.js";
import { esqueceuSenha, exibirFormularioReset, formularioResetarSenha, redefinirSenha } from "../controllers/UserController.js";
import * as postController from "../controllers/PostController.js"; // Adicione esta linha


// Rotas de upload
routes.post("/upload-foto", upload.single("foto"), (req, res) => {
  console.log("Arquivo recebido:", req.file);
  res.redirect("/usuario"); 
});

routes.post("/upload-foto/:id", upload.single("foto"), uploadFotoPerfil);

// Rotas de usuário
routes.get("/getUsers", getUsers);
routes.post('/mudarNome', mudarNome);
routes.post("/createUser", createUser);
routes.put("/updateUser", updateUser);
routes.delete("/deleteUser", deleteUser);
routes.post("/login", login);

// Rotas de recuperação de senha
routes.get("/esqueci-senha", (req, res) => {
    res.render("esqueciAsenha", { mensagem: null });
});
routes.post("/esqueci-senha", esqueceuSenha);
routes.get('/resetar-senha/:token', exibirFormularioReset);
routes.post('/resetarSenha/:token', redefinirSenha);

// Rotas de postagem
routes.delete("/post/:id", deletarPostagem);
routes.put("/post/:id", atualizarPostagem);

// Rota para posts de comunidade (CORRIGIDA - usando routes em vez de router)
routes.get('/comunidade/:id/posts', postController.getPostagensPorComunidade);

// Rotas para comentários
routes.post("/comentario", criarComentario);
routes.get("/post/:id/comentarios", getComentariosPorPost);
routes.put("/comentario/:id", atualizarComentario);
routes.delete("/comentario/:id", deletarComentario);

// Rotas para respostas de comentários
routes.post('/resposta-comentario', criarRespostaComentario);
routes.get("/comentario/:id/respostas", getRespostasPorComentario);
routes.delete("/resposta-comentario/:id", deletarResposta);

// Rota de busca
routes.get("/buscar", buscarConteudo);
  
export default routes;