import React from 'react';
import { Heading, Text, Flex, Link as ChakraLink } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const MentionsLegales = () => {
  return (
    <div className='flex-stepper'>
      <div className="stepper-container">
        <div className="tabs-container">
          <Heading fontSize={{ base: '24px', lg: '26px' }}>Mentions Légales</Heading>

          <Text mt="1rem"><strong>1. Éditeur du site</strong></Text>
          <Text>Nom de l'entreprise : DBILL.IO</Text>
          <Text>Contact : contact@dbill.io, </Text>


          <Text mt="1rem"><strong>3. Hébergeur du site</strong></Text>
          <Text>Nom de l'hébergeur : IONOS</Text>
          <Text>Adresse de l'hébergeur : 7, place de la Gare BP 70109 57200 Sarreguemines</Text>
          <Text>Contact de l'hébergeur : support@ionos.com, 0970 808 911</Text>


          <Flex mt="2rem" w="fit-content" direction="column">
            <ChakraLink as={Link} to="/">Retour à la page d'accueil</ChakraLink>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
