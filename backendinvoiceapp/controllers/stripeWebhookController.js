const User = require('../models/User');
const argon2 = require('argon2');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_TOKEN);
const path = require('path');
const fs = require('fs');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Assurez-vous de définir ce secret dans vos variables d'environnement

// Configurer le transporteur d'email
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // Vérification de la signature du webhook Stripe
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    console.log('✅ Webhook Stripe reçu avec succès:', event.type);
  } catch (err) {
    console.error('⚠️  Erreur lors de la vérification du webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement de création de souscription
  if (event.type === 'customer.subscription.created') {
    const subscription = event.data.object;

    try {
      // Récupérer les informations du client
      const customer = await stripe.customers.retrieve(subscription.customer);
      const email = customer.email;
      const name = customer.name || 'Cher utilisateur';

      console.log(`ℹ️  Récupération du client: ${email}`);

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email });

      if (!existingUser) {
        console.log(`ℹ️  Aucun utilisateur trouvé avec l'email: ${email}. Création d'un nouvel utilisateur.`);

        // Générer un mot de passe temporaire
        const tempPassword = uuidv4().slice(0, 8);
        const hashedPassword = await argon2.hash(tempPassword);

        // Créer un nouvel utilisateur
        const newUser = new User({
          email,
          name,
          password: hashedPassword,
        });
        await newUser.save();
        console.log(`✅ Nouvel utilisateur créé: ${email}`);

        // Lire et modifier le modèle d'email
        const templatePath = path.join(__dirname, '../templates/signup.html');
        if (fs.existsSync(templatePath)) {
          let template = fs.readFileSync(templatePath, 'utf-8');
          template = template.replace('{name}', name).replace('{password}', tempPassword);

          // Envoyer l'email avec les informations du compte et le mot de passe temporaire
          const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: email,
            subject: 'Votre nouveau compte est prêt',
            html: template,
          };
          await transporter.sendMail(mailOptions);
          console.log(`✅ Email envoyé avec succès à: ${email}`);
        } else {
          console.error(`❌ Le fichier de modèle d'email n'existe pas à: ${templatePath}`);
        }
      } else {
        console.log(`ℹ️  Utilisateur déjà existant avec l'email: ${email}. Aucune création nécessaire.`);
      }
    } catch (err) {
      console.error('❌ Erreur lors de la création de l\'utilisateur ou de l\'envoi de l\'email:', err);
    }
  }

  // Répondre à Stripe pour accuser réception du webhook
  res.json({ received: true });
};
