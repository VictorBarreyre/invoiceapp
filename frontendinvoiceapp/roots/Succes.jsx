import React from 'react';
import { Heading, Text, Flex } from '@chakra-ui/react';
import { useInvoiceData } from '../src/context/InvoiceDataContext';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';

const SuccessPage = () => {
  const { invoiceData } = useInvoiceData();
  const { user } = useAuth();
  const location = useLocation();

  // Récupérer l'état passé depuis navigate (fromInvoice ou autre)
  const fromInvoice = location.state?.fromInvoice || false;

  // Texte conditionnel basé sur l'origine de la navigation
  const headingText = fromInvoice
    ? "Facture envoyée avec succès !"
    : "Abonnement souscrit avec succès !";

  const messageText = fromInvoice
    ? `Votre facture a été envoyée avec succès à l'adresse email du destinataire. ${invoiceData.client.name} recevra des rappels de paiement tous les ${invoiceData.reminderFrequency}.`
    : "Votre abonnement a été activé avec succès. Vous pouvez maintenant envoyer des factures sans restrictions.";

  const linkTo = user ? "/factures" : "/home";
  const textLink = user ? 'Vos factures' : "Retour à l'accueil";

  return (
    <div className='flex-stepper'>
      <div className="stepper-container">
        <div className="tabs-container">
          <Flex direction='column' alignContent='space-between'>
            <Heading fontSize={{ base: '24px', lg: '26px' }}>{headingText}</Heading>
            <Text mb='1rem'>{messageText}</Text>
            <Link to={linkTo}>{textLink}</Link>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
