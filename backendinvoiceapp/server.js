// server.js

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

dotenv.config();

const app = express();

// Limiter à 50mb pour l'analyse des données JSON (hors webhooks)
app.use(express.json({ limit: '50mb' }));

app.use(cors({
  origin: 'http://localhost:5173' // Autoriser uniquement les requêtes de ce domaine
}));

app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // Cache assets for 1 day
  etag: false
}));

app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/email', emailRoutes);
app.use('/api/users', userRoutes);
app.use('/abonnement', aboRoutes); 
app.use('/webhook', webhookRoutes); // Les webhooks gèrent leur propre analyse de données (raw)

app.get('/', (req, res) => {
  res.send('The Backend of my Invoice App');
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch(err => console.error('Failed to connect to MongoDB', err));

mongoose.set('debug', true);

// Fonction pour récupérer les utilisateurs
async function fetchUsers() {
  try {
    const users = await User.find({});
    console.log("All users:", users);
  } catch (err) {
    console.error("Error fetching users:", err);
  }
}

// Démarrage du serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
