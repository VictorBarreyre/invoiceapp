import React, { useState, useEffect } from 'react';
import { Flex, Box, Text, Heading, Table, Tbody, Tr, Td, Select } from '@chakra-ui/react';
import { useInvoiceData } from '../context/InvoiceDataContext';
import { useTheme } from '@chakra-ui/react';

const PaymentScheduleForm = ({ showSchedError, setShowErrorSched }) => {
  const {
    reminderFrequency,
    setReminderFrequency
  } = useInvoiceData();

  const theme = useTheme();
  const breakpointMd = parseInt(theme.breakpoints.md, 10);
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpointMd);

  const handleFrequencyChange = (e) => {
    const newValue = parseInt(e.target.value, 10); // Convertir en nombre
    setReminderFrequency(newValue);
    setShowErrorSched(false); // Assurez-vous que cette fonction est définie dans le parent
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpointMd);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpointMd]);

  return (
    <>
    
      {isMobile ? (
        <Box borderBottom="1px solid #f2f2f2" pt='1rem' pb='1rem' mb='1rem'>
          <Flex direction='column' justifyContent='space-between'>
          <Heading  mb='1rem' size="sm">Choisissez la fréquence de vos relances </Heading>

          {showSchedError && (
        <Text mb='1rem' color="red" fontSize={{ base: '13px', lg: '16px' }}>
          Veuillez sélectionner une fréquence de relance afin de passer à l'étape suivante
        </Text>
      )}
            <Select
              placeholder="Choisissez la fréquence de relance"
              value={reminderFrequency}
              onChange={handleFrequencyChange}
              _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
              _selected={{ borderColor: "#745FF2", boxShadow: "0 0 0 1px #745FF2" }}
            >
              <option value="1">Tous les jours</option>
              <option value="7">Toutes les semaines</option>
              <option value="15">Tous les 15 jours</option>
              <option value="30">Tous les 30 jours</option>
            </Select>
          </Flex>
        </Box>
      ) : (
        <Flex direction='column'>
        <Heading size="sm">Choisissez la fréquence de relance de vos emails</Heading>

        {showSchedError && (
        <Text color="red" fontSize={{ base: '13px', lg: '16px' }}>
          Veuillez sélectionner une fréquence de relance afin de passer à l'étape suivante
        </Text>
      )}
        <Table variant="simple" className='neue-up' mt='1rem' mb='1rem' borderWidth='1px' pt='1rem' pl='2rem' pr='2rem' pb='1rem' w='100%' borderRadius='10px'>
          
          <Tbody>
            <Tr>
              <Td pl='0'>
                <Select
                  placeholder="Choisissez la fréquence de relance"
                  value={reminderFrequency}
                  onChange={handleFrequencyChange}
                  _focus={{ borderColor: "#745FF2", boxShadow: "0 0 0 1px #745FF2" }}
                  _selected={{ borderColor: "#745FF2", boxShadow: "0 0 0 1px #745FF2" }}
                >
                  <option value="1">Tous les jours</option>
                  <option value="7">Toutes les semaines</option>
                  <option value="15">Tous les 15 jours</option>
                  <option value="30">Tous les 30 jours</option>
                </Select>
              </Td>
            </Tr>
          </Tbody>
        </Table>
        </Flex>
      )}
    </>
  );
};

export default PaymentScheduleForm;
