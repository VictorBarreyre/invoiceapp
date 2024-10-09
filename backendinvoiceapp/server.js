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

// Configuration de CORS
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

// Répondre aux requêtes préflight OPTIONS
app.options('*', cors());

// Logger les requêtes reçues pour déboguer
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  console.log('Request headers:', req.headers);
  next();
});

// Middleware de sécurité Helmet (CSP désactivé temporairement pour tester)
app.use(helmet({
  contentSecurityPolicy: false
}));

// Redirection HTTP vers HTTPS (désactivée temporairement pour tester)
// app.use((req, res, next) => {
//   if (req.headers['x-forwarded-proto'] !== 'https') {
//     return res.redirect(`https://${req.headers.host}${req.url}`);
//   }
//   next();
// });

// Limiter à 50mb pour l'analyse des données JSON
app.use(express.json({ limit: '50mb' }));

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
  res.send('Why are you here? staging');
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