import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Flex, Box, useMediaQuery } from '@chakra-ui/react';
import './App.css';
import About from '../roots/About';
import Signin from '../roots/Signin';
import Signup from '../roots/Signup';
import Header from './components/Header';
import Stepper from './components/Stepper';
import { ChakraProvider } from '@chakra-ui/react';
import { InvoiceDataProvider } from './context/InvoiceDataContext';
import theme from '../theme';
import { useAuth } from '../src/context/AuthContext';
import Sidebar from './components/Sidebar';
import Profil from '../roots/Profil';
import Factures from '../roots/Factures';
import Paiements from '../roots/Paiements';
import Paramètres from '../roots/Paramètres';
import Abo from '../roots/Abo';
import Success from '../roots/Succes';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentSuccess from '../roots/PaymentSucces';
import Footer from './components/Footer';
import CGU from '../roots/CGU';
import MentionsLegales from '../roots/MentionsLégales';
import PolitiqueConfidentialite from '../roots/PolConf';
import ResetPasswordForm from '../roots/ResetPasswordForm';
import PrivateRoute from '../roots/PrivateRoute';
import Home from './components/Home';

const stripePromise = loadStripe('pk_test_51OwLFM00KPylCGutjKAkwhqleWEzuvici1dQUPCIvZHofEzLtGyM9Gdz5zEfvwSZKekKRgA1el5Ypnw7HLfYWOuB00ZdrKdygg');

function App() {
  const { user, setUser, logout } = useAuth();
  const [isMobile] = useMediaQuery("(max-width: 1060px)");

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser]);

  return (
    <Elements stripe={stripePromise}> 
      <ChakraProvider theme={theme}>
        <InvoiceDataProvider>
          <Router>
            <Flex direction="column" minHeight="100vh" position="relative">
              <Header />
              <Flex flex="1" overflow="hidden" pb='5rem'>
                {user && !isMobile && <Sidebar />}
                <Box flex="1" overflowY="auto" pb='5rem'>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/creer-facture-en-ligne" element={<Stepper />} />
                    <Route path="/signin" element={!user ? <Signin /> : <Navigate to="/" />} />
                    <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
                    <Route path="/reset-password" element={<ResetPasswordForm />} />
                    <Route path="/profil" element={<PrivateRoute><Profil /></PrivateRoute>} />
                    <Route path="/factures" element={<PrivateRoute><Factures /></PrivateRoute>} />
                    <Route path="/paiements" element={<PrivateRoute><Paiements /></PrivateRoute>} />
                    <Route path="/parametres" element={<PrivateRoute><Paramètres /></PrivateRoute>} />
                    <Route path="/payment-success" element={<PrivateRoute><PaymentSuccess /></PrivateRoute>} />
                    <Route path="/abonnement" element={<PrivateRoute><Abo /></PrivateRoute>} />
                    <Route path="/success" element={<Success/>}/>
                    <Route path="/conditions-generales" element={<CGU />} />
                    <Route path="/mentions-legales" element={<MentionsLegales />} />
                    <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Box>
              </Flex>
              <Footer />
              {/* Background with soft and harmonious gradients */}
              <Box
                position="absolute"
                top="-200px"
                left="-150px"
                width="700px"
                height="700px"
                borderRadius="50%"
                opacity="0.2"
                background="radial-gradient(circle, #745FF2, #6B4EFF, transparent)"
                filter="blur(200px)"
                zIndex="-2"
              />
              <Box
                position="absolute"
                bottom="-100px"
                right="-150px"
                width="500px"
                height="500px"
                borderRadius="50%"
                opacity="0.15"
                background="radial-gradient(circle, #6B4EFF, #745FF2, transparent)"
                filter="blur(180px)"
                zIndex="-2"
              />
            </Flex>
          </Router>
        </InvoiceDataProvider>
      </ChakraProvider>
    </Elements>
  );
}

export default App;