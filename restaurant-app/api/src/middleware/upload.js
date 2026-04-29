const multer = require('multer');
const path = require('path');

// Configurer le stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Les fichiers seront sauvegardés dans le dossier 'public/images'
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique pour éviter les conflits
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtrer les fichiers pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées !'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // Limite de 5MB par fichier
});

module.exports = upload;
