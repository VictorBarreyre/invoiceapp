import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Box,
  Heading,
  Link as ChakraLink,
  Text as ChakraText,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePasswordVisibility = () => setShowPassword(!showPassword);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/send-reset-email`, { email });
      toast({
        title: 'Email de réinitialisation envoyé',
        description: response.data.message,
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
      setIsForgotPassword(false);
    } catch (error) {
      setErrorMessage(error.response?.data.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation');
      toast({
        title: 'Erreur',
        description: error.response?.data.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/signin`, { email, password });
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Utilisateur inconnu ou mot de passe incorrect');
      }
      const data = response.data;
      const userData = { _id: data._id, email, token: data.token, name: data.name, adresse: data.adresse, siret: data.siret, iban: data.iban };
      login(userData); // Mettez à jour l'état global de l'utilisateur dans votre contexte
      navigate('/profil'); // Redirigez vers /profil après connexion réussie
    } catch (error) {
      const errorMsg = error.response?.status === 401 ? 'Utilisateur inconnu ou mot de passe incorrect' : 'Erreur interne du serveur';
      setErrorMessage(errorMsg);
      toast({
        title: 'Erreur de connexion',
        description: errorMsg,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className='tabs-container' p={{ base: '2rem', md: '3rem' }} pt={{ base: '3rem', md: '3rem' }} mt={{ base: '3rem', md: '7rem', lg: '7rem' }} mb={{ base: '0rem', md: '2rem', lg: '2rem' }} borderWidth="1px" w={{ base: '100%', md: '35rem', lg: '35rem' }} h={{ base: '100vh', md: 'inherit' }}>
      <Heading textAlign='center' mb='2rem' fontSize='26px'>Connectez-vous à votre compte</Heading>
      <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input _focus={{ borderColor: "#745FF2", boxShadow: "none" }} id="email" className='neue-down' type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          {!isForgotPassword && (
            <FormControl isRequired>
              <FormLabel htmlFor="password">Mot de passe</FormLabel>
              <InputGroup>
                <Input className='neue-down' _focus={{ borderColor: "#745FF2", boxShadow: "none" }} id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
                <InputRightElement width="4.5rem">
                  <IconButton background='none' h="2rem" size="lg" onClick={handlePasswordVisibility} icon={showPassword ? <ViewOffIcon /> : <ViewIcon />} sx={{ _hover: { background: 'none', boxShadow: 'none', transform: 'none' }, _active: { background: 'none', boxShadow: 'none', transform: 'none' }, _focus: { boxShadow: 'none' } }} />
                </InputRightElement>
              </InputGroup>
              <ChakraText mt={4} textAlign='center'>
                <ChakraLink as={RouterLink} to="#" onClick={() => setIsForgotPassword(true)} style={{ color: "#745FF2" }}>Mot de passe oublié ?</ChakraLink>
              </ChakraText>
            </FormControl>
          )}
          {errorMessage && <ChakraText mt='1rem' textAlign='center' color="red">{errorMessage}</ChakraText>}
          <Button type="submit" color='white' borderRadius='30px' backgroundColor='black' mt="4" colorScheme="gray" isLoading={isSubmitting}>{isForgotPassword ? 'Envoyer le lien de réinitialisation' : 'Se connecter'}</Button>
          {!isForgotPassword && (
            <ChakraText mt={4}>
              Pas encore inscrit ? <ChakraLink as={RouterLink} to="/signup" style={{ color: "#745FF2" }}>Créez un compte</ChakraLink>
            </ChakraText>
          )}
        </VStack>
      </form>
    </Box>
  );
}

export default SignInForm;
