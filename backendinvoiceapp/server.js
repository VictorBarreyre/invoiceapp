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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigins.includes(req.headers.origin) ? req.headers.origin : "");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

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