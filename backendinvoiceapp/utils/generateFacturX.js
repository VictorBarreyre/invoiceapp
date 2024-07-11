const { PDFDocument, StandardFonts } = require('pdf-lib');
const { create } = require('xmlbuilder');
const fs = require('fs');

async function generateFacturX(invoiceData, pdfPath) {
  const xml = create('CrossIndustryInvoice', {
      version: '1.0',
      encoding: 'UTF-8',
      standalone: true
  })
      .ele('ExchangedDocument', { xmlns: 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100' })
      .ele('ID', invoiceData.number).up()
      .ele('IssueDateTime', invoiceData.date).up()
      .ele('TypeCode', '380').up()
      .up()
      .ele('SupplyChainTradeTransaction')
      .ele('ApplicableHeaderTradeAgreement')
      .ele('SellerTradeParty')
      .ele('Name', invoiceData.issuer.name).up()
      .up()
      .ele('BuyerTradeParty')
      .ele('Name', invoiceData.client.name).up()
      .up()
      .up()
      .ele('IncludedSupplyChainTradeLineItem')
      .ele('SpecifiedTradeProduct')
      .ele('Name', invoiceData.items[0].description).up()
      .up()
      .up()
      .end({ pretty: true });

  const xmlBuffer = Buffer.from(xml, 'utf-8');

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('Facture');
  pdfDoc.setAuthor('Votre Nom');
  pdfDoc.setSubject('Facture pour services rendus');
  pdfDoc.setKeywords(['facture', 'Factur-X', 'PDF/A-3']);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText(`Facture: ${invoiceData.number}`, { x: 50, y: height - 50, size: fontSize, font });
  page.drawText(`Date: ${invoiceData.date}`, { x: 50, y: height - 70, size: fontSize, font });
  page.drawText(`Émetteur: ${invoiceData.issuer.name}`, { x: 50, y: height - 90, size: fontSize, font });
  page.drawText(`Adresse: ${invoiceData.issuer.adresse}`, { x: 50, y: height - 110, size: fontSize, font });
  page.drawText(`Destinataire: ${invoiceData.client.name}`, { x: 50, y: height - 130, size: fontSize, font });
  page.drawText(`Adresse: ${invoiceData.client.adresse}`, { x: 50, y: height - 150, size: fontSize, font });

  let yPosition = height - 170;
  for (const item of invoiceData.items) {
      page.drawText(`Description: ${item.description}, Quantité: ${item.quantity}, Prix Unitaire: ${item.unitPrice}`, { x: 50, y: yPosition, size: fontSize, font });
      yPosition -= 20;
  }
  page.drawText(`Total: ${invoiceData.total} ${invoiceData.devise}`, { x: 50, y: yPosition - 20, size: fontSize, font });

  const embeddedFileStream = await pdfDoc.attach(xmlBuffer, 'factur-x.xml', {
      mimeType: 'application/xml',
      description: 'Factur-X XML File'
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfPath, pdfBytes);
}

module.exports = generateFacturX;
