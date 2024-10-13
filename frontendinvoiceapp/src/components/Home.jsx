import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Flex, Heading, Text, Button, VStack, HStack, Box, Icon, SimpleGrid, Modal, ModalOverlay,
    ModalContent, ModalCloseButton, ModalBody, useDisclosure
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import {
    AiOutlineFileText,
    AiOutlineMail,
    AiOutlineUser,
    AiOutlineDashboard,
} from 'react-icons/ai';
import Carousel from './Carousel';
import Abo from '../../roots/Abo';

const Home = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const endOfOffer = new Date();
            endOfOffer.setMonth(endOfOffer.getMonth() + 1, 0); // Fin du mois en cours
            const difference = +endOfOffer - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100; // Décalage pour éviter le header
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <>
            <Flex
                direction="column"
                justifyContent="center"
                alignItems="center"
                mt='4.5rem'>
                <Flex
                    pt='1rem'
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    height="55vh"  // Pour centrer verticalement
                    width={{ base: '23rem', lg: '40rem' }}

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
                            color="white"
                            px={6}
                            py={4}
                            fontSize="16px"
                            _hover={{
                                boxShadow: 'rgba(174, 174, 192, 0.4) -1.5px -1.5px 3px 0px, rgb(255, 255, 255) 1.5px 1.5px 3px 0px',
                                color: '#745FF2',
                                backgroundColor: 'white !important',
                            }}
                        >
                            Créer ma facture
                        </Button>

                        <Button
                            onClick={() => scrollToSection('why-choose-us')}
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
                <Box id="why-choose-us" w="90vw" mb='7rem' pt='3rem' >
                    <Heading textAlign="center" mb='2rem' fontSize={{ base: '24px', lg: '30px' }}>
                        Pourquoi choisir notre solution ?
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 4 }} spacing={5} mx="auto">
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
                <Box className='neue-up' mb='7rem' pb='4rem' pt='3rem' bg="white" width='100%' >
                    <Heading textAlign="center" mb='2rem' fontSize={{ base: '24px', lg: '30px' }}>
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

              {/* Section appel à l'action avec compteur */}
              <Box pb='4rem' pt='3rem' textAlign="center" w='90vw' borderRadius='10px'>
                    <Flex direction={{ base: 'column', lg: 'row' }} alignItems="center" justifyContent="space-between" gap={6}>
                        <Flex w={{ base: '100%', lg: '50%' }} alignItems='start' direction='column' textAlign={{ base: 'center', lg: 'left' }}>
                            <Heading mb='1.5rem' fontSize={{ base: '24px', lg: '30px' }}>
                                Prêt à simplifier votre facturation ?
                            </Heading>
                            <Text fontSize={{ base: '16px', lg: '16px' }} mb={4}>
                                Inscrivez-vous pour bénéficier d'un mois gratuit et découvrez tous les avantages de notre solution sans engagement. Vous pouvez annuler votre abonnement à tout moment, sans frais supplémentaires. Rejoignez-nous dès maintenant et facilitez votre gestion de factures !
                            </Text>
                            <Text fontWeight="bold" fontSize="20px" mt={4}>
                                Offre se terminant dans {timeLeft.days} jours {timeLeft.hours} h {timeLeft.minutes} min {timeLeft.seconds} sec
                            </Text>
                        </Flex>
                        <Box w={{ base: '100%', lg: '50%' }}>
                            {/* Bouton pour ouvrir la modale */}
                            <Button
                                onClick={onOpen}
                                w={{ base: 'unset', lg: 'fit-content' }}
                                backgroundColor="black"
                                borderRadius="30px"
                                color="white"
                                px={6}
                                py={4}
                                fontSize="16px"
                                _hover={{
                                    boxShadow: 'rgba(174, 174, 192, 0.4) -1.5px -1.5px 3px 0px, rgb(255, 255, 255) 1.5px 1.5px 3px 0px',
                                    color: '#745FF2',
                                    backgroundColor: 'white !important',
                                }}
                            >
                                Profitez de l'offre
                            </Button>
                        </Box>
                    </Flex>
                </Box>

                {/* Modale d'abonnement */}
                <Modal isOpen={isOpen} onClose={onClose} size="6xl">
                    <ModalOverlay />
                    <ModalContent>
                        <ModalCloseButton />
                        <ModalBody padding='2rem'>
                            <Abo /> {/* Charge le composant Abo dans la modale */}
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </Flex>
        </>
    );

};

export default Home;