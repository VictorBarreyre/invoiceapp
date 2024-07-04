const express = require('express');
const expressAsyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const multer = require('multer');
const Facture = require('../models/Facture');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const cron = require('node-cron');
const moment = require('moment');
const FormData = require('form-data');
const axios = require('axios')


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
    // Trouver toutes les factures dont la date de prochaine relance est maintenant ou avant et qui sont toujours "en attente"
    const factures = await Facture.find({ nextReminderDate: { $lte: now }, status: 'en attente' });

    for (const facture of factures) {
      // Lire le template HTML pour l'email de relance
      const templatePath = path.join(__dirname, '../templates/relance.html');
      let template = fs.readFileSync(templatePath, 'utf-8');
      template = template.replace('{clientName}', facture.destinataire.name)
                         .replace('{invoiceNumber}', facture.number)
                         .replace('{confirmationLink}', `http://localhost:5173/confirmation?facture=${facture.factureId}&montant=${facture.montant}`)
                         .replace('{issuerName}', facture.emetteur.name);

      // Envoyer l'email de relance
      const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: facture.destinataire.email,
        subject: 'Rappel de paiement pour la facture n°' + facture.number,
        html: template
      };

      await transporter.sendMail(mailOptions);

      // Mettre à jour la date de prochaine relance
      facture.nextReminderDate = moment(facture.nextReminderDate).add(facture.reminderFrequency, 'days').toDate(); // Utiliser la fréquence de relance
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


    console.log("Chemin du PDF source:", pdfPath);
    console.log("Chemin de destination prévu pour le PNG:", outputPath);


    // Notez qu'aucun échappement supplémentaire pour les espaces n'est fait ici
    const command = `pdftoppm -png -f 1 -singlefile "${pdfPath}" "${outputPath.replace('.png', '')}"`;

    console.log("Commande exécutée:", command);

    exec(command, (err) => {
      if (err) {
        console.log("Erreur lors de l'exécution de la commande:", err);
        reject(err);
      } else {
        console.log("Conversion réussie, fichier PNG:", outputPath);
        resolve(outputPath);
      }
    });
  });
};


const createFactureAndSendEmail = expressAsyncHandler(async (req, res) => {
  console.log("User in request:", req.userData);
  const { number, email, subject, montant, factureId, devise, reminderFrequency } = req.body;
  const emetteur = JSON.parse(req.body.emetteur);
  const destinataire = JSON.parse(req.body.destinataire);
  const items = JSON.parse(req.body.items) || []; // Assurez-vous que items est un tableau

  console.log("Items reçus:", items); // Ajoutez ceci pour vérifier les items reçus

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
          items: items // Assurez-vous que 'items' est défini
      });

      await nouvelleFacture.save();

      // Génération du fichier XML
      const xmlData = `
        <facture>
          <number>${number}</number>
          <date>${new Date().toISOString()}</date>
          <emetteur>
            <name>${emetteur.name}</name>
            <adresse>${emetteur.adresse}</adresse>
            <siret>${emetteur.siret}</siret>
            <email>${emetteur.email}</email>
          </emetteur>
          <destinataire>
            <name>${destinataire.name}</name>
            <adresse>${destinataire.adresse}</adresse>
            <siret>${destinataire.siret}</siret>
            <email>${destinataire.email}</email>
          </destinataire>
          <items>
            ${(items || []).map(item => `
              <item>
                <description>${item.description}</description>
                <quantity>${item.quantity}</quantity>
                <unitPrice>${item.unitPrice}</unitPrice>
              </item>
            `).join('')}
          </items>
          <total>${montant}</total>
        </facture>
      `;
      
      const xmlFilePath = path.join(os.tmpdir(), `${uuidv4()}-facture.xml`);
      fs.writeFileSync(xmlFilePath, xmlData);

      const templatePath = path.join(__dirname, '../templates/emailTemplates.html');
      let template = fs.readFileSync(templatePath, 'utf-8');

      const confirmationLink = `http://localhost:5173/confirmation?facture=${factureId}&montant=${montant}`;
      template = template.replace('{clientName}', destinataire.name)
                         .replace('{invoiceNumber}', number)
                         .replace('{confirmationLink}', confirmationLink)
                         .replace('{issuerName}', emetteur.name);
      
      const mailOptions = {
          from: process.env.SMTP_MAIL,
          to: email,
          subject: subject,
          html: template,
          attachments: [
              {
                  filename: req.file.originalname,
                  path: filePath,
              },
              {
                  filename: 'facture.xml',
                  path: xmlFilePath,
              }
          ],
      };

      await transporter.sendMail(mailOptions);

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


const createFacturXAndSendEmail = expressAsyncHandler(async (req, res) => {
  const { number, email, subject, montant, factureId, devise, reminderFrequency } = req.body;
  const emetteur = JSON.parse(req.body.emetteur);
  const destinataire = JSON.parse(req.body.destinataire);
  const items = JSON.parse(req.body.items) || [];

  const invoiceData = {
    number,
    emetteur,
    destinataire,
    items,
    montant,
    devise,
    reminderFrequency
  };

  try {
    // Appel au microservice pour générer le fichier Factur-X
    const response = await axios.post('http://localhost:8080/generate-facturx', invoiceData, {
      responseType: 'arraybuffer'
    });

    const pdfBuffer = response.data;

    const nouvelleFacture = new Facture({
      number,
      factureId,
      montant,
      devise,
      status: 'en attente',
      emetteur,
      destinataire,
      userId: req.userData ? req.userData.id : null,
      nextReminderDate: new Date(Date.now() + reminderFrequency * 24 * 60 * 60 * 1000),
      reminderFrequency: Number(reminderFrequency),
      items: items
    });

    await nouvelleFacture.save();

    const templatePath = path.join(__dirname, '../templates/emailTemplates.html');
    let template = fs.readFileSync(templatePath, 'utf-8');

    const confirmationLink = `http://localhost:5173/confirmation?facture=${factureId}&montant=${montant}`;
    template = template.replace('{clientName}', destinataire.name)
                       .replace('{invoiceNumber}', number)
                       .replace('{confirmationLink}', confirmationLink)
                       .replace('{issuerName}', emetteur.name);

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: subject,
      html: template,
      attachments: [
        {
          filename: 'facture.pdf',
          content: pdfBuffer,
        }
      ],
    };

    await transporter.sendMail(mailOptions);

    res.send({
      message: "Email envoyé avec succès à " + email,
      factureId: factureId,
    });
  } catch (error) {
    console.error("Erreur lors de la génération de la facture ou de l'envoi de l'email:", error);
    res.status(500).send("Erreur lors de la génération de la facture ou de l'envoi de l'email: " + error.message);
  }
});







const getFactureDetails = expressAsyncHandler(async (req, res) => {
  const { factureId } = req.params;
  const facture = await Facture.findOne({ factureId: factureId });

  if (facture) {
    res.json({
      number:facture.number,
      factureId: facture.factureId,
      urlImage: facture.urlImage,
      montant: facture.montant,
      devise: facture.devise,
      emetteur: facture.emetteur,
      destinataire: facture.destinataire,
      status: facture.status,
    });
  } else {
    res.status(404).send("Facture non trouvée");
  }
});

module.exports = { generateFactureId, createFactureAndSendEmail, getFactureDetails, createFacturXAndSendEmail };
