const Stripe = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_TOKEN);

exports.getProductsAndPrices = async (req, res) => {
    try {
        const products = await stripe.products.list({ active: true });
        const prices = await stripe.prices.list({ active: true });
        const productsWithPrices = products.data.map(product => {
            const productPrices = prices.data.filter(price => price.product === product.id);
            return { ...product, prices: productPrices };
        });
        res.send(productsWithPrices);
    } catch (error) {
        res.status(400).send({ error: { message: error.message } });
    }
};

exports.createCheckoutSession = async (req, res) => {
  const { email, name, priceId, address, country, postalCode } = req.body;


  if (!email || !name || !priceId ) {
    return res.status(400).send({ error: { message: 'Email, Name, Address, Country, Postal Code, and Price ID are required.' } });
  }

  try {
    // Check for existing customer
    const existingCustomers = await stripe.customers.list({ email });
    let customer;

    // Customer data with address
    const customerData = {
      email,
      name,
      address: {
        line1: address, // This is the address line (e.g., street name and number)
        country: country, // This must be the country code (e.g., 'FR' for France)
        postal_code: postalCode, // Postal code of the customer
      },
    };

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];

      // **Update existing customer information** if name or address changes
      customer = await stripe.customers.update(customer.id, customerData);
    } else {
      // Create a new customer if none exists
      customer = await stripe.customers.create(customerData);
    }

    // Check for active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length > 0) {
      return res.status(400).send({ error: { message: 'You already have an active subscription.' } });
    }

    // Create a new subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });


    const paymentIntent = subscription.latest_invoice.payment_intent;

    if (paymentIntent) {
      res.send({
        sessionId: null,  // Not used in this flow
        clientSecret: paymentIntent.client_secret,
      });
    } else {
      throw new Error('Failed to retrieve payment intent');
    }
  } catch (error) {
    console.error('Error creating subscription:', error.message);
    res.status(500).send({ error: { message: 'Failed to create payment session', details: error.message } });
  }
};


exports.checkActiveSubscription = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    console.error('Email is required.');
    return res.status(400).send({ error: { message: 'Email is required.' } });
  }

  try {
    const existingCustomers = await stripe.customers.list({ email });
    let customer;

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];

      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1
      });
      

      if (subscriptions.data.length > 0) {
        const activeSubscription = subscriptions.data[0];
        return res.send({ hasActiveSubscription: true, subscription: activeSubscription });
      } else {
        return res.send({ hasActiveSubscription: false });
      }
      
    } else {
    }

    res.send({ hasActiveSubscription: false });
  } catch (error) {
    console.error('Error checking subscription:', error.message);
    res.status(400).send({ error: { message: error.message } });
  }
};

exports.cancelSubscription = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    console.error('Email is required.');
    return res.status(400).send({ error: { message: 'Email is required.' } });
  }

  try {
    const existingCustomers = await stripe.customers.list({ email });
    let customer;

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];

      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1
      });

      if (subscriptions.data.length > 0) {
        const activeSubscription = subscriptions.data[0];

        // Calculer la date de fin du mois prochain
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        const cancelAt = Math.floor(nextMonth.getTime() / 1000); // Convertir en timestamp Unix

        // Utiliser stripe.subscriptions.update pour annuler la souscription à une date future
        const canceledSubscription = await stripe.subscriptions.update(activeSubscription.id, {
          cancel_at: cancelAt,
        });
        return res.send({ success: true, subscription: canceledSubscription });
      } else {
        return res.status(400).send({ error: { message: 'No active subscription found.' } });
      }
    } else {
      return res.status(400).send({ error: { message: 'Customer not found.' } });
    }
  } catch (error) {
    console.error('Error canceling subscription:', error.message, error.stack);
    res.status(500).send({ error: { message: 'Failed to cancel subscription', details: error.message } });
  }
};
