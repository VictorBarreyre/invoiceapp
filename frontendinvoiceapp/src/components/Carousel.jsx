import React, { useState, useEffect } from 'react';
import { Flex, Box, Image, IconButton, HStack } from '@chakra-ui/react';
import { AiFillCaretRight, AiFillCaretLeft } from 'react-icons/ai';
import Fact from '../assets/fact.png';
import Rel from '../assets/rel.png';
import Send from '../assets/send.png';

const images = [Fact, Rel, Send];

const Carousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fonction pour passer à l'image suivante automatiquement
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // Change l'image toutes les 3 secondes
        return () => clearInterval(interval);
    }, []);

    // Fonction pour aller à une image précise
    const goToImage = (index) => {
        setCurrentIndex(index);
    };

    return (
        <Flex direction="column" alignItems="center" w="75rem" position="relative">
            {/* Les puces indicatrices */}
            <HStack spacing={2} mb={4}>
                {images.map((_, index) => (
                    <Box
                        key={index}
                        w={currentIndex === index ? '20px' : '10px'}
                        h="10px"
                        borderRadius="full"
                        bg={currentIndex === index ? 'gray.800' : 'gray.400'}
                        transition="width 0.3s ease"
                        cursor="pointer"
                        onClick={() => goToImage(index)}
                    />
                ))}
            </HStack>

            {/* Image du carrousel */}
            <Box w="100%" h="auto">
                <Image src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} borderRadius="lg" />
            </Box>
        </Flex>
    );
};

export default Carousel;