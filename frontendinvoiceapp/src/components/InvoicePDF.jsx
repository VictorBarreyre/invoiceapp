import React from 'react';
import { Text, View, Document, StyleSheet, Page } from '@react-pdf/renderer';

// Définition des styles
const styles = StyleSheet.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  section: {
    paddingLeft: 40,
    paddingRight: 40,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    justifyContent: 'space-between',
    fontSize: 24,
    marginTop: 50,
    marginBottom: 80,
    color: 'black',
    fontWeight: 'bold',
    width: '100%',
  },
  numbfact: {
    fontSize: 14,
    color: 'black',
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
  },
  date: {
    fontSize: 10,
    color: 'grey',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  text: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    marginBottom: 2,
    color: 'grey',
  },
  paiementDetails: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingBottom: 30,
  },
  issuerAndClientContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingBottom: 30,
    backgroundColor: '#f7f7f7',
    marginBottom: '60px',
  },
  issuerDetails: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    paddingLeft: 40,
  },
  clientDetails: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    alignItems: 'flex-end',
    paddingRight: 40,
    textAlign: 'right',
  },
  table: {
    display: 'table',
    width: "auto",
    borderStyle: 'solid',
    borderColor: '#d9d9d9',
    borderWidth: 0,
    borderRadius: '5px',
    marginTop: 5,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
    borderBottomWidth: '1px',
    borderBottomColor: '#f7f7f7',
  },
  tableColHeader: {
    width: "25%",
    backgroundColor: '#f7f7f7',
    alignItems: 'start',
    justifyContent: 'center',
  },
  tableCol: {
    width: "25%",
  },
  tableCellHeader: {
    textTransform: 'uppercase',
    margin: 5,
    fontSize: 10,
    fontWeight: 500,
  },
  tableCellHeaderlast: {
    textAlign: 'right',
    textTransform: 'uppercase',
    margin: 5,
    fontSize: 10,
    fontWeight: 500,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  tableCelllast: {
    textAlign: 'right',
    margin: 5,
    fontSize: 10,
  },
  total: {
    display: 'flex',
    fontSize: 20,
    marginTop: 20,
    marginBottom: 80,
    color: 'black',
    fontWeight: 'bold',
    width: '100%',
  },
  totalDetails: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'end',
    justifyContent: 'flex-end',
    textAlign: 'right',
  },
  subtitletotal: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
    fontFamily: 'Helvetica',
    textAlign: 'right',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 'auto',
    paddingRight: 40,
  },
  footerText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: 'grey',
  },
});

// Composant InvoicePDF
const InvoicePDF = ({ invoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View style={styles.issuerDetails}>
          <Text style={styles.title}>Votre Société</Text>
        </View>
        <View style={styles.clientDetails}>
          <Text style={styles.numbfact}>Facture n°: {invoiceData.number}</Text>
          <Text style={styles.date}>Date d'émission: {invoiceData.date}</Text>
        </View>
      </View>
      <View style={styles.issuerAndClientContainer}>
        <View style={styles.issuerDetails}>
          <Text style={styles.subtitle}>Émise par</Text>
          <Text style={styles.text}>{invoiceData.issuer.name}</Text>
          <Text style={styles.text}>{invoiceData.issuer.adresse}</Text>
          <Text style={styles.text}>{invoiceData.issuer.siret}</Text>
          <Text style={styles.text}>{invoiceData.issuer.email}</Text>
        </View>
        <View style={styles.clientDetails}>
          <Text style={styles.subtitle}>À destination de</Text>
          <Text style={styles.text}>{invoiceData.client.name}</Text>
          <Text style={styles.text}>{invoiceData.client.adresse}</Text>
          <Text style={styles.text}>{invoiceData.client.siret}</Text>
          <Text style={styles.text}>{invoiceData.client.email}</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.subtitle}>Articles / Services</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Description</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Quantité</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Prix Unit.</Text></View>
            <View style={styles.tableColHeader}><Text style={styles.tableCellHeaderlast}>Total HT</Text></View>
          </View>
          {invoiceData.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.description}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.quantity}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCell}>{item.unitPrice}</Text></View>
              <View style={styles.tableCol}><Text style={styles.tableCelllast}>{item.quantity * item.unitPrice}</Text></View>
            </View>
          ))}
        </View>
        <View style={styles.total}>
          <View style={styles.totalDetails}>
            <Text style={styles.subtitletotal}>Sous-total HT: {invoiceData.subtotal}{invoiceData.devise}</Text>
            <Text style={styles.subtitletotal}>
              TVA: {invoiceData.vatRate} % ({invoiceData.vatAmount ? invoiceData.vatAmount.toFixed(2) : '0.00'} {invoiceData.devise})
            </Text>
            <Text style={styles.subtitletotal}>Total TTC: {invoiceData.total}{invoiceData.devise}</Text>
          </View>
        </View>
        <View style={styles.paiementDetails}>
          <Text style={styles.subtitle}>Modalités de paiement</Text>
          <Text style={styles.text}>IBAN sur lequel le paiement sera envoyé</Text>
          <Text style={styles.text}>{invoiceData.issuer.iban}</Text>
        </View>
        <View style={{ marginTop: 60 }}>
          <Text style={styles.date}>
            Veuillez noter que le paiement de cette facture constitue une acceptation des termes et conditions du contrat établi entre {invoiceData.issuer.name} et {invoiceData.client.name}. Vous trouverez les détails concernant la procédure d'acceptation et de signature du contrat dans l'email accompagnant cette facture.
          </Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Service proposé par dbill.io</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
