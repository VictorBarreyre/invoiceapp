import React from 'react';
import { Heading, Text, Flex, Link as ChakraLink } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const CGU = () => {
  return (
    <div className='flex-stepper'>
      <div className="stepper-container">
        <div className="tabs-container">
          <Heading fontSize={{ base: '24px', lg: '26px' }}>Conditions Générales d'Utilisation / Vente</Heading>
          <Text mt="1rem"><strong>1. Identité de l'éditeur du site</strong></Text>
          <Text>Nom de l'entreprise : DBILL.IO</Text>
          <Text>Adresse : 123 Rue Exemple, 75001 Paris, France</Text>
          <Text>Numéro de SIRET : 123 456 789 00000</Text>
          <Text>Contact : contact@dbill.io, +33 1 23 45 67 89</Text>

          <Text mt="1rem"><strong>2. Objet des CGU/CGV</strong></Text>
          <Text>Les présentes Conditions Générales d'Utilisation et de Vente (CGU/CGV) définissent les règles et conditions d'utilisation du service de création de factures en ligne proposé par DBILL.IO.</Text>

          <Text mt="1rem"><strong>3. Accès au service</strong></Text>
          <Text>L'accès au service nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.</Text>

          <Text mt="1rem"><strong>4. Conditions d'utilisation du service</strong></Text>
          <Text>L'utilisateur s'engage à utiliser le service conformément aux lois en vigueur et aux présentes CGU. Toute utilisation abusive ou illégale du service est interdite.</Text>
          <Text>La société DBILL.IO n'est pas responsable de l'utilisation frauduleuse de la solution et/ou des documents émis comportant des informations erronées.</Text>

          <Text mt="1rem"><strong>5. Tarification et modalités de paiement</strong></Text>
          <Text>Le service propose des plans tarifaires détaillés sur le site. Les paiements sont effectués mensuellement par carte bancaire.</Text>

          <Text mt="1rem"><strong>6. Propriété intellectuelle</strong></Text>
          <Text>Tous les contenus du site et du service sont protégés par le droit d'auteur. L'utilisateur conserve la propriété des factures qu'il crée.</Text>

          <Text mt="1rem"><strong>7. Données personnelles</strong></Text>
          <Text>Les données personnelles collectées sont utilisées uniquement pour fournir le service. L'utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données.</Text>

          <Text mt="1rem"><strong>8. Responsabilité</strong></Text>
          <Text>DBILL.IO ne saurait être tenue responsable des dommages indirects résultant de l'utilisation du service. L'utilisateur est responsable de l'utilisation qu'il fait du service.</Text>

          <Text mt="1rem"><strong>9. Résiliation</strong></Text>
          <Text>L'utilisateur peut résilier son compte à tout moment via les paramètres de son compte. DBILL.IO se réserve le droit de résilier un compte en cas de violation des CGU.</Text>

          <Text mt="1rem"><strong>10. Modification des CGU/CGV</strong></Text>
          <Text>DBILL.IO se réserve le droit de modifier les présentes CGU/CGV. Les utilisateurs seront informés des modifications par email.</Text>

          <Text mt="1rem"><strong>11. Droit applicable et résolution des litiges</strong></Text>
          <Text>Les présentes CGU/CGV sont soumises à la loi française. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.</Text>

          <Flex mt="2rem" w="fit-content" direction="column">
            <ChakraLink as={Link} to="/">Retour à la page d'accueil</ChakraLink>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default CGU;
