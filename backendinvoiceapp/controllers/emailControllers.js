const { PDFDocument, StandardFonts, rgb, PDFName, PDFString, PDFArray, PDFDict } = require('pdf-lib');
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

    console.log("Chemin du PDF source:", pdfPath);
    console.log("Chemin de destination prévu pour le PNG:", outputPath);

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

async function generateFacturX(invoiceData, pdfBuffer) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    pdfDoc.setTitle('Facture');
    pdfDoc.setAuthor('Votre Nom');
    pdfDoc.setSubject('Facture pour services rendus');
    pdfDoc.setKeywords(['facture', 'Factur-X', 'PDF/A-3']);
    console.log('PDF Document loaded and metadata set.');

    const pdfBytes = await pdfDoc.save();
    console.log('PDF Document saved.');
    return pdfBytes;
  } catch (error) {
    console.error('Erreur lors de la génération de Factur-X:', error);
    throw error;
  }
}

const generateFacturXAndSendEmail = expressAsyncHandler(async (req, res) => {
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

        const pdfBuffer = req.file.buffer;

        const invoiceData = {
            number,
            date: new Date().toISOString().split('T')[0],
            issuer: emetteur,
            client: destinataire,
            items: items,
            total: montant,
            devise: devise
        };

        const pdfBytes = await generateFacturX(invoiceData, pdfBuffer);
        const pdfPath = path.join(os.tmpdir(), `${uuidv4()}-facture.pdf`);
        fs.writeFileSync(pdfPath, pdfBytes);
        console.log('PDF Document written to disk:', pdfPath);

        const imagePath = await convertPdfToPng(pdfPath);
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
            format: 'factur-x'
        });

        await nouvelleFacture.save();
        console.log('Facture saved to database.');

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
            attachments: [{
                filename: 'facture.pdf',
                path: pdfPath,
            }]
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully.');

        fs.unlinkSync(pdfPath);

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

module.exports = { generateFactureId, createFactureAndSendEmail, getFactureDetails, generateFacturXAndSendEmail };
