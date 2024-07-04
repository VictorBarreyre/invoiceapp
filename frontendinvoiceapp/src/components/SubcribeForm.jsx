import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Box, Input, Flex, Alert, AlertIcon } from '@chakra-ui/react';
import { useInvoiceData } from '../context/InvoiceDataContext';

const SubscribeForm = ({ clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { invoiceData } = useInvoiceData();
  const [email, setEmail] = useState(invoiceData.issuer.email);
  const [name, setName] = useState(invoiceData.issuer.name);
  const [address, setAddress] = useState(invoiceData.issuer.adresse);
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error('Stripe.js has not yet loaded.');
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      console.error(submitError.message);
      setError(submitError.message);
      return;
    }

    if (error) return;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/success` },
      clientSecret,
    });

    if (result.error) {
      console.error(result.error.message);
      setError(result.error.message);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        console.log('PaymentIntent succeeded');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      <Input
        className='neue-down'
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        mb='1rem'
      />
      <Input
        className='neue-down'
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom et prénom"
        required
        mb='1rem'
      />
      <Input
        className='neue-down'
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Adresse"
        required
        mb='1rem'
      />
      <Flex gap='10px'>
        <Input
          className='neue-down'
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Pays"
          required
          mb='2rem'
        />
        <Input
          className='neue-down'
          type="text"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          placeholder="Code Postal"
          required
          mb='2rem'
        />
      </Flex>
      <Box mb={4}>
        <PaymentElement />
      </Box>
      <Button
        type="submit"
        mt='2rem'
        mb='2rem'
        w={{ base: '100%', lg: 'unset' }}
        color='white'
        borderRadius='30px'
        backgroundColor='black'
        disabled={!stripe || !clientSecret}
      >
        Profiter de l'offre
      </Button>
    </form>
  );
};

export default SubscribeForm;
