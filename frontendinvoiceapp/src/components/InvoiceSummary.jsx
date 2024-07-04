import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Heading,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    VStack,
    Button,
} from '@chakra-ui/react';
import { useInvoiceData } from '../context/InvoiceDataContext';
import { useTheme } from '@chakra-ui/react';

const InvoiceSummary = () => {
    const { invoiceData, payments, reminderFrequency } = useInvoiceData();
    const theme = useTheme();
    // Accéder au point de rupture 'md' à partir du thème
    const breakpointMd = parseInt(theme.breakpoints.md, 10);
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpointMd);
    const [reminderText, setReminderText] = useState('');

    const reminderFrequencyText = () => {
        const frequency = Number(reminderFrequency); // Convertir reminderFrequency en nombre
        if (frequency === 1) {
            return 'tous les jours';
        } else if (frequency === 7) {
            return 'toutes les semaines';
        } else if (frequency === 15) {
            return 'tous les 15 jours';
        } else if (frequency === 30) {
            return 'tous les mois';
        } else {
            return 'Fréquence inconnue';
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpointMd);
        };

        // Ajoute l'écouteur d'événement
        window.addEventListener('resize', handleResize);

        // Nettoie l'écouteur d'événement lors du démontage du composant
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpointMd]);

    useEffect(() => {
        setReminderText(reminderFrequencyText());
    }, [reminderFrequency]);

    // Styles directement inspirés du composant InvoicePDF adaptés pour Chakra UI
    const styleProps = {
        container: {
            borderRadius: "10px",
            backgroundColor: "white",
            borderColor: "#d9d9d9",
            marginBottom: '3vh',
        },
        heading: {
            marginRight: '1vh',
            marginTop: '2vh',
            fontSize: "24px",
            fontWeight: "bold",
            color: "black",
        },
        subHeading: {
            marginRight: '1vh',
            marginTop: '2vh',
            fontSize: "16px",
            fontWeight: "600",
        },
        subHeadingem: {
            marginTop: '2vh',
            fontSize: "16px",
            fontWeight: "600",
        },
        textFact: {
            fontSize: "18px",
        },
        text: {
            fontSize: "16px",
            color: "#4A5568",
        },
        table: {
            variant: "simple",
            colorScheme: "gray",
            size: "sm",
        },
        thead: {
            bg: "gray.100",
        },
        th: {
            fontFamily: 'SF Pro Display',
            textAlign: 'left',
            backgroundColor: '#f7f7f7',
            fontSize: "14px",
            textTransform: "uppercase",
        },
        thend: {
            fontFamily: 'SF Pro Display',
            textAlign: 'end',
            backgroundColor: '#f7f7f7',
            fontSize: "14px",
            textTransform: "uppercase",
        },
        td: {
            fontSize: "14px",
        },
        tdend: {
            fontSize: "14px",
            textAlign: 'end'
        },
        issuerAndClient: {
            flexDirection: isMobile ? 'column' : 'row',
            paddingTop: '0px',
            backgroundColor: '#fdfdfd',
            borderWidth: '1px',
            pl: "20px",
            pr: "20px",
            pb: "20px",
            borderRadius: "5px",
            marginY: "20px",
            width: '100%'
        },
        totalSection: {
            marginBottom: "20px",
        },
    };

    // Définir le titre en fonction du nombre d'articles
    const itemsTitle = invoiceData.items.length > 1 ? 'Articles / Services' : 'Article / Service';

    return (
        <>
            <Heading size='md'>Votre facture</Heading>
            <Box {...styleProps.container}>
                <VStack spacing={6} align="start">
                    <Flex justifyContent={isMobile ? "start" : "end"} width='100%' alignItems={isMobile ? "start" : "end"}>
                        <Flex pl={isMobile ? '20px' : '0px'} pt={isMobile ? '20px' : '0px'} alignItems={isMobile ? "start" : "end"} alignContent='end' direction='column'>
                            <Text {...styleProps.textFact}><strong>n°</strong> {invoiceData.number}</Text>
                            <Text {...styleProps.text}><strong>Date d'émission:</strong> {invoiceData.date}</Text>
                        </Flex>
                    </Flex>

                    <Flex {...styleProps.issuerAndClient} justifyContent="space-between">
                        <Flex flexDirection='column' borderBottom={isMobile ? "1px solid #e2e8f0" : "unset"} paddingBottom={isMobile ? "1rem" : "unset"} align="start">
                            <Text {...styleProps.subHeading}>Émise par</Text>
                            <Text {...styleProps.text}>{invoiceData.issuer.name}</Text>
                            <Text {...styleProps.text}> {invoiceData.issuer.adresse}</Text>
                            <Text {...styleProps.text}> {invoiceData.issuer.siret}</Text>
                            <Text {...styleProps.text}> {invoiceData.issuer.email}</Text>
                        </Flex>
                        <Flex flexDirection='column' alignItems={isMobile ? "start" : "end"}>
                            <Text {...styleProps.subHeadingem}>À destination de</Text>
                            <Text {...styleProps.text}>{invoiceData.client.name}</Text>
                            <Text {...styleProps.text}> {invoiceData.client.adresse}</Text>
                            <Text {...styleProps.text}> {invoiceData.client.siret}</Text>
                            <Text {...styleProps.text}> {invoiceData.client.email}</Text>
                        </Flex>
                    </Flex>

                    <Flex direction='column' width='100%' mb="1rem" borderWidth='1px' borderRadius='5px' backgroundColor='#fdfdfd'>
                        <Heading {...styleProps.subHeading} ml='2.5vh' mb='2vh' size="md">{itemsTitle}</Heading>
                        {isMobile ? (
                            <>
                                {/* En-têtes des colonnes à redéfinir car trop longues */}
                                <Flex justify="space-between" backgroundColor='#f7f7f7'>
                                    <Flex justify="space-between" w='100%' backgroundColor='#f7f7f7'>
                                        <Text
                                            fontFamily="heading"
                                            fontWeight="bold"
                                            textTransform="uppercase"
                                            letterSpacing="wider"
                                            textAlign="left"
                                            p={3}
                                            pl='1rem'
                                            lineHeight="4"
                                            fontSize="xs"
                                            backgroundColor='#f7f7f7'
                                            color="gray.600"
                                            borderBottom="1px"
                                            borderColor="gray.100"
                                            minW='38.333%'  // Three columns, so each gets about one-third
                                        >
                                            Description
                                        </Text>
                                        <Text
                                            fontFamily="heading"
                                            fontWeight="bold"
                                            textTransform="uppercase"
                                            letterSpacing="wider"
                                            textAlign="left"
                                            p={3}
                                            lineHeight="4"
                                            fontSize="xs"
                                            backgroundColor='#f7f7f7'
                                            color="gray.600"
                                            borderBottom="1px"
                                            borderColor="gray.100"
                                            minW='31.333%'
                                        >
                                            Prix/U
                                        </Text>
                                        <Text
                                            fontFamily="heading"
                                            fontWeight="bold"
                                            textTransform="uppercase"
                                            letterSpacing="wider"
                                            textAlign="left"
                                            p={3}
                                            lineHeight="4"
                                            fontSize="xs"
                                            backgroundColor='#f7f7f7'
                                            color="gray.600"
                                            borderBottom="1px"
                                            borderColor="gray.100"
                                            minW='31.333%'
                                        >
                                            Total HT
                                        </Text>
                                    </Flex>
                                </Flex>

                                {/* Détails des items */}
                                {invoiceData.items.map((item, index) => (
                                    <Flex key={index} justify="space-between" pb='1rem' pt='1rem' borderBottomWidth='1px'>
                                        <Text w='38.333%' pl='1rem' textAlign="left" >{item.description} x {item.quantity} </Text>
                                        <Text w='31.333%' pl='1rem' textAlign="left" >{item.unitPrice} {invoiceData.devise}</Text>
                                        <Text w='31.333%' pl='1rem' textAlign="left"  >{item.quantity * item.unitPrice} {invoiceData.devise}</Text>
                                    </Flex>
                                ))}
                            </>
                        ) : (
                            <>
                                <Table {...styleProps.table}>
                                    <Thead {...styleProps.thead}>
                                        <Tr>
                                            <Th {...styleProps.th}>Description</Th>
                                            <Th {...styleProps.th}>Quantité</Th>
                                            <Th {...styleProps.th}>Prix/U</Th>
                                            <Th {...styleProps.thend}>Total HT</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {invoiceData.items.map((item, index) => (
                                            <Tr key={index}>
                                                <Td {...styleProps.td}>{item.description}</Td>
                                                <Td {...styleProps.td}>{item.quantity}</Td>
                                                <Td {...styleProps.td}>{item.unitPrice} {invoiceData.devise}</Td>
                                                <Td {...styleProps.tdend}>{item.quantity * item.unitPrice} {invoiceData.devise}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </>
                        )}
                        <Flex pr='0.7rem' width='100%' alignItems='end' direction='column'  {...styleProps.totalSection}>
                            <Text {...styleProps.subHeading}>Sous-total HT : {invoiceData.subtotal} {invoiceData.devise}</Text>
                            <Text {...styleProps.subHeading}>
                                TVA : {invoiceData.vatRate} % ({invoiceData.vatAmount.toFixed(2)} {invoiceData.devise})
                            </Text>
                            <Text {...styleProps.heading}>Total TTC : {invoiceData.total} {invoiceData.devise}</Text>
                        </Flex>
                    </Flex>

                    <Flex flexWrap='wrap' justifyContent='space-between' width='100%'>
                        <Flex direction='column' width='fit-content' mb="1rem" borderRadius='5px' borderWidth='1px' pr='2.5rem' backgroundColor='#fdfdfd'>
                            <Heading {...styleProps.subHeading} ml='2.5vh' mb='2vh' size="md">Vos informations bancaires</Heading>
                            <Text color='#4A5568' pb='1rem' ml='2.5vh'> Votre IBAN : {invoiceData.issuer.iban}</Text>
                        </Flex>

                        <Flex direction='column' width='fit-content' mb="1rem" borderRadius='5px' borderWidth='1px' pr='2.5rem' backgroundColor='#fdfdfd'>
                            <Heading {...styleProps.subHeading} ml='2.5vh' mb='2vh' size="md">Votre fréquence de relance par mail</Heading>
                            <Text color='#4A5568' pb='1rem' ml='2.5vh'> Une email de rappel avec la facture sera renvoyé {reminderText}</Text>
                        </Flex>
                    </Flex>

                    <Text pb='0' color='#4A5568' w='97%' mt={isMobile ? "0rem" : "1rem"}>
                        Si toutes les informations sont correctes vous pouvez envoyer la facture, {invoiceData.client.name} recevra un email avec celle-ci en pièce jointe.
                    </Text>
                </VStack>
            </Box>
        </>
    );
};

export default InvoiceSummary;
