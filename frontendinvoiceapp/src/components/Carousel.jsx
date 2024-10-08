import React, { useState, useEffect } from 'react';
import { Flex, Box, Image, IconButton, HStack } from '@chakra-ui/react';
import { AiFillCaretRight, AiFillCaretLeft } from 'react-icons/ai';
import Fact from '../assets/fact.png';
import Rel from '../assets/rel.png';
import Send from '../assets/send.png';
import MobFact from '../assets/mob-fact.png';
import MobRel from '../assets/mob-rel.png';
import MobSend from '../assets/mob-send.png';

const desktopImages = [Fact, Rel, Send];
const mobileImages = [MobFact, MobRel, MobSend];

const Carousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Fonction pour mettre à jour l'état en fonction de la taille de l'écran
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const images = isMobile ? mobileImages : desktopImages;

    // Fonction pour passer à l'image suivante automatiquement
    useEffect(() => {
        if (images.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, 3000); // Change l'image toutes les 3 secondes
            return () => clearInterval(interval);
        }
    }, [images]);

    // Fonction pour aller à une image précise
    const goToImage = (index) => {
        setCurrentIndex(index);
    };

    return (
        <Flex direction="column" alignItems="center" w={{ base: '100%', md: '75rem' }} position="relative">
            {/* Les puces indicatrices */}
            <HStack spacing={2} mb={4}>
                {images.map((_, index) => (
                    <Box
                        key={index}
                        w={currentIndex === index ? '20px' : '10px'}
                        h="10px"
                        borderRadius="full"
                        bg={currentIndex === index ? '#745ff2' : '#edf2f7'}
                        transition="width 0.3s ease"
                        cursor="pointer"
                        onClick={() => goToImage(index)}
                    />
                ))}
            </HStack>

            {/* Image du carrousel */}
            <Box  w="90vw" h="auto">
                <Image src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} borderRadius="lg" />
            </Box>
        </Flex>
    );
};

export default Carousel;