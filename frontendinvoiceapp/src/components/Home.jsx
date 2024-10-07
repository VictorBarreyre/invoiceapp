import React from 'react';
import {
    Flex, Heading, Text, Button
} from '@chakra-ui/react';


const Home = () => {

    return (
        <>
            <Flex
                direction="column"
                justifyContent="center"
                alignItems="center"
                height="100vh"  // Pour centrer verticalement
            >
                <Heading fontSize={{ base: '20px', lg: '26px' }} textAlign="center">
                    Powerful for developers. Fast for everyone.
                </Heading>
                <Text textAlign="center">Lorem ipsum</Text>
                <Button
                    w={{ base: 'unset', lg: 'fit-content' }}
                    color="white"
                    borderRadius="30px"
                    backgroundColor="black"
                    p="10px 20px"
                    mt="20px" // Espacement entre les boutons et le texte
                >
                    Créer ma facture
                </Button>
                <Button
                    w={{ base: 'unset', lg: 'fit-content' }}
                    color="white"
                    borderRadius="30px"
                    backgroundColor="black"
                    p="10px 20px"
                    mt="10px" // Espacement entre les deux boutons
                >
                    À propos
                </Button>
            </Flex>

        </>

    );

};

export default Home;