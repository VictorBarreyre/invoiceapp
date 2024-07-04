import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Button,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  IconButton,
  Input,
  VStack,
  useToast,
  Box,
  Flex,
  Heading,
  Text as ChakraText,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useInvoiceData } from '../src/context/InvoiceDataContext';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const handleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/reset-password`, {
        token,
        newPassword
      });

      toast({
        title: 'Mot de passe réinitialisé',
        description: response.data.message,
        status: 'success',
        duration: 9000,
        isClosable: true,
      });

      navigate('/signin');
    } catch (error) {
      setErrorMessage(error.response?.data.message || 'Erreur lors de la réinitialisation du mot de passe');
      toast({
        title: 'Erreur',
        description: error.response?.data.message || 'Erreur lors de la réinitialisation du mot de passe',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex direction='column' alignItems='center' w='100%'> 
    <Box className='tabs-container' p={{base: '2rem', md: '3rem'}} pt={{ base: '3rem', md: '3rem' }} mt={{ base: '3rem', md: '7rem', lg: '7rem' }} mb={{ base: '0rem', md: '2rem', lg: '2rem' }} borderWidth="1px" w={{ base: '100%', md: '35rem', lg: '35rem' }} h={{ base: '100vh', md: 'inherit' }}>
      <Heading textAlign='center' mb='2rem' fontSize='26px'>Réinitialisez votre mot de passe</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="newPassword">Nouveau mot de passe</FormLabel>
            <InputGroup>
              <Input
                className='neue-down'
                _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <IconButton
                  background='none'
                  h="2rem"
                  size="lg"
                  onClick={handleNewPasswordVisibility}
                  icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                  sx={{
                    _hover: { background: 'none', boxShadow: 'none', transform: 'none' },
                    _active: { background: 'none', boxShadow: 'none', transform: 'none' },
                    _focus: { boxShadow: 'none' } // Annule l'effet de focus aussi
                  }}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor="confirmPassword">Confirmez le mot de passe</FormLabel>
            <InputGroup>
              <Input
                className='neue-down'
                _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <IconButton
                  background='none'
                  h="2rem"
                  size="lg"
                  onClick={handleConfirmPasswordVisibility}
                  icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                  sx={{
                    _hover: { background: 'none', boxShadow: 'none', transform: 'none' },
                    _active: { background: 'none', boxShadow: 'none', transform: 'none' },
                    _focus: { boxShadow: 'none' } // Annule l'effet de focus aussi
                  }}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          {errorMessage && <ChakraText mt='1rem' textAlign='center' color="red">{errorMessage}</ChakraText>}
          <Button type="submit" color='white' borderRadius='30px' backgroundColor='black' mt="4" colorScheme="gray" isLoading={isSubmitting}>
            Réinitialiser le mot de passe
          </Button>
          <ChakraText mt={4}>
            Retourner à la <ChakraLink as={RouterLink} to="/signin" style={{ color: "#745FF2" }}>page de connexion</ChakraLink>
          </ChakraText>
        </VStack>
      </form>
    </Box>
    </Flex>
  );
}

export default ResetPasswordForm;
