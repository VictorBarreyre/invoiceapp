const express = require('express');
const dotenv = require('dotenv');
const emailRoutes = require('./routes/emailRoutes');
const userRoutes = require('./routes/userRoutes');
const aboRoutes = require('./routes/aboRoutes'); 
const webhookRoutes = require('./routes/webhookRoutes'); 
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); 
const path = require('path');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

app.use('/webhook', bodyParser.raw({ type: 'application/json' }));

// Limiter à 50mb pour l'analyse des données JSON
app.use(express.json({ limit: '50mb' }));

app.use(cors({
  origin: 'http://localhost:5173' // Autoriser uniquement les requêtes de ce domaine
}));

app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: false
}));

app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Routes
app.use('/email', emailRoutes);
app.use('/api/users', userRoutes);
app.use('/abonnement', aboRoutes); 
app.use('/webhook', webhookRoutes); 

app.get('/', (req, res) => {
  res.send('The Backend of my Invoice App');
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

mongoose.set('debug', true);

// Démarrage du serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
});
