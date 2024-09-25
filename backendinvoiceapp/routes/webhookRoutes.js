// webhookRoutes.js
const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../controllers/stripeWebhookController'); 

router.post('/stripe', stripeWebhookController.handleWebhook);

module.exports = router;
