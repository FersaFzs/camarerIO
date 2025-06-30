import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Verificar credenciales de Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Faltan credenciales de Cloudinary en las variables de entorno');
}

console.log('Cloudinary Config:', {
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret ? '***' : undefined
});

// Configurar Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

// Configurar el almacenamiento
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'waiterapp/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Crear el middleware de multer
const upload = multer({ storage: storage });

export default upload; 