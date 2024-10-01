import React from 'react';
import { Text, View, Document, StyleSheet, Page } from '@react-pdf/renderer';

// Définition des styles
const styles = StyleSheet.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between', // Ensure that content is spaced between top and bottom
    height: '100vh', // Use full viewport height
  },
  section: {
    paddingLeft: 30,
    paddingRight: 30,
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'start',
    justifyContent: 'space-between',
    fontSize: 24,
    marginTop: 40,
    marginBottom: 80,
    color: 'black',
    fontWeight: 'bold',
    width: '100%',
  },
  numbfact: {
    fontSize: 16,
    color: 'black',
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
  },
  date: {
    marginTop: 5,
    fontSize: 10,
    color: 'grey',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: '600',
    fontFamily: 'Helvetica',
  },
  text: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: 'grey',
    lineHeight: 1.4,
  },
  addressText: {
    lineHeight: 1.4, // Ajustez la valeur selon vos besoins
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
    paddingLeft: 30,
  },
  clientDetails: {
    display: 'flex',
    flexDirection: 'column',
    width: '50%',
    alignItems: 'flex-end',
    paddingRight: 30,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '5px'
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
    fontSize: 14,
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
    fontSize: 14,
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
    paddingBottom: 40,
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
          <Text style={styles.title}>
            {invoiceData.issuer.company ? invoiceData.issuer.company : 'Facture'}
          </Text>
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
          <Text style={[styles.text, styles.addressText]}> {invoiceData.issuer.adresse
            .split(',')
            .map((item) => item.trim())
            .join('\n')}</Text>
          <View style={styles.row}>
            <Text style={styles.text}>{invoiceData.issuer.postalCode}</Text>
            <Text style={styles.text}>{invoiceData.issuer.country}</Text>
          </View>
          <Text style={styles.text}>{invoiceData.issuer.siret}</Text>
          <Text style={styles.text}>{invoiceData.issuer.email}</Text>
        </View>
        <View style={styles.clientDetails}>
          <Text style={styles.subtitle}>À destination de</Text>
          <Text style={styles.text}>{invoiceData.client.name}</Text>
          <Text style={[styles.text, styles.addressText]}>
            {invoiceData.client.adresse
              .split(',')
              .map((item) => item.trim())
              .join('\n')}
          </Text>
          <View style={styles.row}>
            <Text style={styles.text}>{invoiceData.client.postalCode}</Text>
            <Text style={styles.text}>{invoiceData.client.country}</Text>
          </View>
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
              <View style={styles.tableCol}><Text style={styles.tableCelllast}>{item.quantity * item.unitPrice} {invoiceData.devise}</Text></View>
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
        {invoiceData.issuer.iban && (
          <View style={styles.paiementDetails}>
            <Text style={styles.subtitle}>Modalités de paiement</Text>
            <Text style={styles.text}>IBAN sur lequel le paiement sera envoyé</Text>
            <Text style={styles.text}>{invoiceData.issuer.iban}</Text>
          </View>
        )}
         <View style={styles.footer}>
          <Text style={styles.date}>
            Cette facture est éditée par {invoiceData.issuer.name},
            <br />
            Conformément aux articles L.441-9 et suivants du Code de commerce, cette facture doit être réglée dans un délai de 30 jours à compter de sa date d'émission.
            <br />
            En cas de retard de paiement, une pénalité de retard calculée sur la base de trois fois le taux d'intérêt légal sera appliquée. Une indemnité forfaitaire de 40 euros pour frais de recouvrement sera également due (art. D.441-5 du Code de commerce).
            <br />
            Pour toute question relative à cette facture, merci de contacter notre service comptable à l'adresse {invoiceData.issuer.email}.
          </Text>
        </View>

      </View>
    </Page>
  </Document>
);

export default InvoicePDF;