import multer, { memoryStorage } from "multer";
import path from "path";
const UPLOADS_FOLDER = "uploads/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_FOLDER);
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName =
      file.originalname
        .replace(fileExt, "")
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now();

    cb(null, fileName + fileExt);
  },
});

export const upload = multer({
  storage: memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 5 },
});
