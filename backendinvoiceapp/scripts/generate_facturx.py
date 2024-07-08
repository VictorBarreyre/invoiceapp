from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from lxml import etree
import os
import sys
import json
from pdfrw import PdfReader, PdfWriter, PageMerge

def generate_facturx_xml(invoice_data):
    try:
        nsmap = {
            'rsm': 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
            'xsi': 'http://www.w3.org/2001/XMLSchema-instance'
        }
        
        root = etree.Element('{urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100}CrossIndustryInvoice', nsmap=nsmap)

        # Ajouter les éléments XML requis
        exchanged_document = etree.SubElement(root, 'ExchangedDocument')
        etree.SubElement(exchanged_document, 'ID').text = invoice_data['number']
        etree.SubElement(exchanged_document, 'IssueDateTime').text = invoice_data['date']
        etree.SubElement(exchanged_document, 'TypeCode').text = '380'

        # Emetteur
        supply_chain_trade_transaction = etree.SubElement(root, 'SupplyChainTradeTransaction')
        applicable_header_trade_agreement = etree.SubElement(supply_chain_trade_transaction, 'ApplicableHeaderTradeAgreement')
        seller_trade_party = etree.SubElement(applicable_header_trade_agreement, 'SellerTradeParty')
        etree.SubElement(seller_trade_party, 'Name').text = invoice_data['issuer']['name']

        # Destinataire
        buyer_trade_party = etree.SubElement(applicable_header_trade_agreement, 'BuyerTradeParty')
        etree.SubElement(buyer_trade_party, 'Name').text = invoice_data['client']['name']

        # Items
        for item in invoice_data['items']:
            line_item = etree.SubElement(supply_chain_trade_transaction, 'IncludedSupplyChainTradeLineItem')
            specified_trade_product = etree.SubElement(line_item, 'SpecifiedTradeProduct')
            etree.SubElement(specified_trade_product, 'Name').text = item['description']

        xml_str = etree.tostring(root, pretty_print=True, xml_declaration=True, encoding='UTF-8')
        return xml_str
    except Exception as e:
        print(f"Erreur lors de la génération de XML: {e}")
        raise

def create_pdf_with_xml_attachment(pdf_path, xml_data, invoice_data):
    try:
        c = canvas.Canvas(pdf_path, pagesize=A4)
        width, height = A4

        c.drawString(100, height - 100, f"Facture: {invoice_data['number']}")
        c.drawString(100, height - 120, f"Date: {invoice_data['date']}")
        c.drawString(100, height - 140, f"Émetteur: {invoice_data['issuer']['name']}")
        c.drawString(100, height - 160, f"Destinataire: {invoice_data['client']['name']}")
        c.showPage()
        c.save()

        # Vérifiez si le fichier PDF a été créé correctement
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"Le fichier PDF n'a pas été créé : {pdf_path}")

        pdf = PdfReader(pdf_path)
        trailer = pdf.trailer
        if trailer is None:
            raise ValueError("Erreur lors de la lecture du fichier PDF. Le fichier peut être corrompu ou vide.")

        embedded_file = {
            'Type': '/EmbeddedFile',
            'Subtype': '/text#2Fxml',
            'Params': {'ModDate': 'D:20210101000000Z'},
            'EmbeddedFile': xml_data
        }
        trailer.Info.update({
            'Title': 'Facture',
            'Author': 'Votre Nom',
            'Subject': 'Facture pour services rendus',
            'Keywords': 'facture, Factur-X, PDF/A-3'
        })
        trailer.Root.Metadata = embedded_file
        PdfWriter(pdf_path, trailer=trailer).write()
    except Exception as e:
        print(f"Erreur lors de la création du PDF avec pièce jointe XML: {e}")
        raise

if __name__ == "__main__":
    try:
        invoice_data = json.loads(sys.argv[1])
        print(f"Invoice data received: {invoice_data}")  # Log the received invoice data
        xml_data = generate_facturx_xml(invoice_data)
        pdf_path = 'facture.pdf'
        create_pdf_with_xml_attachment(pdf_path, xml_data, invoice_data)
        print(f"PDF généré: {pdf_path}")
    except Exception as e:
        print(f"Erreur lors de la génération de la facture: {e}")
        sys.exit(1)
