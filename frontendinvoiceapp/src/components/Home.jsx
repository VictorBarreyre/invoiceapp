import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Flex, Heading, Text, Button, VStack, HStack, Box, Icon, SimpleGrid, Modal, ModalOverlay,
    ModalContent, ModalCloseButton, ModalBody, useDisclosure
} from '@chakra-ui/react';
import { AiOutlineFileText, AiOutlineMail, AiOutlineUser, AiOutlineDashboard } from 'react-icons/ai';
import Carousel from './Carousel';
import Abo from './Abo'; // Importer le composant Abo

const Home = () => {
    const { isOpen, onOpen, onClose } = useDisclosure(); // Pour gérer la modale
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

    return (
        <>
            <Flex direction="column" justifyContent="center" alignItems="center" mt='4.5rem'>
                {/* Autres sections */}
                <Carousel />

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
