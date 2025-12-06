// src/routes/cloudinary.routes.js
import express from 'express';
import { cloudinary } from '../config/cloudinary.js';

const router = express.Router();

// GET /api/cloudinary-test
router.get('/cloudinary-test', async (req, res) => {
  try {
    // Imagen pública cualquiera solo para test
    const imageUrl = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'maavyt_tests', // carpeta de prueba
    });

    return res.json({
      ok: true,
      message: 'Cloudinary funciona correctamente ✅',
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('Error probando Cloudinary:', error);
    return res.status(500).json({
      ok: false,
      message: 'Cloudinary NO está funcionando 😢',
      error: error.message,
    });
  }
});

export default router;
