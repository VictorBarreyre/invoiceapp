const express = require('express');
const dotenv = require('dotenv');
const emailRoutes = require('./routes/emailRoutes');
const userRoutes = require('./routes/userRoutes');
const aboRoutes = require('./routes/aboRoutes'); 
const webhookRoutes = require('./routes/webhookRoutes'); 
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

// Middleware de sécurité Helmet avec configuration Content Security Policy (CSP)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted-cdn.com"], // Autoriser les scripts de ce domaine
      objectSrc: ["'none'"], // Bloquer les objets comme <object> et <embed>
      imgSrc: ["'self'", "data:", "https:"], // Autoriser les images de soi-même, des data URIs, et HTTPS
      upgradeInsecureRequests: [], // Forcer les requêtes HTTP à passer en HTTPS
    }
  }
}));

// Redirection HTTP vers HTTPS
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Limiter à 50mb pour l'analyse des données JSON
app.use(express.json({ limit: '50mb' }));

const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173', 'https://www.dbill.io'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Autoriser ces méthodes HTTP
  allowedHeaders: ['Content-Type', 'Authorization'], // Autoriser ces en-têtes
  credentials: true, // Permettre l'envoi de cookies et autres en-têtes sensibles
}));

// Configurer les fichiers statiques
app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: false
}));

app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuration du body-parser pour les webhooks
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// Routes
app.use('/email', emailRoutes);
app.use('/api/users', userRoutes);
app.use('/abonnement', aboRoutes); 
app.use('/webhook', webhookRoutes); 

// Route par défaut
app.get('/', (req, res) => {
  res.send('Why are you here?');
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

mongoose.set('debug', true);

// Démarrage du serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});