import React, { useState, useEffect } from 'react';
import {
    Heading, Flex, Text, Box, Spinner, List, ListItem, ListIcon, Button, Modal, ModalOverlay,
    ModalContent, ModalCloseButton, ModalBody, useDisclosure, VStack, HStack, Alert, AlertIcon, Link
} from '@chakra-ui/react';
import { CheckCircleIcon, CheckIcon } from '@chakra-ui/icons';
import { useInvoiceData } from '../src/context/InvoiceDataContext';
import SubscribeForm from '../src/components/SubcribeForm';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Charger Stripe avec votre clé publique
const stripePromise = loadStripe('pk_test_51OwLFM00KPylCGutjKAkwhqleWEzuvici1dQUPCIvZHofEzLtGyM9Gdz5zEfvwSZKekKRgA1el5Ypnw7HLfYWOuB00ZdrKdygg');

const Abo = () => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { invoiceData, createCheckoutSession } = useInvoiceData();
    const [selectedPlan, setSelectedPlan] = useState('monthly'); // Gérer la sélection du plan
    const [clientSecret, setClientSecret] = useState('');
    const [isCheckoutSessionCreated, setIsCheckoutSessionCreated] = useState(false);
    const [error, setError] = useState(null); // Gérer les erreurs

    const { isOpen, onOpen, onClose } = useDisclosure(); // Gérer l'état de la modale

    useEffect(() => {
        const fetchProductsAndPrices = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/abonnement/products-and-prices`); // Utilisez des backticks ici
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const targetProduct = data.find(p => p.name === 'Premium');
                setProduct(targetProduct);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Une erreur est survenue lors du chargement des produits.');
                setLoading(false);
            }
        };

        fetchProductsAndPrices();
    }, []);


    // Gérer la création de la session Stripe et l'affichage de la modale
    const handleCheckoutSessionCreation = async (priceId) => {
        console.log('Creating checkout session with priceId:', priceId); // Ajoutez ce log
        if (isCheckoutSessionCreated || !priceId) return;
        setIsCheckoutSessionCreated(true);
        setError(null);

        try {
            const onSuccess = (clientSecret) => {
                console.log('Checkout session created successfully:', clientSecret);
                setClientSecret(clientSecret);
                onOpen(); // Ouvre la modale
            };
            const onError = (error) => {
                console.error('Error creating checkout session:', error);
                setError('Une erreur est survenue lors de la création de la session de paiement.');
                setIsCheckoutSessionCreated(false); // Réinitialiser l'état
            };
            // Ajoutez les champs d'adresse, pays et code postal
            await createCheckoutSession(
                invoiceData.issuer.email,
                invoiceData.issuer.name,
                priceId,
                invoiceData.issuer.adresse, // Adresse du client
                invoiceData.issuer.country, // Pays du client
                invoiceData.issuer.postalCode, // Code postal du client
                onSuccess,
                onError
            );
        } catch (error) {
            console.error('Error during checkout session creation:', error);
            setError('Une erreur est survenue lors de la création de la session.');
            setIsCheckoutSessionCreated(false); // Réinitialiser pour permettre une nouvelle tentative
        }
    };



    // Affichage pendant le chargement des produits
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
                <Spinner color='#745FF2' size="md" />
            </div>
        );
    }

    // Affichage d'une erreur si le produit n'est pas trouvé
    if (!product || error) {
        return (
            <Box textAlign="center">
                <Text>{error || 'Aucun produit trouvé.'}</Text>
            </Box>
        );
    }

    const monthlyPrice = product.prices.find(price => price.recurring?.interval === 'month');
    const yearlyPrice = product.prices.find(price => price.recurring?.interval === 'year');

    const advantages = [
        "Accès illimité au contenu",
        "Support client prioritaire",
        "Mises à jour régulières",
        "Accès à des fonctionnalités exclusives",
        "Possibilité de résilier votre abonnement à tout moment"
    ];

    const stripeAppearance = {
        theme: 'flat',
        variables: { fontFamily: 'SF Pro Display, sans-serif', colorPrimary: '#745FF2' },
        rules: {
            '.Label': { 'fontSize': '14px', 'fontWeight': '600', 'marginBottom': '0.5rem' },
            '.Input': {
                'backgroundColor': '#fdfdfd',
                'border': '1px solid #E2E8F0',
                'borderRadius': '4px',
                'padding': '10px',
            },
            '.Tab--selected': { 'backgroundColor': '#745FF2' },
        },
    };

    return (
        <>
            <div className='flex-stepper'>
                <div className="stepper-container">
                    <div className="tabs-container">
                        <Flex direction="column" align="center">
                            <Heading fontSize={{ base: '24px', lg: '26px' }} mb='1rem'>Choisissez votre formule d'abonnement</Heading>
                            <Text color='#4A5568' w='100%' mb='3rem' textAlign="center">
                                L'automatisation des relances par email nécessite un abonnement, que vous pourrez résilier à tout moment.
                                Un compte sera automatiquement créé pour vous, et vous recevrez un mot de passe temporaire par email afin de vous connecter à votre espace personnel.
                                Depuis cet espace, vous pourrez suivre le statut de vos factures, gérer les relances, et bien plus encore.
                            </Text>
                            <Flex direction={{ base: 'column', lg: 'row' }} gap='2rem' w='100%' justify="center">
                                {/* Plan Mensuel */}
                                {monthlyPrice && (
                                    <Box
                                        borderWidth="1px"
                                        borderRadius="lg"
                                        padding="1.5rem"
                                        backgroundColor={selectedPlan === 'monthly' ? 'white' : '#fdfdfd'}
                                        borderColor={selectedPlan === 'monthly' ? '#745FF2' : 'transparent'}
                                        onClick={() => setSelectedPlan('monthly')}
                                    >
                                        <VStack align="start" spacing="1rem">
                                            <HStack>
                                                <CheckCircleIcon color={selectedPlan === 'monthly' ? '#745FF2' : 'gray.400'} />
                                                <Heading color={selectedPlan === 'monthly' ? '#745FF2' : 'black'} size="md">Paiement mensuel</Heading>
                                            </HStack>
                                            <Heading fontSize="lg">{(monthlyPrice.unit_amount / 100).toLocaleString()} {invoiceData.devise} / Mois</Heading>
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
                                                backgroundColor={selectedPlan === 'monthly' ? '#745FF2' : 'black'}
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
                                        padding="1.5rem"
                                        backgroundColor={selectedPlan === 'yearly' ? 'white' : '#fdfdfd'}
                                        borderColor={selectedPlan === 'yearly' ? '#745FF2' : 'transparent'}
                                        onClick={() => setSelectedPlan('yearly')}
                                    >
                                        <VStack align="start" spacing="1rem">
                                            <HStack>
                                                <CheckCircleIcon color={selectedPlan === 'yearly' ? '#745FF2' : 'gray.400'} />
                                                <Heading color={selectedPlan === 'yearly' ? '#745FF2' : 'black'} size="md">Paiement annuel</Heading>
                                            </HStack>
                                            <Heading fontSize="lg">{(yearlyPrice.unit_amount / 100).toLocaleString()} {invoiceData.devise} / An</Heading>
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
                                                backgroundColor={selectedPlan === 'yearly' ? '#745FF2' : 'black'}
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

                            {/* Affichage des erreurs */}
                            {error && (
                                <Alert status="error" mt="2rem">
                                    <AlertIcon />
                                    {error}
                                </Alert>
                            )}
                        </Flex>
                    </div>
                </div>
            </div>

            {/* Modale de paiement */}
            <Modal isOpen={isOpen} onClose={() => {
                onClose();
                setClientSecret(''); // Reset client secret
                setIsCheckoutSessionCreated(false); // Reset session creation state
            }} size="6xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalCloseButton />
                    <ModalBody padding='2rem'>
                        <Flex direction={{ base: 'column', lg: 'row' }} gap="20px">
                            {/* Récapitulatif du prix sélectionné */}
                            <Box flex="1" padding="1rem" borderRight={{ lg: '1px solid #E2E8F0' }}>
                                <Heading size="md" mb='1rem'>Résumé de votre abonnement</Heading>
                                <Text><strong>Plan sélectionné:</strong> {selectedPlan === 'monthly' ? 'Mensuel' : 'Annuel'}</Text>
                                <Text><strong>Prix:</strong> {selectedPlan === 'monthly' ? (monthlyPrice.unit_amount / 100).toLocaleString() : (yearlyPrice.unit_amount / 100).toLocaleString()} {invoiceData.devise} {selectedPlan === 'monthly' ? '/ Mois' : '/ An'}</Text>
                                <Text mt='1rem'><strong>Description:</strong> {product.description}</Text>
                                <List spacing={2}>
                                    <Text mt='1rem'><strong>Vos avantages:</strong> </Text>
                                    {advantages.map((adv, index) => (
                                        <ListItem key={index}>
                                            <ListIcon as={CheckIcon} color='#745FF2' />
                                            {adv}
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>

                            {/* Informations de paiement */}
                            <Box flex="1" padding="1rem">
                                {clientSecret && (
                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                                        <SubscribeForm clientSecret={clientSecret} />
                                    </Elements>
                                )}
                            </Box>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Abo;
