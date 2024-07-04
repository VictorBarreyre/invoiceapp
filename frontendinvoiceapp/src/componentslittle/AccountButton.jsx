import React from 'react';
import { Button, Icon, Link } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';

function AccountButton() {
    const { user } = useAuth();
    const buttonSize = "sm"; // Taille du bouton, ajustez selon vos besoins

    return user ? (

        <Button
            as={RouterLink}
            h='auto'
            pt='12px' pb='12px' pl='24px' pr='24px'
            to="/"
            size={buttonSize}
            backgroundColor='black'
            color='white'
            borderRadius='30px'
            sx={{
                '&:hover': {
                    boxShadow: 'rgba(174, 174, 192, 0.4) -1.5px -1.5px 3px 0px, rgba(255, 255, 255) 1.5px 1.5px 3px 0px',
                    color: '#745FF2',
                    backgroundColor: 'white !important'
                }
            }}
        >
            Créez votre facture
        </Button>

    ) : (
        <Button
            pt='0.7rem' pb='0.7rem' pl='1.2rem' pr='1.2rem' 
            h='auto'
            as={RouterLink}
            to="/signin"
            size={buttonSize}
            backgroundColor='black'
            color='white'
            borderRadius='30px'
            sx={{
                '&:hover': {
                    boxShadow: 'rgba(174, 174, 192, 0.4) -1.5px -1.5px 3px 0px, rgba(255, 255, 255) 1.5px 1.5px 3px 0px',
                    color: '#745FF2',
                    backgroundColor: 'white !important'
                }
            }}
        >
            Connexion
        </Button>
    );
}

export default AccountButton;