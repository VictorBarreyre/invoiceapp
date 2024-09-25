const User = require('../models/User');
const argon2 = require('argon2');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_TOKEN);
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

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️  Erreur lors de la vérification du webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;

    // Récupérer l'email du client
    const customer = await stripe.customers.retrieve(invoice.customer);
    const email = customer.email;
    const name = customer.name;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      // Générer un mot de passe temporaire
      const tempPassword = uuidv4().slice(0, 8);
      const hashedPassword = await argon2.hash(tempPassword);

      // Créer un nouvel utilisateur
      const user = new User({
        email,
        name,
        password: hashedPassword,
      });
      await user.save();

      // Envoyer un email avec les informations du compte et le mot de passe temporaire
      const templatePath = path.join(__dirname, '../templates/signup.html');
      let template = fs.readFileSync(templatePath, 'utf-8');
      template = template.replace('{name}', name).replace('{password}', tempPassword);

      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject: 'Votre nouveau compte est prêt',
        html: template,
      };
      await transporter.sendMail(mailOptions);

      console.log(`Nouvel utilisateur créé avec l'email: ${email}`);
    }
  }

  // Répondre à Stripe pour accuser réception
  res.json({ received: true });
};
