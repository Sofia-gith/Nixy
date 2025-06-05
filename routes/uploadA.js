import express from "express";
import multerUpload from "../middlewares/upload.js"; 
import { upload } from "./cloudinary.js"; 
import { uploadFotoPerfil } from "../controllers/userController.js";
import { criarPostagem } from "../controllers/postController.js";

const router = express.Router();

router.post("/postagens", multerUpload.single("arquivo"), criarPostagem);

router.post("/upload-foto/:id", multerUpload.single("foto"), uploadFotoPerfil);

export default router;
