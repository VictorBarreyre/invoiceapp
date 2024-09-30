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
    // Utiliser req.body ici, car bodyParser.raw() est déjà utilisé pour cette route
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️  Erreur lors de la vérification du webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement "invoice.payment_succeeded"
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;

    // Récupérer les informations du client depuis l'invoice
    const customer = await stripe.customers.retrieve(invoice.customer);
    const email = customer.email;
    const name = customer.name || 'Cher utilisateur';


    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });

    if (!existingUser) {

      // Générer un mot de passe temporaire
      const tempPassword = uuidv4().slice(0, 8);

      // Créer un nouvel utilisateur
      const newUser = await User.create({
        email,
        password: tempPassword, // Le mot de passe sera haché par le middleware 'pre save'
        name
      });


      // Charger et remplir le modèle d'email
      const templatePath = path.join(__dirname, '../templates/signup.html');
      if (fs.existsSync(templatePath)) {
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = template.replace('{name}', name)
                           .replace('{password}', tempPassword);

        // Envoyer un e-mail de confirmation
        const mailOptions = {
          from: process.env.SMTP_MAIL,
          to: email,
          subject: 'Votre nouveau compte est prêt',
          html: template
        };

        await transporter.sendMail(mailOptions);
      } else {
        console.error(`❌ Le fichier de modèle d'email n'existe pas à: ${templatePath}`);
      }
    } else {
    }
  }

  // Répondre à Stripe pour accuser réception du webhook
  res.json({ received: true });
};

