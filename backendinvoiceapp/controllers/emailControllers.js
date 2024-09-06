const { PDFDocument, PDFName, PDFHexString } = require('pdf-lib');
const path = require('path');
const fs = require('fs');
const os = require('os');
const uuidv4 = require('uuid').v4;
const expressAsyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const multer = require('multer');
const Facture = require('../models/Facture');
const cron = require('node-cron');
const moment = require('moment');
const dotenv = require("dotenv");
const { exec } = require('child_process');
dotenv.config();

let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

cron.schedule('* * * * *', async () => {
  const now = new Date();

  try {
    const factures = await Facture.find({ nextReminderDate: { $lte: now }, status: 'en attente' });

    for (const facture of factures) {
      const templatePath = path.join(__dirname, '../templates/relance.html');
      let template = fs.readFileSync(templatePath, 'utf-8');
      template = template.replace('{clientName}', facture.destinataire.name)
                         .replace('{invoiceNumber}', facture.number)
                         .replace('{confirmationLink}', `http://localhost:5173/confirmation?facture=${facture.factureId}&montant=${facture.montant}`)
                         .replace('{issuerName}', facture.emetteur.name);

      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: facture.destinataire.email,
        subject: 'Rappel de paiement pour la facture n°' + facture.number,
        html: template
      };

      await transporter.sendMail(mailOptions);

      facture.nextReminderDate = moment(facture.nextReminderDate).add(facture.reminderFrequency, 'days').toDate();
      await facture.save();

      console.log('Rappel envoyé pour la facture n°', facture.number);
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi des rappels :', error);
  }
});

const upload = multer({ storage: multer.memoryStorage() });

const imagesDir = path.join(__dirname, '../public/images');

const saveBufferToFile = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    const tempPath = path.join(os.tmpdir(), `${uuidv4()}-${originalName}`);
    fs.writeFile(tempPath, buffer, (err) => {
      if (err) reject(err);
      else resolve(tempPath);
    });
  });
};

const generateFactureId = expressAsyncHandler(async (req, res) => {
  const factureId = uuidv4();
  res.send({ factureId: factureId });
});

const convertPdfToPng = (pdfPath) => {
  return new Promise((resolve, reject) => {
    const outputBase = path.basename(pdfPath, path.extname(pdfPath));
    const outputPath = path.join(imagesDir, outputBase + ".png");

    const command = `pdftoppm -png -f 1 -singlefile "${pdfPath}" "${outputPath.replace('.png', '')}"`;

    exec(command, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(outputPath);
      }
    });
  });
};

// Other route handlers...
const createFactureAndSendEmail = expressAsyncHandler(async (req, res) => {
  console.log("User in request:", req.userData);
  const { number, email, subject, montant, factureId, devise, reminderFrequency } = req.body;
  const emetteur = JSON.parse(req.body.emetteur);
  const destinataire = JSON.parse(req.body.destinataire);
  const items = JSON.parse(req.body.items) || [];

  console.log("Items reçus:", items);

  try {
    if (!req.file) {
      return res.status(400).send("Aucun fichier fourni.");
    }

    const filePath = await saveBufferToFile(req.file.buffer, req.file.originalname);
    const imagePath = await convertPdfToPng(filePath);
    const imageName = path.relative(imagesDir, imagePath);
    const urlImage = `http://localhost:8000/images/${imageName}`;

    const nouvelleFacture = new Facture({
      number,
      factureId,
      urlImage,
      montant,
      devise,
      status: 'en attente',
      emetteur,
      destinataire,
      userId: req.userData ? req.userData.id : null,
      nextReminderDate: new Date(Date.now() + reminderFrequency * 24 * 60 * 60 * 1000),
      reminderFrequency: Number(reminderFrequency),
      items: items,
      format: 'standard'
    });

    await nouvelleFacture.save();

    const templatePath = path.join(__dirname, '../templates/emailTemplates.html');
    let template = fs.readFileSync(templatePath, 'utf-8');

    const confirmationLink = `http://localhost:5173/confirmation?facture=${factureId}&montant=${montant}`;

    const replacements = {
      '{clientName}': destinataire.name,
      '{invoiceNumber}': number,
      '{confirmationLink}': confirmationLink,
      '{issuerName}': emetteur.name
    };

    template = template.replace(/{clientName}|{invoiceNumber}|{confirmationLink}|{issuerName}/g, matched => replacements[matched]);

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: subject,
      html: template,
      attachments: [
        {
          filename: req.file.originalname,
          path: filePath,
        }
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(nouvelleFacture);

    res.send({
      message: "Email envoyé avec succès à " + email,
      factureId: factureId,
      urlImage: urlImage,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la facture ou de l'envoi de l'email:", error);
    res.status(500).send("Erreur lors de la création de la facture ou de l'envoi de l'email: " + error.message);
  }
});

const getFactureDetails = expressAsyncHandler(async (req, res) => {
  const { factureId } = req.params;
  const facture = await Facture.findOne({ factureId: factureId });

  if (facture) {
    res.json({
      number: facture.number,
      factureId: facture.factureId,
      urlImage: facture.urlImage,
      montant: facture.montant,
      devise: facture.devise,
      emetteur: facture.emetteur,
      destinataire: facture.destinataire,
      status: facture.status,
      format: facture.format, // Ajout du format ici
    });
  } else {
    res.status(404).send("Facture non trouvée");
  }
});

module.exports = { generateFactureId, createFactureAndSendEmail, getFactureDetails};
