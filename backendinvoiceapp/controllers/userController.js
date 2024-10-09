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
    // Charger et remplir le template HTML
    const templatePath = path.join(__dirname, '../templates/signup.html');
    let template = fs.readFileSync(templatePath, 'utf-8');
    
    template = template.replace('{name}', name)
                       .replace('{password}', password);

    // Envoyer un e-mail de confirmation
    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: 'Confirmation d\'inscription',
      html: template
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
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur ou mot de passe incorrect' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
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

  if (!process.env.JWT_RESET_SECRET) {
    console.error('JWT_RESET_SECRET is not defined');
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }


    const resetToken = jwt.sign({ _id: user._id }, process.env.JWT_RESET_SECRET, { expiresIn: '15m' });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3 * 60 * 60 * 1000; // 3 hours
    await user.save();

    const resetLink = `https://dbill.io/reset-password?token=${resetToken}`;

    // Lire et remplir le template HTML
    const templatePath = path.join(__dirname, '../templates/reset_password.html');
    let template = fs.readFileSync(templatePath, 'utf-8');
    template = template.replace('{resetLink}', resetLink);


    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: template
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Un e-mail de réinitialisation a été envoyé.' });
  } catch (error) {
    console.error('Error in sendResetEmail:', error); // Ajout d'un log pour afficher les erreurs
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
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
    return res.status(401).json({ message: 'Utilisateur non authentifié' });
  }

  try {
    const invoices = await Invoice.find({ 'emetteur.email': req.userData.email });
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

    // Décodage du token pour obtenir l'ID de l'utilisateur
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);

    // Recherche de l'utilisateur par ID
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }

    // Ajout des logs pour le token et la date d'expiration

    if (user.resetPasswordToken !== token) {
      return res.status(400).json({ message: 'Le lien de réinitialisation est invalide' });
    }

    if (user.resetPasswordExpire < Date.now()) {
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
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
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


  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
});

exports.downloadUserData = expressAsyncHandler(async (req, res) => {
  const userId = req.userData.id;

  try {

    // Récupérer les informations utilisateur
    const user = await User.findById(userId).select('-password -token -__v');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }


    // Récupérer les factures associées
    const invoices = await Invoice.find({ 'emetteur.email': user.email });


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
    }

    // Créer un fichier temporaire pour stocker les données
    const filePath = path.join(tmpDir, fileName);
    fs.writeFileSync(filePath, jsonString);


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
