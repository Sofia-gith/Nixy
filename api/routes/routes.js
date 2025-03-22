import express from "express"

const routes = express.Router();

import { getUsers, createUser, updateUser, deleteUser, login } from "../controllers/UserController.js";

routes.get("/getUsers", getUsers);
routes.post("/createUser", createUser);
routes.put("/updateUser", updateUser);
routes.delete("/deleteUser", deleteUser);
routes.post("/login", login);

export default routes;