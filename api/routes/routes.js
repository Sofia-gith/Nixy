import express from "express"

const routes = express.Router();

import { getUsers, createUser, updateUser, deleteUser, login } from "../controllers/UserController.js";
import { esqueceuSenha,  exibirFormularioReset, formularioResetarSenha, redefinirSenha } from "../controllers/UserController.js";

routes.get("/getUsers", getUsers);
routes.post("/createUser", createUser);
routes.put("/updateUser", updateUser);
routes.delete("/deleteUser", deleteUser);
routes.post("/login", login);

routes.get("/esqueci-senha", (req, res) => {
    res.render("esqueciAsenha", { mensagem: null });
  });
  routes.post("/esqueci-senha", esqueceuSenha);
  routes.get('/resetar-senha/:token', exibirFormularioReset);

routes.post('/resetarSenha/:token', redefinirSenha);

  
export default routes;