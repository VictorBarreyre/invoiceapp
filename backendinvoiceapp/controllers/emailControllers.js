const path = require('path');
const { execFile } = require('child_process');
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
          items: items
      });

      await nouvelleFacture.save();

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

const venvPath = path.join(__dirname, '..', 'venv', 'bin', 'python3');
const scriptPath = path.join(__dirname, '..', 'scripts', 'generate_facturx.py');

const generateFacturXAndSendEmail = expressAsyncHandler(async (req, res) => {
  console.log('Body received:', req.body);
  console.log('Files received:', req.file);

  const {
      number, email, subject, montant, devise, reminderFrequency,
      emetteur, destinataire, items
  } = req.body;

  console.log('Parsed data - Number:', number);
  console.log('Parsed data - Email:', email);
  console.log('Parsed data - Subject:', subject);
  console.log('Parsed data - Montant:', montant);
  console.log('Parsed data - Devise:', devise);
  console.log('Parsed data - Emetteur:', emetteur);
  console.log('Parsed data - Destinataire:', destinataire);
  console.log('Parsed data - Items:', items);

  const emetteurObj = JSON.parse(emetteur);
  const destinataireObj = JSON.parse(destinataire);
  const itemsArray = JSON.parse(items);

  if (!number || !email || !subject || !montant || !devise || !emetteur || !destinataire || items.length === 0) {
      return res.status(400).send('All fields are required.');
  }

  if (!req.file || req.file.mimetype !== 'application/pdf' || req.file.size === 0) {
      return res.status(400).send('Invalid PDF file.');
  }

  const pdfPath = path.join(os.tmpdir(), `${uuidv4()}-facture.pdf`);
  console.log(`Writing PDF to: ${pdfPath}`);
  fs.writeFileSync(pdfPath, req.file.buffer);

  // Vérifiez la taille du fichier PDF après écriture
  if (fs.statSync(pdfPath).size === 0) {
      return res.status(400).send('Le fichier PDF est vide après écriture.');
  }

  const invoiceData = {
      number,
      date: new Date().toISOString().split('T')[0],
      issuer: emetteurObj,
      client: destinataireObj,
      items: itemsArray,
      total: montant,
      devise
  };

  const invoiceJson = JSON.stringify(invoiceData);

  console.log(`Executing Python script: ${scriptPath}`);
  execFile(venvPath, [scriptPath, invoiceJson], (error, stdout, stderr) => {
      if (error) {
          console.error('Erreur lors de l\'exécution du script Python:', error);
          console.error('stderr:', stderr);
          console.error('stdout:', stdout);
          return res.status(500).send('Erreur lors de l\'exécution du script Python: ' + stderr);
      }
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);

      const mailOptions = {
          from: process.env.SMTP_MAIL,
          to: email,
          subject: subject,
          text: 'Veuillez trouver ci-joint votre facture.',
          attachments: [{
              filename: 'facture.pdf',
              path: pdfPath
          }]
      };

      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error('Erreur lors de l\'envoi de l\'email:', error);
              return res.status(500).send('Erreur lors de l\'envoi de l\'email');
          }
          fs.unlinkSync(pdfPath);
          res.status(200).send({ message: 'Factur-X générée et email envoyé avec succès' });
      });
  });
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

module.exports = { generateFactureId, createFactureAndSendEmail, getFactureDetails, generateFacturXAndSendEmail };

