import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.resolve(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: uploadsPath,
  filename: (req, file, callback) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return callback(new Error("Apenas arquivos JPG, PNG ou WEBP são permitidos."));
    }
    callback(null, true);
  }
});
