import React, { useState, useEffect } from 'react';
import {
    Heading,
    Flex,
    Text,
    Box,
    Spinner,
    List,
    ListItem,
    ListIcon,
    Link,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    VStack,
    HStack
} from '@chakra-ui/react';
import { CheckCircleIcon, CheckIcon } from '@chakra-ui/icons';
import { useInvoiceData } from '../src/context/InvoiceDataContext';
import SubscribeForm from '../src/components/SubcribeForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51OwLFM00KPylCGutjKAkwhqleWEzuvici1dQUPCIvZHofEzLtGyM9Gdz5zEfvwSZKekKRgA1el5Ypnw7HLfYWOuB00ZdrKdygg');

const Abo = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { invoiceData, baseUrl, createCheckoutSession } = useInvoiceData();
    const [selectedPlan, setSelectedPlan] = useState(''); // Nouvel état pour gérer la sélection de la carte
    const [clientSecret, setClientSecret] = useState('');
    const [isCheckoutSessionCreated, setIsCheckoutSessionCreated] = useState(false);
    
    // Hook pour gérer la modale
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        const fetchProductsAndPrices = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/abonnement/products-and-prices`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const targetProduct = data.find(p => p.name === 'Premium'); // Remplacer 'Premium' par le nom du produit à afficher
                setProduct(targetProduct);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };

        fetchProductsAndPrices();
    }, [baseUrl]);

    const handleCheckoutSessionCreation = async (priceId) => {
        if (isCheckoutSessionCreated) return;
        setIsCheckoutSessionCreated(true);
        try {
            const onSuccess = (clientSecret) => {
                setClientSecret(clientSecret);
                onOpen(); // Ouvre la modale une fois la session de checkout créée
            };
            const onError = (error) => {
                console.error('Error creating checkout session:', error);
            };
            await createCheckoutSession(invoiceData.issuer.email, invoiceData.issuer.name, priceId, onSuccess, onError);
        } catch (error) {
            console.error('Error creating checkout session:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
                <Spinner color='#745FF2' size="md" />
            </div>
        );
    }

    if (!product) {
        return <Text>Aucun produit trouvé.</Text>;
    }

    const monthlyPrice = product.prices.find(price => price.recurring?.interval === 'month');
    const yearlyPrice = product.prices.find(price => price.recurring?.interval === 'year');

    // Exemple d'avantages pour chaque plan
    const advantages = [
        "Accès illimité au contenu",
        "Support client prioritaire",
        "Mises à jour régulières",
        "Accès à des fonctionnalités exclusives"
    ];

    return (
        <>
            {/* Affichage inchangé des offres d'abonnement */}
            <div className='flex-stepper'>
                <div className="stepper-container">
                    <div className="tabs-container">
                        <Flex direction="column" align="center" >
                            <Heading fontSize={{ base: '24px', lg: '26px' }} mb='1rem'>Choisissez votre formule d'abonnement</Heading>
                            <Text color='#4A5568' w='100%' mb='3rem' textAlign="center">
                                Nous respectons votre choix de ne pas accepter les cookies. Découvrez notre formule premium.
                            </Text>

                            <Flex direction={{ base: 'column', lg: 'row' }} gap='2rem' w='100%' justify="center">
                                {/* Plan Mensuel */}
                                {monthlyPrice && (
                                    <Box 
                                        borderWidth="1px" 
                                        borderRadius="lg" 
                                        overflow="hidden" 
                                        padding="1.5rem" 
                                        backgroundColor={selectedPlan === 'monthly' ? 'white' : '#fdfdfd'}
                                        boxShadow="md"
                                        maxW="350px"
                                        width="100%"
                                        borderColor={selectedPlan === 'monthly' ? '#745FF2' : 'transparent'}
                                        cursor="pointer"
                                        onClick={() => setSelectedPlan('monthly')} // Sélection de la carte
                                    >
                                        <VStack align="start" spacing="1rem">
                                            <HStack>
                                                <CheckCircleIcon color={selectedPlan === 'monthly' ? '#745FF2' : 'gray.400'} />
                                                <Heading color={selectedPlan === 'monthly' ? '#745FF2' : 'black'} size="md">Paiement mensuel</Heading>
                                            </HStack>
                                            <Text fontSize="lg">{(monthlyPrice.unit_amount / 100).toLocaleString()} {invoiceData.devise} / Mois</Text>
                                            <List spacing={2}>
                                                {advantages.map((adv, index) => (
                                                    <ListItem key={index}>
                                                        <ListIcon as={CheckIcon} color='#745FF2' />
                                                        {adv}
                                                    </ListItem>
                                                ))}
                                            </List>
                                            <Button 
                                                onClick={() => handleCheckoutSessionCreation(monthlyPrice.id)} 
                                                color='white' 
                                                borderRadius='30px' 
                                                backgroundColor={selectedPlan === 'monthly' ? '#745FF2' : 'black'} // Couleur du CTA
                                                width="100%" 
                                                p='10px 20px'
                                                mt='1rem'
                                            >
                                                Choisir cette formule
                                            </Button>
                                        </VStack>
                                    </Box>
                                )}

                                {/* Plan Annuel */}
                                {yearlyPrice && (
                                    <Box 
                                        borderWidth="1px" 
                                        borderRadius="lg" 
                                        overflow="hidden" 
                                        padding="1.5rem" 
                                        backgroundColor={selectedPlan === 'yearly' ? 'white' : '#fdfdfd'}
                                        boxShadow="md"
                                        maxW="350px"
                                        width="100%"
                                        borderColor={selectedPlan === 'yearly' ? '#745FF2' : 'transparent'}
                                        cursor="pointer"
                                        onClick={() => setSelectedPlan('yearly')} // Sélection de la carte
                                    >
                                        <VStack align="start" spacing="1rem">
                                            <HStack>
                                                <CheckCircleIcon color={selectedPlan === 'yearly' ? '#745FF2' : 'gray.400'} />
                                                <Heading color={selectedPlan === 'yearly' ? '#745FF2' : 'black'} size="md">Paiement annuel</Heading>
                                            </HStack>
                                            <Text fontSize="lg">{(yearlyPrice.unit_amount / 100).toLocaleString()} {invoiceData.devise} / An</Text>
                                            <List spacing={2}>
                                                {advantages.map((adv, index) => (
                                                    <ListItem key={index}>
                                                        <ListIcon as={CheckIcon} color='#745FF2' />
                                                        {adv}
                                                    </ListItem>
                                                ))}
                                            </List>
                                            <Button 
                                                onClick={() => handleCheckoutSessionCreation(yearlyPrice.id)} 
                                                color='white' 
                                                borderRadius='30px' 
                                                backgroundColor={selectedPlan === 'yearly' ? '#745FF2' : 'black'} // Couleur du CTA
                                                width="100%" 
                                                p='10px 20px'
                                                mt='1rem'
                                            >
                                                Choisir cette formule
                                            </Button>
                                        </VStack>
                                    </Box>
                                )}
                            </Flex>

                            <Text color='#4A5568' fontSize="14px" mt='2rem' textAlign="center">
                                En continuant, vous acceptez <Link color='#745FF2'>nos termes et conditions.</Link>
                            </Text>
                        </Flex>
                    </div>
                </div>
            </div>

            {/* Modale de paiement */}
            <Modal isOpen={isOpen} onClose={onClose} size="6xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Procéder au paiement</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex direction={{ base: 'column', lg: 'row' }} gap="20px">
                            {/* Récapitulatif du prix sélectionné */}
                            <Box flex="1" padding="1rem" borderRight={{ lg: '1px solid #E2E8F0' }}>
                                <Heading size="md" mb='1rem'>Résumé de votre abonnement</Heading>
                                <Text><strong>Plan sélectionné:</strong> {selectedPlan === 'monthly' ? 'Mensuel' : 'Annuel'}</Text>
                                <Text><strong>Prix:</strong> {selectedPlan === 'monthly' ? (monthlyPrice.unit_amount / 100).toLocaleString() : (yearlyPrice.unit_amount / 100).toLocaleString()} {invoiceData.devise} {selectedPlan === 'monthly' ? '/ Mois' : '/ An'}</Text>
                                <Text mt='1rem'><strong>Description:</strong> {product.description}</Text>
                            </Box>

                            {/* Informations de paiement */}
                            <Box flex="1" padding="1rem">
                                {clientSecret && (
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <SubscribeForm 
                                            clientSecret={clientSecret} 
                                            setClientSecret={setClientSecret} 
                                            selectedPriceId={selectedPlan === 'monthly' ? monthlyPrice.id : yearlyPrice.id} 
                                        />
                                    </Elements>
                                )}
                            </Box>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Fermer
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Abo;
