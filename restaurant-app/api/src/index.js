// IMPORTANT: Charger dotenv EN PREMIER avant d'importer les autres modules
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const { authRoutes } = require('./routes/auth');
const { restaurantRoutes } = require('./routes/restaurants');
const { menuRoutes } = require('./routes/menu');
const { orderRoutes } = require('./routes/orders');
const { reviewRoutes } = require('./routes/reviews');
const { userRoutes } = require('./routes/users');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();
const PORT = 3001;

// Security middleware
app.use(helmet());
// Pour le développement, permettre toutes les origines (Expo Go)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL || 'http://localhost:8081']
  : '*'; // Permettre toutes les origines en développement pour Expo Go
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      }
    : true, // Permettre toutes les origines en développement
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '..', 'public')));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Restaurant App API',
      version: '1.0.0',
      description: 'API for Restaurant Mobile Application',
    },
    servers: [
      {
        url: `http://localhost:3001`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Écouter sur toutes les interfaces pour permettre l'accès depuis le téléphone
// Créer le dossier de téléversement s'il n'existe pas
const uploadDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  // Note: Pour trouver votre IP locale, utilisez: hostname -I ou ip addr show
  console.log(`🌐 Accessible from phone at: http://<YOUR_LOCAL_IP>:${PORT}`);
});

module.exports = app;
