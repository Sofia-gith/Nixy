import express from "express";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import { criarPostagem } from "../controllers/PostController.js";

const router = express.Router();

router.post("/", uploadMiddleware, criarPostagem);

export default router;
