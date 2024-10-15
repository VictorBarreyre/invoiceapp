import React, { useState, useEffect } from 'react';
import { Box, Button, Text, Link, Flex } from '@chakra-ui/react';
import Cookies from 'js-cookie';

const CookieWall = () => {
    const [showCookieWall, setShowCookieWall] = useState(false);

    useEffect(() => {
        // Vérifiez si le cookie "consent_preferences" existe, sinon affichez le cookie wall
        const consent = Cookies.get('consent_preferences');
        if (!consent) {
            setShowCookieWall(true);
        }
    }, []);

    const handleAccept = () => {
        // Accepter tous les cookies et enregistrer dans un cookie avec une expiration de 30 jours
        Cookies.set('consent_preferences', JSON.stringify({ accepted: true }), { expires: 30 });
        setShowCookieWall(false);
    };

    const handleReject = () => {
        // Refuser les cookies et masquer le cookie wall
        Cookies.set('consent_preferences', JSON.stringify({ accepted: false }), { expires: 30 });
        setShowCookieWall(false);
    };

    if (!showCookieWall) {
        return null; // Ne rien afficher si les préférences de consentement sont déjà présentes
    }

    return (
        <Box
            position="fixed"
            bottom="0"
            width="100%"
            bg="black"
            color="white"
            p="4"
            zIndex="1000"
        >
            <Flex
                direction={{ base: 'column', md: 'row' }}
                align="center"
                justify="space-between"
                maxW="1200px"
                mx="auto"
            >
                <Text fontSize="sm">
                    Nous utilisons des cookies pour améliorer votre expérience sur notre site. Vous pouvez accepter ou refuser l’utilisation de tous les cookies.
                    Consultez notre <Link href="/privacy-policy" color="teal.200" isExternal>politique de confidentialité</Link> pour plus d'informations.
                </Text>
                <Flex>
                    <Button
                        w={{ base: 'unset', lg: 'fit-content' }} color='white' borderRadius='30px' backgroundColor='black' p='10px 20px 10px 20px'
                        onClick={handleAccept}
                    >
                        Accepter
                    </Button>
                    <Button
                        w={{ base: 'unset', lg: 'fit-content' }} color='white' borderRadius='30px' backgroundColor='red' p='10px 20px 10px 20px'
                        onClick={handleReject}
                    >
                        Refuser
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
};

export default CookieWall;
