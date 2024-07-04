import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Flex, Heading, Text, Input, Button, FormControl } from '@chakra-ui/react';
import { useInvoiceData } from '../src/context/InvoiceDataContext';
import { Elements, PaymentElement, IbanElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51OwLFM00KPylCGutjKAkwhqleWEzuvici1dQUPCIvZHofEzLtGyM9Gdz5zEfvwSZKekKRgA1el5Ypnw7HLfYWOuB00ZdrKdygg');

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function PaymentForm({ clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();

  const ibanStyle = {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      '::placeholder': {
        color: '#aab7c4',
        fontSize: "16px",
      }
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a"
    },
    complete: {
      color: "#00e676"
    },

  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const result = await stripe.confirmSepaDebitPayment(clientSecret, {
      payment_method: {
        sepa_debit: elements.getElement(IbanElement),
        billing_details: {
          name: 'Jenny Rosen',
        },
      },
    });

    if (result.error) {
      console.log(result.error.message);
    } else {
      console.log(result.paymentIntent.status);
    }
  };

  return (
    <form className='form-iban' onSubmit={handleSubmit}>
      <div className='chakra-inpu' style={{
        padding: '1rem',
        width: '25vw',
        border: '1px solid rgba(191, 191, 197, 0.4) ',
        borderRadius: '5px',
        backgroundColor: '#fdfdfd',
        boxShadow: 'rgba(174, 174, 192, 0.4) -1.5px -1.5px 3px 0px, rgb(255, 255, 255) 1.5px 1.5px 3px 0px',
      }}>
        <IbanElement options={{
          style: {
            base: {
              color: '#fff',
              fontWeight: '500',
              fontFamily: 'SF Pro Display',
              fontSize: '16px',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            complete: {
              color: "#00e676"
            }
          },
          supportedCountries: ['SEPA']
        }} />
      </div>
      <button className='submitButton' type="submit" disabled={!stripe}>
        Envoyer le mandat de prélèvement SEPA
      </button>
    </form>

  );
}

function ConfirmationPage() {
  const [clientSecret, setClientSecret] = useState('');
  let query = useQuery();
  let factureId = query.get("facture");
  let montant = query.get("montant"); // Assurez-vous d'ajouter cette ligne si vous passez le montant comme paramètre

  const {
    invoiceData,
      } = useInvoiceData();
    

  useEffect(() => {
    // Votre code existant pour créer l'intention de paiement
    // Assurez-vous d'utiliser le montant correct ici
    const createPaymentIntent = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/paiement/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: montant * 100 }), // Assurez-vous que votre backend attend un montant en centimes
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    };

    createPaymentIntent();
  }, [montant]); // Ajoutez montant comme dépendance pour useEffect


  if (!clientSecret) {
    return <div>Chargement...</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <Flex direction='column' h='100vh' > 
      <Flex alignContent='center' alignItems="center" direction='column' mt="5rem" >
        <Flex className='neue-up' direction='column' alignContent='center' alignItems='center' gap='4px' borderRadius='1vw' backgroundColor='white' p='3rem' w='36vw'>
          <Heading size="lg" textAlign='center' mb="3">Signature et Paiement</Heading>
          <Text w='30vw' textAlign='center' p='2' mb="4">Afin de finaliser la signature de la facture n°{invoiceData.number} émise par {invoiceData.issuer.name}, nous avons besoin de votre IBAN. <br/> Votre paiement sera traité avec soin et en respectant les échéances convenues dans nos termes contractuels. <br/> Merci 
        !
</Text>
           <Heading textAlign='end' size='md'> Total à payer : {montant} {invoiceData.devise}</Heading>  
          <PaymentForm clientSecret={clientSecret} />
        </Flex>
      </Flex>
      <Flex alignItems='center' alignContent='center' justifyContent='center' direction='column'>
        <Text w='50vw' p='10' textAlign='center'> Veuillez noter que le paiement de cette facture constitue une acceptation des termes et conditions du contrat établi
          entre Jean Dupont et Victor Barreyre. Vous trouverez les détails concernant la procédure d'acceptation et de signature
          du contrat dans l'email accompagnant cette facture.</Text>
      </Flex>
      </Flex>
    </Elements>
  );
}

export default ConfirmationPage;