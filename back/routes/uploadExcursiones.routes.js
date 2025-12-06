import express from 'express';
import { uploadExcursionImage } from '../config/uploadExcursiones.js';
import { cloudinary } from '../config/cloudinary.js';

const router = express.Router();

router.post('/excursiones/imagen', uploadExcursionImage.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      ok: false,
      message: 'No se recibió ninguna imagen',
    });
  }

  const buffer = req.file.buffer;

  const stream = cloudinary.uploader.upload_stream(
    {
      folder: 'maavyt_excursiones',
      transformation: [
        { width: 1280, height: 720, crop: 'fill', quality: 'auto' },
      ],
    },
    (error, result) => {
      if (error) {
        console.error('Error subiendo a Cloudinary:', error);
        return res.status(500).json({
          ok: false,
          message: 'Error al subir la imagen',
          error: error.message,
        });
      }

      return res.status(201).json({
        ok: true,
        message: 'Imagen subida correctamente',
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
  );

  stream.end(buffer);
});

export default router;
