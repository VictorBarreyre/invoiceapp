import React, { useState, useEffect } from 'react';
import { Box, Button, Text, Link, Flex, Checkbox, VStack } from '@chakra-ui/react';
import Cookies from 'js-cookie';

const CookieWall = () => {
    const [showCookieWall, setShowCookieWall] = useState(false);
    const [consentPreferences, setConsentPreferences] = useState({
        functional: true,
        analytics: false,
        marketing: false,
    });

    useEffect(() => {
        // Vérifiez si le cookie "consent_preferences" existe, sinon affichez le cookie wall
        const consent = Cookies.get('consent_preferences');
        if (!consent) {
            setShowCookieWall(true);
        }
    }, []);

    const handleAccept = () => {
        // Enregistrer les préférences de consentement dans un cookie avec une expiration de 30 jours
        Cookies.set('consent_preferences', JSON.stringify(consentPreferences), { expires: 30 });
        setShowCookieWall(false);
    };

    const handleReject = () => {
        // Si l'utilisateur refuse les cookies, masquer le cookie wall et ne pas enregistrer de cookies
        setShowCookieWall(false);
    };

    const handleCheckboxChange = (type) => {
        setConsentPreferences((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    if (!showCookieWall) {
        return null; // Ne rien afficher si les préférences de consentement sont déjà présentes
    }

    return (
        <Box
            position="fixed"
            bottom="0"
            width="100%"
            bg="gray.800"
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
                <VStack align="start" spacing="4" mb={{ base: 4, md: 0 }}>
                    <Text fontSize="sm">
                        Nous utilisons des cookies pour améliorer votre expérience sur notre site. Vous pouvez accepter ou personnaliser vos préférences.
                        Consultez notre <Link href="/privacy-policy" color="teal.200" isExternal>politique de confidentialité</Link> pour plus d'informations.
                    </Text>
                    <Checkbox
                        isChecked={consentPreferences.functional}
                        isDisabled
                    >
                        Cookies fonctionnels (obligatoires)
                    </Checkbox>
                    <Checkbox
                        isChecked={consentPreferences.analytics}
                        onChange={() => handleCheckboxChange('analytics')}
                    >
                        Cookies analytiques
                    </Checkbox>
                    <Checkbox
                        isChecked={consentPreferences.marketing}
                        onChange={() => handleCheckboxChange('marketing')}
                    >
                        Cookies marketing
                    </Checkbox>
                </VStack>
                <Flex>
                    <Button
                        colorScheme="teal"
                        size="sm"
                        mr="2"
                        onClick={handleAccept}
                    >
                        Accepter
                    </Button>
                    <Button
                        colorScheme="red"
                        size="sm"
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
