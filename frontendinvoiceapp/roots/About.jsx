import React from 'react';
import {
  Box,
  Text,
  Heading,
  Flex,
  Link
} from '@chakra-ui/react';
import {
  EditIcon,
  EmailIcon,
  LinkIcon,
  LockIcon,
} from '@chakra-ui/icons';

// Composant pour les cartes d'étape
const Feature = ({ title, text, icon, link }) => {
  return (
    <Flex 
      height='auto'
      className='neue-up'
      borderWidth='1px'
      backgroundColor='white'
      borderRadius='1vw'
      w='45vh'
      m='2vh'
      p='4vh'
      >
    <Flex justifyContent='space-between' direction='column'>
      <Flex
        w='100%'
        flexDirection='column'
        mb={1}
        >
          {icon}
        <Flex w='100%' gap='10px' mt='2vh' mb='2vh'>
          <Heading size='md' mb='0' fontWeight={600}>{title}</Heading> 
        </Flex>
        <Text mb='1rem' color="#4A5568">{text}</Text>
        </Flex>
        <Link color='#745FF2'> {link}</Link>
      </Flex>
    </Flex>
  );
};

// Page À propos
const AboutPage = () => {
  return (
    <div className='flex-stepper'>
    <div className="stepper-container">
        <div className="tabs-container">
      <Flex mb='3rem' direction='column' > 
      <Heading fontSize={{ base: '24px', lg: '26px' }}>À propos de dbill</Heading>
      <Text color='#4A5568'> Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. </Text>
      </Flex>
      <Flex overflowX='auto' direction={{ base: 'column', lg: 'unset' }} w='auto' spacing={10} px={12} p={{base:'0', lg :'unset'}} >
        <Feature
          icon={<EditIcon color='#745FF2' w={8} h={8} />}
          title="Créer une facture"
          text="Commencez par créer une facture ou un devis directement sur notre site."
          link="Lorem"
        />
        <Feature
          icon={<EmailIcon color='#745FF2' w={8} h={8} />}
          title="Envoyer au destinataire"
          text="L'envoi se fait facilement par email, permettant au destinataire de recevoir tout ce dont il a besoin sans délai."
          link="Lorem"
        />
        <Feature
          icon={<LinkIcon color='#745FF2' w={8} h={8} />}
          title="Accéder au contrat"
          text="Le destinataire accède à la plateforme via un lien pour signer le contrat."
          link="Lorem"
        />
        <Feature
          icon={<LockIcon color='#745FF2' w={8} h={8} />}
          title="Paiement automatique"
          text="Après signature, le paiement s'effectue automatiquement, vous recevez votre argent selon les échéances définies"
          link="Lorem"
        />
      </Flex>
    </div>
            </div>
        </div>
  );
};

export default AboutPage;