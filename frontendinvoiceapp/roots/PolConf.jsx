import React from 'react';
import { Heading, Text, Flex, Link as ChakraLink } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const PolitiqueConfidentialite = () => {
  return (
    <div className='flex-stepper'>
      <div className="stepper-container">
        <div className="tabs-container">
          <Heading fontSize={{ base: '24px', lg: '26px' }}>Politique de Confidentialité</Heading>

          <Text mt="1rem"><strong>1. Introduction</strong></Text>
          <Text>DBILL.IO s'engage à protéger votre vie privée. Cette politique de confidentialité explique quelles données nous collectons, comment nous les utilisons, et vos droits concernant ces données.</Text>

          <Text mt="1rem"><strong>2. Données collectées</strong></Text>
          <Text>Nous collectons les types de données suivants :</Text>
          <Text>- Informations personnelles : nom, adresse email, numéro de téléphone.</Text>
          <Text>- Données de facturation : adresse postale, informations de paiement.</Text>
          <Text>- Données de navigation : adresse IP, type de navigateur, pages visitées.</Text>

          <Text mt="1rem"><strong>3. Méthodes de collecte</strong></Text>
          <Text>Nous collectons vos données via :</Text>
          <Text>- Les formulaires que vous remplissez sur notre site.</Text>
          <Text>- Les cookies et technologies similaires.</Text>

          <Text mt="1rem"><strong>4. Utilisation des données</strong></Text>
          <Text>Nous utilisons vos données pour :</Text>
          <Text>- Fournir et gérer nos services.</Text>
          <Text>- Traiter vos commandes et paiements.</Text>
          <Text>- Communiquer avec vous et répondre à vos questions.</Text>
          <Text>- Améliorer notre site et nos services.</Text>

          <Text mt="1rem"><strong>5. Partage des données</strong></Text>
          <Text>Nous ne partageons vos données qu'avec :</Text>
          <Text>- Nos partenaires et sous-traitants pour l'exécution de nos services.</Text>
          <Text>- Les autorités légales si requis par la loi.</Text>

          <Text mt="1rem"><strong>6. Sécurité des données</strong></Text>
          <Text>Nous prenons des mesures techniques et organisationnelles pour protéger vos données contre toute perte, accès non autorisé, ou divulgation.</Text>

          <Text mt="1rem"><strong>7. Vos droits</strong></Text>
          <Text>Vous avez le droit de :</Text>
          <Text>- Accéder à vos données personnelles.</Text>
          <Text>- Rectifier vos données si elles sont incorrectes ou incomplètes.</Text>
          <Text>- Demander la suppression de vos données.</Text>
          <Text>- Vous opposer au traitement de vos données.</Text>

          <Text mt="1rem"><strong>8. Contact</strong></Text>
          <Text>Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, veuillez nous contacter à : contact@dbill.io</Text>

          <Flex mt="2rem" w="fit-content" direction="column">
            <ChakraLink as={Link} to="/">Retour à la page d'accueil</ChakraLink>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default PolitiqueConfidentialite;
