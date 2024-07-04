import React, { useEffect, useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import {
  Button, Link as Chakralink, Box, Heading, Text, Flex, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Image, useDisclosure,
  Table, Thead, Tbody, Tr, Th, Td, TableContainer, useMediaQuery, IconButton
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';

const Factures = () => {
  const { fetchUserInvoices, user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [message, setMessage] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInvoiceImage, setSelectedInvoiceImage] = useState('');
  const [isMobile] = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const loadInvoices = async () => {
      if (user) {
        const { invoices, message } = await fetchUserInvoices();
        setInvoices(invoices);
        setMessage(message);
        console.log(invoices);
      }
    };

    loadInvoices();
  }, [fetchUserInvoices, user]);

  const handlePreviewClick = (urlImage) => {
    setSelectedInvoiceImage(urlImage);
    onOpen();
  };

  const handleDeleteInvoice = async (invoiceId) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/delete-invoices`, { invoiceId }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      if (response.status === 200) {
        setInvoices(prevInvoices => prevInvoices.filter(invoice => invoice._id !== invoiceId));
        console.log('Invoice deleted:', invoiceId);
      } else {
        console.error('Failed to delete invoice:', response.data);
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };
  

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/mark-invoice-paid`, { invoiceId }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setInvoices(prevInvoices => prevInvoices.map(invoice => {
        if (invoice._id === invoiceId) {
          return { ...invoice, status: 'paid' };
        }
        return invoice;
      }));
      console.log('Invoice marked as paid:', invoiceId);
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const handleMarkAsUnpaid = async (invoiceId) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/mark-invoice-unpaid`, { invoiceId }, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });
      setInvoices(prevInvoices => prevInvoices.map(invoice => {
        if (invoice._id === invoiceId) {
          return { ...invoice, status: 'en attente' };
        }
        return invoice;
      }));
      console.log('Invoice marked as unpaid:', invoiceId);
    } catch (error) {
      console.error('Error marking invoice as unpaid:', error);
    }
  };

  return (
    <div className='flex-stepper'>
      <div className="stepper-container">
        <div className="tabs-container">
          <Flex direction='column' h={{ base: 'content', lg: 'content' }}>
            <Heading pb='1rem' mb={{ base: '0rem', lg: '2rem' }} borderBottom={{ base: 'unset', lg: '2px solid #efefef' }} fontSize={{ base: '22px', lg: '26px' }}>Vos factures</Heading>
            {message && <Text>{message}</Text>}

            {isMobile ? (
              <>
                {invoices.slice().reverse().map(invoice => (
                  <Box key={invoice._id} borderBottom="1px solid #efefef" pt='1rem' pb='1rem' mb='1rem'>
                    <Flex justifyContent="space-between">
                      <Text>Facture n°{invoice.number}</Text>
                      <Text>{invoice.montant}{invoice.devise}</Text>
                      <IconButton
                        aria-label="Supprimer la facture"
                        icon={<DeleteIcon />}
                        size="sm"
                        backgroundColor="transparent"
                        onClick={() => handleDeleteInvoice(invoice._id)}
                      />
                    </Flex>
                    <Flex justifyContent="space-between">
                      <Chakralink color="#745FF2" onClick={() => handlePreviewClick(invoice.urlImage)}>
                        Voir la facture
                      </Chakralink>
                      {invoice.status === 'paid' ? (
                        <Chakralink color="#745FF2" onClick={() => handleMarkAsUnpaid(invoice._id)}>
                          Marquer comme non traitée
                        </Chakralink>
                      ) : (
                        <Chakralink color="#745FF2" onClick={() => handleMarkAsPaid(invoice._id)}>
                          Marquer comme traitée
                        </Chakralink>
                      )}
                    </Flex>
                  </Box>
                ))}
              </>
            ) : (
              <TableContainer>
                <Table variant='simple'>
                  <Thead>
                    <Tr>
                      <Th>Numéro de Facture</Th>
                      <Th>Montant</Th>
                      <Th pr='0rem' textAlign='end'>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {invoices.slice().reverse().map(invoice => (
                      <Tr key={invoice._id}>
                        <Td>Facture n°{invoice.number}</Td>
                        <Td>{invoice.montant}{invoice.devise}</Td>
                        <Td pr='0rem' textAlign='end'>
                          <Flex justifyContent="space-between">
                            <Chakralink color="#745FF2" onClick={() => handlePreviewClick(invoice.urlImage)}>
                              Voir la facture
                            </Chakralink>
                            {invoice.status === 'paid' ? (
                              <Chakralink color="#745FF2" onClick={() => handleMarkAsUnpaid(invoice._id)}>
                                Marquer comme non traitée
                              </Chakralink>
                            ) : (
                              <Chakralink color="#745FF2" onClick={() => handleMarkAsPaid(invoice._id)}>
                                Marquer comme traitée
                              </Chakralink>
                            )}
                            <IconButton
                              aria-label="Supprimer la facture"
                              icon={<DeleteIcon />}
                              size="sm"
                              backgroundColor="transparent"
                              onClick={() => handleDeleteInvoice(invoice._id)}
                            />
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Flex>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Prévisualisation de la facture</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedInvoiceImage && <Image src={selectedInvoiceImage} alt="Invoice preview" />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Factures;
