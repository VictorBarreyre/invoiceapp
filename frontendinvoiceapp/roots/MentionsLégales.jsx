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
          <Text>Adresse : 123 Rue Exemple, 75001 Paris, France</Text>
          <Text>Numéro de SIRET : 123 456 789 00000</Text>
          <Text>Contact : contact@dbill.io, +33 1 23 45 67 89</Text>

          <Text mt="1rem"><strong>2. Directeur de la publication</strong></Text>
          <Text>Nom du directeur de la publication : John Doe</Text>

          <Text mt="1rem"><strong>3. Hébergeur du site</strong></Text>
          <Text>Nom de l'hébergeur : HostingProvider</Text>
          <Text>Adresse de l'hébergeur : 456 Rue Hébergeur, 75002 Paris, France</Text>
          <Text>Contact de l'hébergeur : support@hostingprovider.com, +33 1 23 45 67 90</Text>

          <Text mt="1rem"><strong>4. Numéro de TVA intracommunautaire</strong></Text>
          <Text>FR 12 345678900</Text>

          <Flex mt="2rem" w="fit-content" direction="column">
            <ChakraLink as={Link} to="/">Retour à la page d'accueil</ChakraLink>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
