import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Flex, Heading, Text, Button, VStack, HStack, Box, Icon, SimpleGrid, StackDivider,Image
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import {
    AiOutlineFileText,
    AiOutlineMail,
    AiOutlineUser,
    AiOutlineDashboard,
} from 'react-icons/ai';
import Carousel from './Carousel';

const Home = () => {

    return (
        <>
        
            <Flex
                direction="column"
                justifyContent="center"
                alignItems="center" >
                <Flex
                    pt='4rem'
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    height="55vh"  // Pour centrer verticalement
                    width={{ base: '23rem', lg: '40rem' }}
                    bg="gray.50"
                    px={4}
                >
                    <Heading fontSize={{ base: '28px', lg: '36px' }} textAlign="center" mb={4}>
                        Simplifiez votre facturation avec notre solution en ligne
                    </Heading>
                    <Text textAlign="center" fontSize={{ base: '16px', lg: '16px' }} mb={6}>
                        Créez et envoyez des factures professionnelles en quelques clics, gérez vos clients et automatisez vos relances de paiement.
                    </Text>

                    <HStack spacing={4}>
                        <Button
                            as={RouterLink}
                            to="/creer-facture-en-ligne"
                            w={{ base: 'unset', lg: 'fit-content' }}
                            backgroundColor="black"
                            borderRadius="30px"
                            color='white'
                            px={6}
                            py={4}
                            fontSize="16px"
                        >
                            Créer ma facture
                        </Button>
                        <Button
                            w={{ base: 'unset', lg: 'fit-content' }}
                            colorScheme="gray"
                            borderRadius="30px"
                            px={6}
                            py={4}
                            fontSize="16px"
                        >
                            À propos
                        </Button>
                    </HStack>

                </Flex>

                <Carousel />

                {/* Section des fonctionnalités clés */}
                <Box w="90vw" mb='7rem' pt='3rem' >
                    <Heading textAlign="center" mb='2rem' fontSize={{ base: '24px', lg: '30px' }}>
                        Pourquoi choisir notre solution ?
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5}  mx="auto">
                    <Box   
                            className='neue-up'
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            p={5}
                            textAlign="center" 
                        >
                            <Icon as={AiOutlineFileText} color="#745FF2" w={10} h={10} mb={4} />
                            <Text fontSize="16px">Envoi de factures en ligne rapide et facile</Text>
                        </Box>
                        <Box
                            className='neue-up'
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            p={5}
                            textAlign="center" 
                        >
                            <Icon as={AiOutlineMail} color="#745FF2" w={10} h={10} mb={4} />
                            <Text fontSize="16px">Automatisation des relances de paiement par email</Text>
                        </Box>
                        <Box
                            className='neue-up'
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            p={5}
                            textAlign="center" 
                        >
                            <Icon as={AiOutlineUser} color="#745FF2" w={10} h={10} mb={4} />
                            <Text fontSize="16px">Création de profils clients détaillés</Text>
                        </Box>
                        <Box
                            className='neue-up'
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            p={5}
                            textAlign="center" 
                        >
                            <Icon as={AiOutlineDashboard} color="#745FF2" w={10} h={10} mb={4} />
                            <Text fontSize="16px">Gestion efficace du statut des factures</Text>
                        </Box>
                    </SimpleGrid>
                </Box>

                {/* Section témoignages clients */}
                <Box py={10} bg="gray.50" px={4}>
                    <Heading textAlign="center" mb={6} fontSize={{ base: '24px', lg: '30px' }}>
                        Ce que disent nos clients
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} maxW="800px" mx="auto">
                        <Box>
                            <Text fontSize="16px" mb={2}>
                                "Cette application a simplifié ma gestion de factures. <br /> Je gagne un temps précieux !"
                            </Text>
                            <Text fontWeight="bold">- Marie D., Freelance</Text>
                        </Box>
                        <Box>
                            <Text fontSize="16px" mb={2}>
                                "Les relances automatiques m'ont aidé à améliorer mon cash-flow. Je recommande vivement."
                            </Text>
                            <Text fontWeight="bold">- Julien P., Entrepreneur</Text>
                        </Box>
                    </SimpleGrid>
                </Box>

                {/* Section appel à l'action */}
                <Box py={10} bg="white" textAlign="center" px={4}>
                    <Heading mb={4} fontSize={{ base: '24px', lg: '30px' }}>
                        Prêt à simplifier votre facturation ?
                    </Heading>
                    <Button
                        backgroundColor="#745FF2"
                        size="lg"
                        borderRadius="30px"
                        px={8}
                        py={6}
                        color='white'
                    >
                        Commencer dès maintenant
                    </Button>
                </Box>
            </Flex>
        </>
    );

};

export default Home;
