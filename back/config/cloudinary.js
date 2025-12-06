// src/config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// console.log('CLOUD NAME:', process.env.CLOUDINARY_CLOUD_NAME);
// console.log('API KEY:', process.env.CLOUDINARY_API_KEY ? 'OK' : 'FALTA');
// console.log('API SECRET:', process.env.CLOUDINARY_API_SECRET ? 'OK' : 'FALTA');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

