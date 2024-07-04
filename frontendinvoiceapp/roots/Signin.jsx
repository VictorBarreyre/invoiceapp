import React from 'react';
import SigninForm from '../src/components/SigninForm'
import { Flex } from '@chakra-ui/react';

const Signin = () => {
  return <Flex direction='column' alignItems='center' w='100%'><SigninForm/></Flex>;
};

export default Signin;