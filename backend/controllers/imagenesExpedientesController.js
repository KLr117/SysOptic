import multer from 'multer';
import path from 'path';
import ftp from 'basic-ftp';
import dotenv from 'dotenv';
dotenv.config();

// Configuración de multer para subir archivos
// Configuración de multer (guarda temporalmente en /tmp antes de subir al FTP)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = process.env.TEMP || '/tmp';
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `expediente_${req.body.expediente_id}_${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Configuración de multer con límites y filtros
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo por archivo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir tipos de imagen específicos
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true); // Aceptar archivo
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
    }
  }
});

// 🔧 Nueva función auxiliar para subir al FTP
export async function subirAFtp(localPath, remoteFileName, subcarpeta) {
  const client = new ftp.Client();
  client.ftp.verbose = false;
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      secure: true,
    });
    await client.ensureDir(`/public_html/public/uploads/${subcarpeta}`);
    await client.uploadFrom(localPath, `${remoteFileName}`);
    client.close();
    return true;
  } catch (err) {
    console.error("❌ Error al subir al FTP:", err);
    client.close();
    return false;
  }
}

export { ImagenesExpedientesController, upload };