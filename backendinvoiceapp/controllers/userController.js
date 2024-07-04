const User = require('../models/User');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const expressAsyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const Invoice = require('../models/Facture');
const path = require('path'); 
const fs = require('fs');

// Créez un transporteur nodemailer
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true pour le port 465, false pour les autres ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

exports.signupUser = expressAsyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ message: 'Un utilisateur existe déjà avec cet email' });
    return;
  }

  // Créer un nouvel utilisateur directement sans hacher le mot de passe ici
  const user = await User.create({
    email,
    password, // Le mot de passe sera haché par le middleware 'pre save'
    name
  });

  if (user) {
    // Envoyer un e-mail de confirmation
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: 'Confirmation d\'inscription',
      text: `Bonjour ${name}, vous êtes maintenant inscrit sur notre plateforme. Votre mot de passe temporaire est : ${password}`,
    };

    await transporter.sendMail(mailOptions);

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      token
    });
  } else {
    res.status(400).send('Données utilisateur invalides');
  }
});

exports.signinUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("Attempting to find user with email:", email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found with email:", email);
      return res.status(401).json({ message: 'Utilisateur ou mot de passe incorrect' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Password does not match for user:", email);
      return res.status(401).json({ message: 'Utilisateur ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      adresse: user.adresse,
      siret: user.siret,
      iban: user.iban,
      token
    });
  } catch (error) {
    console.error('Error in signinUser:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

exports.sendResetEmail = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'Utilisateur non trouvé' });
  }
  const resetToken = jwt.sign({ _id: user._id }, process.env.JWT_RESET_SECRET, { expiresIn: '15m' });
  console.log('Generated reset token:', resetToken);
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 3 * 60 * 60 * 1000; // 3 hours
  await user.save();

  // Construisez un lien de réinitialisation qui pointe vers l'interface frontend
  const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject: 'Réinitialisation de votre mot de passe',
    text: `Bonjour, vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe: ${resetLink}`
  };
  await transporter.sendMail(mailOptions);
  res.json({ message: 'Un e-mail de réinitialisation a été envoyé.' });
});

// Fonction pour obtenir les informations d'un utilisateur par son ID
exports.getUser = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).send('Utilisateur non trouvé');
    return;
  }
  res.json({
    _id: user._id,
    email: user.email,
    name: user.name,
    adresse: user.adresse,
    siret: user.siret,
    iban: user.iban,
  });
});

exports.getUserInvoices = expressAsyncHandler(async (req, res) => {
  if (!req.userData) {
    console.log('Utilisateur non authentifié');
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }

  try {
    console.log('Recherche des factures pour:', req.userData.email);
    const invoices = await Invoice.find({ 'emetteur.email': req.userData.email });
    console.log('Factures trouvées:', invoices);
    res.json(invoices);
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    res.status(500).send("Erreur lors de la récupération des factures");
  }
});


exports.updateUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    Object.keys(updates).forEach(key => {
      if (!['password', 'token', '__v'].includes(key)) {
        user[key] = updates[key];
      }
    });

    console.log("Updating user with ID:", id);
    console.log("Updates to apply:", updates);

    await user.save();
    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      adresse: user.adresse,
      siret: user.siret,
      iban: user.iban,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur", error: error.message });
  }
});

// Fonction pour vérifier si un utilisateur existe
exports.checkUserExists = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const userExists = await User.findOne({ email });
    res.status(200).json({ exists: !!userExists });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

