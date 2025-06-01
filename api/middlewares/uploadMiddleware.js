// middlewares/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: "dhhvgocpf",
  api_key: "519282846571695",
  api_secret: "76SJJsQGz32T6NxS2CyR6fYc9BU",
});

// Multer: armazenamento local temporário
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não suportado."));
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single("arquivo");

// Middleware final (upload + Cloudinary)
const uploadMiddleware = (req, res, next) => {
  multerUpload(req, res, async (err) => {
    console.log('Arquivo recebido:', req.file);
    
    if (err) {
      return res.status(400).json({ erro: err.message });
    }

    if (!req.file) {
      return next(); 
    }

    try {
      const filePath = req.file.path;

      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "raw", // aceita PDF, DOCX etc.
      });

      fs.unlinkSync(filePath); // remove local

      req.cloudinaryResult = result;
      next();
    } catch (uploadErr) {
      return res.status(500).json({ erro: "Erro no upload", detalhes: uploadErr.message });
    }
  });
};

export default uploadMiddleware;
