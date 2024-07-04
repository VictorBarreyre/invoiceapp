import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const PaymentSuccess = () => {
  return (
    <div className='flex-stepper'>
    <div className="stepper-container">
      <div className="tabs-container">
      <Heading fontSize={{ base: '24px', lg: '26px' }}>Paiement Réussi !</Heading>
      <Text >
        Merci pour votre paiement. Votre transaction a été effectuée avec succès.
      </Text>
      <Link pt='2rem' to="/">Retour à la page d'accueil</Link>
      </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