exports.resetPassword = expressAsyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    console.log('Received token:', token);
    console.log('Received new password:', newPassword);

    // Décodage du token pour obtenir l'ID de l'utilisateur
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    console.log('Decoded token:', decoded);

    // Recherche de l'utilisateur par ID
    const user = await User.findById(decoded._id);
    console.log('Found user:', user);

    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    // Ajout des logs pour le token et la date d'expiration
    console.log('User resetPasswordToken:', user.resetPasswordToken);
    console.log('User resetPasswordExpire:', user.resetPasswordExpire);
    console.log('Current time:', Date.now());

    if (user.resetPasswordToken !== token) {
      console.log('Tokens do not match');
      return res.status(400).json({ message: 'Le lien de réinitialisation est invalide' });
    }

    if (user.resetPasswordExpire < Date.now()) {
      console.log('Token has expired');
      return res.status(400).json({ message: 'Le lien de réinitialisation a expiré' });
    }

    // Mise à jour du mot de passe
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});


exports.deleteUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params; // ID de l'utilisateur à supprimer
  const { password } = req.body; // Mot de passe fourni pour confirmation

  try {
    const user = await User.findById(id);

    if (!user) {
      console.log(`User with ID ${id} not found`);
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Supprimer l'utilisateur
    await user.deleteOne();
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur", error: error.message });
  }
});


exports.verifyPassword = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    res.status(200).json({ success: true, message: 'Mot de passe vérifié' });
  } catch (error) {
    console.error('Error in verifyPassword:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

exports.changePassword = expressAsyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userData.id; // Assurez-vous que le middleware d'authentification ajoute userData à la requête

  console.log(`Received request to change password for user ID: ${userId}`);

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      console.log('Current password does not match');
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    console.log('Current password matched. Proceeding to change password.');
    user.password = newPassword;
    await user.save();

    console.log('Password changed successfully');
    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

exports.downloadUserData = expressAsyncHandler(async (req, res) => {
  const userId = req.userData.id;

  try {
    console.log(`Starting downloadUserData for user ID: ${userId}`);

    // Récupérer les informations utilisateur
    const user = await User.findById(userId).select('-password -token -__v');
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    console.log('User found:', user);

    // Récupérer les factures associées
    const invoices = await Invoice.find({ 'emetteur.email': user.email });

    console.log('Invoices found:', invoices);

    // Créer un objet avec les données utilisateur et les factures
    const userData = {
      user: user.toObject(),
      invoices: invoices.map(invoice => invoice.toObject())
    };

    // Convertir l'objet en chaîne JSON
    const jsonString = JSON.stringify(userData, null, 2);

    // Définir le nom du fichier
    const fileName = `user-data-${user._id}.json`;

    // Vérifier et créer le dossier temporaire si nécessaire
    const tmpDir = path.join(__dirname, '..', 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
      console.log('Temporary directory created');
    }

    // Créer un fichier temporaire pour stocker les données
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, jsonString);

    console.log(`File created at ${filePath}`);

    // Envoyer le fichier en tant que téléchargement
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Erreur lors de l\'envoi du fichier' });
      } else {
        // Supprimer le fichier temporaire après l'envoi
        fs.unlinkSync(filePath);
        console.log(`File ${filePath} deleted after sending`);
      }
    });
  } catch (error) {
    console.error('Erreur lors du téléchargement des données utilisateur:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

// Ajoutez cette fonction à la fin du fichier userController.js
exports.deleteInvoice = expressAsyncHandler(async (req, res) => {
  const { invoiceId } = req.body;

  try {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    await invoice.deleteOne();
    res.status(200).json({ message: 'Facture supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});


// Ajoutez cette fonction à la fin du fichier userController.js
exports.markInvoiceAsPaid = expressAsyncHandler(async (req, res) => {
  const { invoiceId } = req.body;

  try {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    invoice.status = 'paid';
    await invoice.save();

    res.status(200).json({ message: 'Facture marquée comme payée', invoice });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});


// Ajoutez cette fonction à la fin du fichier userController.js
exports.markInvoiceAsUnpaid = expressAsyncHandler(async (req, res) => {
  const { invoiceId } = req.body;

  try {
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }

    invoice.status = 'en attente';
    await invoice.save();

    res.status(200).json({ message: 'Facture marquée comme non traitée', invoice });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});
