import React, { useEffect } from 'react';
import { Heading, Text, Flex } from '@chakra-ui/react';
import { useInvoiceData } from '../src/context/InvoiceDataContext';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../src/context/AuthContext';


const SuccessPage = () => {
  const { invoiceData } = useInvoiceData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    reminderFrequency,
    setReminderFrequency
  } = useInvoiceData();


  const linkTo = user ? "/factures" : "/home";
  const textLink = user ? 'Vos factures' : "Retour à l'accueil"

  return (
    <div className='flex-stepper'>
      <div className="stepper-container">
        <div className="tabs-container">
          <Flex direction='column' alignContent='space-between'>
            <Heading fontSize={{ base: '24px', lg: '26px' }}>Facture envoyée avec succès !</Heading>
            <Text>Votre facture a été envoyée avec succès à l'adresse email du destinataire.</Text>
            <Text mb='1rem'>
              {invoiceData.client.name} recevra des rappels de paiement par email tous les {reminderFrequency} après l'émission de la facture,
              jusqu'à ce que vous en modifiez le statut. Vous pouvez consulter toutes vos factures émises sur notre page{' '}

            </Text>
            <Link to={linkTo}>{textLink}</Link>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
