// back/config/uploadExcursiones.js
import multer from 'multer';

const storage = multer.memoryStorage();

const uploadExcursionImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export { uploadExcursionImage };
