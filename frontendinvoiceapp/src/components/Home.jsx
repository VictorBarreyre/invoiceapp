import React from 'react';
import {
    Flex, Heading, Text, Button
} from '@chakra-ui/react';


const Home = () => {

    return (
        <>
            <Flex direction='column' justifyContent='center' >
                <Heading fontSize={{ base: '20px', lg: '26px' }}>Powerful for developers. Fast for everyone.</Heading>
                <Text> Lorem ipsum</Text>
                <Button w={{ base: 'unset', lg: 'fit-content' }} color='white' borderRadius='30px' backgroundColor='black' p='10px 20px 10px 20px'> Créer ma facture</Button>
                <Button w={{ base: 'unset', lg: 'fit-content' }} color='white' borderRadius='30px' backgroundColor='black' p='10px 20px 10px 20px'> À propos</Button>
            </Flex>
        </>

    );

};

export default Home;