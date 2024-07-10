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
        etree.SubElement(exchanged_document, 'ID').text = invoice_data.get('number', 'N/A')
        etree.SubElement(exchanged_document, 'IssueDateTime').text = invoice_data.get('date', 'N/A')
        etree.SubElement(exchanged_document, 'TypeCode').text = '380'

        # Emetteur
        supply_chain_trade_transaction = etree.SubElement(root, 'SupplyChainTradeTransaction')
        applicable_header_trade_agreement = etree.SubElement(supply_chain_trade_transaction, 'ApplicableHeaderTradeAgreement')
        seller_trade_party = etree.SubElement(applicable_header_trade_agreement, 'SellerTradeParty')
        etree.SubElement(seller_trade_party, 'Name').text = invoice_data.get('issuer', {}).get('name', 'N/A')

        # Destinataire
        buyer_trade_party = etree.SubElement(applicable_header_trade_agreement, 'BuyerTradeParty')
        etree.SubElement(buyer_trade_party, 'Name').text = invoice_data.get('client', {}).get('name', 'N/A')

        # Items
        for item in invoice_data.get('items', []):
            line_item = etree.SubElement(supply_chain_trade_transaction, 'IncludedSupplyChainTradeLineItem')
            specified_trade_product = etree.SubElement(line_item, 'SpecifiedTradeProduct')
            etree.SubElement(specified_trade_product, 'Name').text = item.get('description', 'N/A')

        xml_str = etree.tostring(root, pretty_print=True, xml_declaration=True, encoding='UTF-8')
        return xml_str
    except Exception as e:
        print(f"Erreur lors de la génération de XML: {e}")
        raise

def create_pdf_with_xml_attachment(pdf_path, xml_data, invoice_data):
    try:
        print(f"Creating PDF at: {pdf_path}")
        c = canvas.Canvas(pdf_path, pagesize=A4)
        width, height = A4

        # Ajouter toutes les informations nécessaires dans le PDF
        c.drawString(100, height - 100, f"Facture: {invoice_data.get('number', 'N/A')}")
        c.drawString(100, height - 120, f"Date: {invoice_data.get('date', 'N/A')}")
        c.drawString(100, height - 140, f"Émetteur: {invoice_data.get('issuer', {}).get('name', 'N/A')}")
        c.drawString(100, height - 160, f"Adresse: {invoice_data.get('issuer', {}).get('adresse', 'N/A')}")
        c.drawString(100, height - 180, f"Destinataire: {invoice_data.get('client', {}).get('name', 'N/A')}")
        c.drawString(100, height - 200, f"Adresse: {invoice_data.get('client', {}).get('adresse', 'N/A')}")

        # Ajouter les items
        y_position = height - 220
        for item in invoice_data.get('items', []):
            c.drawString(100, y_position, f"Description: {item.get('description', 'N/A')}, Quantité: {item.get('quantity', 'N/A')}, Prix Unitaire: {item.get('unitPrice', 'N/A')}")
            y_position -= 20

        c.drawString(100, y_position - 20, f"Total: {invoice_data.get('total', 'N/A')} {invoice_data.get('devise', 'N/A')}")

        c.showPage()
        c.save()

        # Vérifiez si le fichier PDF a été créé correctement
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"Le fichier PDF n'a pas été créé : {pdf_path}")

        print(f"Reading PDF from: {pdf_path}")
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
