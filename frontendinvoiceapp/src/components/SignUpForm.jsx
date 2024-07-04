import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import { useInvoiceData } from '../context/InvoiceDataContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();
  const {  isValidEmail } = useInvoiceData();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePasswordVisibility = () => setShowPassword(!showPassword);
  const handleConfirmPasswordVisibility = () => setShowConfirmPassword(current => !current);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifiez si l'email est valide
    if (!isValidEmail(email)) {
      setErrorMessage("L'adresse e-mail n'est pas valide.");
      return; // Stop the submission if email is not valid
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      return; // Stop the submission if passwords do not match
    } else {
      setErrorMessage(''); // Clear error message
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/signup`, {
        email,
        password,
        name
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;

      if (response.status === 201) {
        localStorage.setItem('token', data.token);
        login({ email, name, id: data._id });
        navigate('/profil'); // Assurez-vous que la méthode login est récupérée avec useAuth()
        console.log('Inscription réussie et utilisateur connecté');
      } else {
        throw new Error(data.message || 'Impossible de créer le compte');
      }
    } catch (error) {
      setErrorMessage(error.message);
      toast({
        title: 'Erreur d\'inscription',
        description: error.message,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <Box className='tabs-container' p={{base: '2rem', md: '3rem'}} pt={{ base: '3rem'}} mt={{ base: '3rem', md: '7rem', lg: '7rem' }} mb={{ base: '0rem', md: '2rem', lg: '2rem' }} borderWidth="1px" w={{ base: '100%', md: '35rem', lg: '35rem' }} h={{ base: '100vh', md: 'inherit' }}>
      <Heading textAlign='center' mb='2rem' fontSize='26px'>Créez votre compte</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel htmlFor="lastName">Nom & Prénom</FormLabel>
            <Input _focus={{ borderColor: "#745FF2", boxShadow: "none" }} id="lastName" className='neue-down' type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input _focus={{ borderColor: "#745FF2", boxShadow: "none" }} id="email" className='neue-down' type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel htmlFor="password">Mot de passe</FormLabel>
            <InputGroup>
              <Input
                className='neue-down'
                _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <IconButton
                  background='none'
                  h="2rem"
                  size="lg"
                  onClick={handlePasswordVisibility}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
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
                _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                className='neue-down'
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
            {errorMessage && <ChakraText mt='1rem' color="red">{errorMessage}</ChakraText>}
          </FormControl>
          <Button type="submit" color='white' borderRadius='30px' backgroundColor='black' mt="4" colorScheme="gray">
            Créer mon compte
          </Button>
          <ChakraText mt={4}>
            Déjà inscrit ? <ChakraLink as={RouterLink} to="/signin" style={{ color: "#745FF2" }}>Connectez-vous</ChakraLink>
          </ChakraText>
        </VStack>
      </form>
    </Box>
  );
}

export default SignupForm;
