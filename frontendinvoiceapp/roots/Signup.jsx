import React from 'react';
import SignupForm from '../src/components/SignUpForm'
import { Flex } from '@chakra-ui/react';

const Signup = () => {
    return  <Flex direction='column' alignItems='center' w='100%'> <SignupForm/>  </Flex>;
};

export default Signup;