const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controllers/stripeWebhookController'); 

// Le middleware express.raw() est utilisé dans server.js pour Stripe webhook
router.post('/stripe', stripeWebhookController.handleWebhook);

module.exports = router;
