const express = require('express');
const authenticate = require('../middleware/authenticate'); // Middleware d'authentification
const checkInvoiceLimitForNonSubscribers = require('../middleware/checkInvoiceLimitForNonSubscribers'); // Middleware pour vérifier la limite des factures
const { createFactureAndSendEmail } = require('../controllers/invoiceController'); // Contrôleur pour créer la facture

const router = express.Router();

// Route pour créer une facture
router.post('/create', authenticate, checkInvoiceLimitForNonSubscribers, createFactureAndSendEmail);

module.exports = router;
