const Invoice = require('../models/Facture');
const stripe = require('stripe')(process.env.STRIPE_SECRET_TOKEN);

const checkInvoiceLimitForNonSubscribers = async (req, res, next) => {
  try {
    // Vérifier si l'utilisateur est connecté et abonné
    const userId = req.userData ? req.userData.id : null;
    let isSubscriber = false;

    if (userId) {
      // Vérifier l'abonnement avec Stripe
      const existingCustomers = await stripe.customers.list({ email: req.userData.email });
      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0];
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1,
        });
        isSubscriber = subscriptions.data.length > 0;
      }
    }

    if (!userId && !req.cookies.identifier) {
      // Si l'utilisateur n'est pas connecté et n'a pas d'identifiant unique, générer un UUID
      const uuid = require('uuid').v4();
      res.cookie('identifier', uuid, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 jours
      req.cookies.identifier = uuid;
    }

    // Si l'utilisateur est abonné, il n'y a pas de limitation
    if (isSubscriber) {
      return next();
    }

    // Compter le nombre de factures pour les utilisateurs non abonnés
    const identifier = req.cookies.identifier || userId;
    const invoiceCount = await Invoice.countDocuments({ identifier });

    if (invoiceCount >= 3) {
      return res.status(403).json({ message: 'Vous avez atteint la limite de 3 factures pour les utilisateurs non abonnés.' });
    }

    // Continuer la création de la facture
    next();
  } catch (error) {
    console.error('Erreur lors de la vérification de la limite de factures:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};

module.exports = checkInvoiceLimitForNonSubscribers;
