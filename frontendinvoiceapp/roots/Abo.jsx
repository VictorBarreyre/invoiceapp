import React, { useState, useEffect } from 'react';
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Heading,
    Flex,
    Text,
    Box,
    Spinner,
    List,
    ListItem,
    ListIcon,
    Link,
    Button
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
    const { invoiceData, baseUrl, createCheckoutSession, sendButtonClicked } = useInvoiceData();
    const [selectedPlan, setSelectedPlan] = useState('monthly');
    const [clientSecret, setClientSecret] = useState('');
    const [isCheckoutSessionCreated, setIsCheckoutSessionCreated] = useState(false); // Nouvel état

    useEffect(() => {
        const fetchProductsAndPrices = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/abonnement/products-and-prices`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const targetProduct = data.find(p => p.name === 'Premium'); // Replace 'Premium' with the product name you want to display
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
        if (isCheckoutSessionCreated) return; // Vérifie si la session de checkout a déjà été créée
        setIsCheckoutSessionCreated(true);
        try {
            const onSuccess = (clientSecret) => {
                setClientSecret(clientSecret);
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

    const titleAbo = () => {
        if (sendButtonClicked === 'sendInvoice') {
            return "Texte pour envoyer la facture";
        }
        return "Choisissez votre formule d'abonnement";
    };

    const stripeAppearance = {
        theme: 'flat',
        variables: {
            fontFamily: 'SF Pro Display, sans-serif',
        },
        rules: {
            '.Label': {
                'fontSize': 'SF Pro Display, sans-serif',
                'fontWeight': '600',
                'marginBottom': '0.5rem',
            },
            '.Input': {
                'backgroundColor': '#fdfdfd',
                'border': '1px solid #E2E8F0',
                'boxShadow': 'rgba(174, 174, 192, 0.4) -1.5px -1.5px 3px 0px, rgb(255, 255, 255) 1.5px 1.5px 3px 0px',
                'borderRadius': '4px',
                'padding': '10px',
            },
        },
    };

    return (
        <div className='flex-stepper'>
            <div className="stepper-container">
                <div className="tabs-container">
                    <Flex direction="column">
                        <Heading fontSize={{ base: '24px', lg: '26px' }} mb='1rem'>{titleAbo()}</Heading>
                        <Text color='#4A5568' w='100%' mb='3rem'>
                        Nous respectons votre choix de ne pas accepter les cookies. Pour une expérience optimale, 
                        découvrez notre formule premium. Vous pouvez également accepter les cookies pour accéder gratuitement à notre contenu. 
                        Après votre abonnement, vous recevrez un e-mail avec un récapitulatif et un mot de passe provisoire à modifier dans votre espace profil.
                        </Text>
                        <Flex direction={{ base: 'column-reverse', lg: 'unset' }} justifyContent='space-between' alignItems='start'>
                            <Flex direction='column' w={{ base: '100%', lg: '50%' }} gap='15px'>
                                <Heading size="sm">Vos informations</Heading>
                                {clientSecret ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                                        <SubscribeForm clientSecret={clientSecret} setClientSecret={setClientSecret} selectedPriceId={selectedPlan === 'monthly' ? monthlyPrice.id : yearlyPrice.id} />
                                    </Elements>
                                ) : (
                                    <p>Loading...</p>
                                )}
                            </Flex>
                            <Flex direction='column' w={{ base: '100%', lg: '45%' }} mb={{ base: '3rem', lg: 'unset' }} justify="center" gap='15px'>
                                <Heading size="sm">Votre abonnement premium</Heading>
                                <Accordion allowToggle>
                                    {monthlyPrice && (
                                        <AccordionItem
                                            w='100%'
                                            className='neue-up'
                                            borderWidth="1px"
                                            backgroundColor='#fdfdfd'
                                            borderColor={selectedPlan === 'yearly' ? 'inherit' : '#745FF2'}
                                            borderRadius="lg"
                                            overflow="hidden"
                                            pt='0.5rem'
                                            pb='0.5rem'
                                            pr='1rem'
                                            opacity={selectedPlan === 'yearly' ? 0.6 : 1}
                                            cursor="pointer"
                                        >
                                            <AccordionButton _hover={{ boxShadow: 'none' }} onClick={() => setSelectedPlan('monthly')}>
                                                <Flex alignItems='center' w='100%' gap='15px'>
                                                    <CheckCircleIcon color='white' backgroundColor={selectedPlan === 'yearly' ? 'white' : '#745FF2'} borderColor='#745FF2' borderRadius='100px' borderWidth='1px' />
                                                    <Box flex="1" textAlign="left">
                                                        <Heading color={selectedPlan === 'yearly' ? 'inherit' : '#745FF2'} fontSize="md" mb='0.5rem'>Paiement mensuel</Heading>
                                                        <Heading size="sm">
                                                            {monthlyPrice.unit_amount / 100} {invoiceData.devise} / Mois
                                                        </Heading>
                                                        <Text color='' fontSize="14px">
                                                            Premier mois gratuit
                                                        </Text>
                                                    </Box>
                                                    <AccordionIcon />
                                                </Flex>
                                            </AccordionButton>
                                            <AccordionPanel pb={4}>
                                                <List pt='1.5rem' borderTopWidth='1px' spacing={3}>
                                                    <ListItem>
                                                        <ListIcon as={CheckIcon} color='#745FF2' />
                                                        {product.description}
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListIcon as={CheckIcon} color='#745FF2' />
                                                        Assumenda, quia temporibus eveniet a libero incidunt suscipit
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListIcon as={CheckIcon} color='#745FF2' />
                                                        Quidem, ipsam illum quis sed voluptatum quae eum fugit earum
                                                    </ListItem>
                                                </List>
                                                <Button mt={4} colorScheme="teal" onClick={() => handleCheckoutSessionCreation(monthlyPrice.id)}>Choisir cette formule</Button>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    )}
                                </Accordion>

                                <Accordion allowToggle>
                                    {yearlyPrice && (
                                        <AccordionItem
                                            w='100%'
                                            className='neue-up'
                                            borderWidth="1px"
                                            backgroundColor='#fdfdfd'
                                            borderColor={selectedPlan === 'monthly' ? 'inherit' : '#745FF2'}
                                            borderRadius="lg"
                                            overflow="hidden"
                                            pt='0.5rem'
                                            pb='0.5rem'
                                            pr='1rem'
                                            opacity={selectedPlan === 'monthly' ? 0.6 : 1}
                                            cursor="pointer"
                                        >
                                            <AccordionButton _hover={{ boxShadow: 'none' }} onClick={() => setSelectedPlan('yearly')}>
                                                <Flex alignItems='center' w='100%' gap='20px'>
                                                    <CheckCircleIcon color='white' backgroundColor={selectedPlan === 'monthly' ? 'white' : '#745FF2'} borderColor='#745FF2' borderRadius='100px' borderWidth='1px' />
                                                    <Box flex="1" textAlign="left">
                                                        <Heading color={selectedPlan === 'monthly' ? 'inherit' : '#745FF2'} fontSize="md" mb='0.5rem'>Paiement annuel</Heading>
                                                        <Heading size="sm">
                                                            {yearlyPrice.unit_amount / 100} {invoiceData.devise} / An
                                                        </Heading>
                                                        <Text fontSize="14px">
                                                            Deux mois gratuits
                                                        </Text>
                                                    </Box>
                                                    <AccordionIcon />
                                                </Flex>
                                            </AccordionButton>
                                            <AccordionPanel pb={4}>
                                                <List pt='1.5rem' borderTopWidth='1px' spacing={3}>
                                                    <ListItem>
                                                        <ListIcon as={CheckIcon} color='#745FF2' />
                                                        {product.description}
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListIcon as={CheckIcon} color='#745FF2' />
                                                        Assumenda, quia temporibus eveniet a libero incidunt suscipit
                                                    </ListItem>
                                                    <ListItem>
                                                        <ListIcon as={CheckIcon} color='#745FF2' />
                                                        Quidem, ipsam illum quis sed voluptatum quae eum fugit earum
                                                    </ListItem>
                                                </List>
                                                <Button mt={4} colorScheme="teal" onClick={() => handleCheckoutSessionCreation(yearlyPrice.id)}>Choisir cette formule</Button>
                                            </AccordionPanel>
                                        </AccordionItem>
                                    )}
                                </Accordion>
                                <Text color='#4A5568' fontSize="14px"> En continuant, vous acceptez <Link color='#745FF2'> nos termes et conditions.</Link></Text>
                            </Flex>
                        </Flex>
                    </Flex>
                </div>
            </div>
        </div>
    );
};

export default Abo;
