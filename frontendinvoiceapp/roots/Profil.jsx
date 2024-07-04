import React, { useEffect, useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import {
  Box,
  Flex,
  FormControl,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Text,
  Button,
  FormLabel,
  Input as ChakraInput,
  Link as Chakralink,
  Text as ChakraText,
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
import { Link, useNavigate } from 'react-router-dom';

const Profil = () => {
  const { user, updateUserProfile } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState({
    _id: user ? user._id : '',
    email: user ? user.email : '',
    name: user ? user.name : '',
    adresse: user ? user.adresse : '',
    siret: user ? user.siret : '',
    iban: user ? user.iban : ''
  });
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (user) {
      setUserData({
        _id: user ? user._id : '',
        email: user.email || '',
        name: user.name || '',
        adresse: user.adresse || '',
        siret: user.siret || '',
        iban: user.iban || ''
      });
    }
  }, [user]);

  const handleChange = (e, field) => {
    setUserData({ ...userData, [field]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleUpdateClick = async () => {
    try {
      await updateUserProfile(userData);
      setSuccess('Les informations ont été mises à jour avec succès.');
      setError('');
    } catch (error) {
      setError('Une erreur est survenue lors de la mise à jour du profil.');
      setSuccess('');
    }
    console.log(userData);
  };

  if (!user) {
    return <div>Veuillez vous connecter pour voir le profil.</div>;
  }

  return (
    <div className='flex-stepper'>
      <div className="stepper-container">
        <div className="tabs-container">
          <Flex direction='column' >
            <Heading pb='1rem' mb={{ base: '0rem', lg: '2rem' }} borderBottom={{ base: 'unset', lg: '2px solid #efefef' }} fontSize={{ base: '22px', lg: '26px' }}>Vos informations</Heading>
            {success && (
              <ChakraText mb='0.5rem' textAlign='left' color="green">{success}</ChakraText>
            )}
            {error && (
              <ChakraText mb='0.5rem' textAlign='left' color="red">{error}</ChakraText>
            )}
            <Flex direction='column' h={{ base: 'content', lg: 'content' }}  mb='1rem'>
              {Object.entries(userData).map(([field, value]) => {
                if (field !== 'password' && field !== 'token' && field !== '_id') {
                  return (
                    <FormControl borderBottom='1px solid #efefef' pb='1rem' width={{ base: 'unset', lg: '25rem' }} mt='4'  isRequired key={field}>
                      <Heading mb='1rem' size="sm">{field.charAt(0).toUpperCase() + field.slice(1)}</Heading>
                      <InputGroup display='flex' alignContent='center' alignItems='center' >
                        <Input
                          mb='2'
                          className='neue-down'
                          color='grey'
                          _focus={{ color: '#745FF2', borderColor: "#745FF2", boxShadow: "0 0 0 1px #745FF2" }}
                          id={field}
                          type="text"
                          value={value || ''}
                          onChange={(e) => handleChange(e, field)}
                          onFocus={() => handleFocus(field)}
                          onBlur={handleBlur}
                          placeholder={`Entrez votre ${field}`}
                        />
                        <InputRightElement width="4.5rem">
                          <IconButton
                            color={focusedField === field ? '#745FF2' : '#718096'}
                            aria-label={`Edit ${field}`}
                            icon={<EditIcon />}
                            background='none'
                            h="2rem"
                            size="lg"
                            sx={{
                              _hover: { background: 'none', boxShadow: 'none', transform: 'none' },
                              _active: { background: 'none', boxShadow: 'none', transform: 'none' },
                              _focus: { color: '#745FF2', boxShadow: 'none' }
                            }}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                  );
                }
                return null;
              })}
            </Flex>
           
            <Button onClick={handleUpdateClick} w={{ base: '100%', lg: '20rem' }} color='white' borderRadius='30px' pt='12px' pb='12px' pl='24px' pr='24px' backgroundColor='black' mt="4" colorScheme="gray" >
              Mettre les informations à jour
            </Button>
          </Flex>
        </div>
      </div>
    </div>
  );
};

export default Profil;
