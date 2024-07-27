const { PDFDocument, StandardFonts, rgb, PDFName, PDFString, PDFArray, PDFDict, PDFHexString } = require('pdf-lib');
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

async function generateFacturX(invoiceData, pdfBuffer) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Set metadata
    pdfDoc.setTitle('Facture');
    pdfDoc.setAuthor('Votre Nom');
    pdfDoc.setSubject('Facture pour services rendus');
    pdfDoc.setKeywords(['facture', 'Factur-X', 'PDF/A-3']);
    console.log('PDF Document loaded and metadata set.');

    // Create the Factur-X XML
    const xmlContent = generateFacturXXML(invoiceData);
    const xmlBytes = new TextEncoder().encode(xmlContent);

    // Create an embedded file stream
    const embeddedFileStream = pdfDoc.context.flateStream(xmlBytes);
    const embeddedFile = pdfDoc.context.obj({
      Type: 'EmbeddedFile',
      Subtype: 'application/xml',
      Params: {
        ModDate: new Date(),
        Size: xmlBytes.length,
      },
    });
    pdfDoc.context.register(embeddedFileStream, embeddedFile);

    // Create the embedded files name tree
    const embeddedFilesNameTree = pdfDoc.context.obj({
      Names: [
        PDFHexString.fromText('factur-x.xml'), embeddedFileStream,
      ],
    });

    // Add the embedded files name tree to the document's name dictionary
    const nameDict = pdfDoc.context.obj({
      EmbeddedFiles: embeddedFilesNameTree,
    });
    pdfDoc.catalog.set(PDFName.of('Names'), nameDict);

    // Mark the document as PDF/A-3
    pdfDoc.catalog.set(PDFName.of('MarkInfo'), pdfDoc.context.obj({
      Marked: true,
    }));
    pdfDoc.catalog.set(PDFName.of('GTS_PDFXVersion'), PDFHexString.fromText('PDF/A-3'));
    pdfDoc.catalog.set(PDFName.of('GTS_PDFXConformance'), PDFHexString.fromText('B'));

    const pdfBytes = await pdfDoc.save();
    console.log('PDF Document saved.');
    return pdfBytes;
  } catch (error) {
    console.error('Erreur lors de la génération de Factur-X:', error);
    throw error;
  }
}


function generateFacturXXML(invoiceData) {
  const { number, date, issuer, client, items, total, vatRate, devise } = invoiceData;

   // Validation et conversion des données
   const totalAmount = parseFloat(total);
   const vatAmount = totalAmount * (vatRate / 100);
   const grandTotalAmount = totalAmount + vatAmount;
 
   if (isNaN(totalAmount)) {
     throw new Error('Le total doit être un nombre');
   }
 

  return `
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100">
    <rsm:ExchangedDocument>
      <ram:ID>${number}</ram:ID>
      <ram:TypeCode>380</ram:TypeCode>
      <ram:IssueDateTime>
        <udt:DateTimeString format="102">${date.replace(/-/g, '')}</udt:DateTimeString>
      </ram:IssueDateTime>
      <ram:IncludedNote>
        <ram:Content>${issuer.name} - ${issuer.adresse}</ram:Content>
      </ram:IncludedNote>
    </rsm:ExchangedDocument>
    <rsm:SupplyChainTradeTransaction>
      <ram:ApplicableSupplyChainTradeAgreement>
        <ram:BuyerReference>${client.name}</ram:BuyerReference>
      </ram:ApplicableSupplyChainTradeAgreement>
      <ram:ApplicableSupplyChainTradeDelivery>
        <ram:ActualDeliveryDate>
          <udt:DateTimeString format="102">${date.replace(/-/g, '')}</udt:DateTimeString>
        </ram:ActualDeliveryDate>
      </ram:ApplicableSupplyChainTradeDelivery>
      <ram:ApplicableSupplyChainTradeSettlement>
        <ram:SpecifiedTradeSettlementMonetarySummation>
          <ram:LineTotalAmount currencyID="${devise}">${totalAmount.toFixed(2)}</ram:LineTotalAmount>
          <ram:TaxTotalAmount currencyID="${devise}">${vatAmount.toFixed(2)}</ram:TaxTotalAmount>
          <ram:GrandTotalAmount currencyID="${devise}">${grandTotalAmount.toFixed(2)}</ram:GrandTotalAmount>
        </ram:SpecifiedTradeSettlementMonetarySummation>
      </ram:ApplicableSupplyChainTradeSettlement>
      <ram:IncludedSupplyChainTradeLineItem>
        ${items.map((item, index) => {
          const itemTotal = parseFloat(item.unitPrice) * parseInt(item.quantity, 10);
          return `
          <ram:AssociatedDocumentLineDocument>
            <ram:LineID>${index + 1}</ram:LineID>
          </ram:AssociatedDocumentLineDocument>
          <ram:SpecifiedTradeProduct>
            <ram:Name>${item.description}</ram:Name>
          </ram:SpecifiedTradeProduct>
          <ram:SpecifiedLineTradeAgreement>
            <ram:NetPriceProductTradePrice>
              <ram:ChargeAmount currencyID="${devise}">${parseFloat(item.unitPrice).toFixed(2)}</ram:ChargeAmount>
            </ram:NetPriceProductTradePrice>
          </ram:SpecifiedLineTradeAgreement>
          <ram:SpecifiedLineTradeDelivery>
            <ram:BilledQuantity unitCode="C62">${parseInt(item.quantity, 10)}</ram:BilledQuantity>
          </ram:SpecifiedLineTradeDelivery>
          <ram:SpecifiedLineTradeSettlement>
            <ram:SpecifiedTradeSettlementLineMonetarySummation>
              <ram:LineTotalAmount currencyID="${devise}">${itemTotal.toFixed(2)}</ram:LineTotalAmount>
            </ram:SpecifiedTradeSettlementLineMonetarySummation>
          </ram:SpecifiedLineTradeSettlement>
          `;
        }).join('')}
      </ram:IncludedSupplyChainTradeLineItem>
    </rsm:SupplyChainTradeTransaction>
  </rsm:CrossIndustryInvoice>
  `;
}

const downloadFacturX = expressAsyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("Aucun fichier fourni.");
    }

    const invoiceData = JSON.parse(req.body.invoiceData);
    const pdfBuffer = req.file.buffer;

    // Vérifiez que les données sont correctes
    if (!invoiceData.total || isNaN(parseFloat(invoiceData.total))) {
      throw new Error('Le total doit être un nombre valide');
    }

    // Generate the Factur-X PDF
    const pdfBytes = await generateFacturX(invoiceData, pdfBuffer);
    const pdfPath = path.join(os.tmpdir(), `${uuidv4()}-facturx-invoice.pdf`);
    fs.writeFileSync(pdfPath, pdfBytes);

    // Send the Factur-X PDF file as a download response
    res.download(pdfPath, `FactureX-${invoiceData.number}.pdf`, (err) => {
      if (err) {
        console.error('Error while sending the file:', err);
      }
      fs.unlinkSync(pdfPath);
    });
  } catch (error) {
    console.error('Error generating or sending PDF:', error);
    res.status(500).send('Error generating or sending PDF');
  }
});


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

module.exports = { generateFactureId, downloadFacturX, createFactureAndSendEmail, getFactureDetails, generateFacturXAndSendEmail };
