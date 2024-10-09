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

// Désactiver certaines fonctionnalités pour faciliter le débogage des requêtes CORS
app.disable('x-powered-by');

// Configuration de CORS
app.use(cors());

// Logger les requêtes reçues pour déboguer
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.url);
  console.log('Request headers:', req.headers);
  next();
});

// Middleware de sécurité Helmet (désactivé temporairement pour tester)
// app.use(helmet({
//   contentSecurityPolicy: false
// }));

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
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Ajouter des événements de connexion pour MongoDB
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

mongoose.set('debug', true);

// Démarrage du serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});