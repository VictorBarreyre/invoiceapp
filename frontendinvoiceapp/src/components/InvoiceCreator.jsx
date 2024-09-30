import React, { useState, useEffect, useRef } from 'react';
import { pdf, PDFViewer } from '@react-pdf/renderer';
import {
  Stack,
  Table, Thead, Tbody, Tfoot, Tr, Th, Td, Box, Input, InputGroup, InputRightElement, Button, Heading, Text, VStack, IconButton, Flex, Link, Textarea
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomInput from './CustomIpunt';
import { useInvoiceData } from '../context/InvoiceDataContext';
import { useTheme } from '@chakra-ui/react';
import InvoicePDF from '../components/InvoicePDF'

const InvoiceCreator = ({ totalError }) => {

  const {
    invoiceData,
    handleInvoiceDataChange,
    getClassForField,
    setPdfInstance,
    startDate,
    setStartDate,
    itemsnames,
    setItemsNames,
    handleChange,
    isValidEmail,
  } = useInvoiceData();

  const theme = useTheme();
  const breakpointMd = parseInt(theme.breakpoints.md, 10);
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpointMd);
  const [issuerSuggestions, setIssuerSuggestions] = useState([]);
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Références pour le redimensionnement automatique des Textareas
  const issuerTextareaRef = useRef(null);
  const clientTextareaRef = useRef(null);

  // Fonction pour redimensionner automatiquement un Textarea
  const autoResizeTextarea = (ref) => {
    if (ref.current) {
      ref.current.style.height = 'auto'; // Réinitialise la hauteur
      ref.current.style.height = `${ref.current.scrollHeight}px`; // Ajuste en fonction du contenu
    }
  };




  const handleAddressInputChangeForIssuer = async (e) => {
    const value = e.target.value;
    handleChange(e);
    autoResizeTextarea(issuerTextareaRef);

    if (value.length > 2) {
      try {
        const apiKey = import.meta.env.VITE_LOCATION_API_KEY; // Utilisez import.meta.env pour Vite
        const response = await fetch(
          `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${value}&format=json`
        );
        const results = await response.json();
        setIssuerSuggestions(results);
      } catch (error) {
        console.error('Erreur lors de la récupération des suggestions d\'adresse:', error);
        setIssuerSuggestions([]); // Vider les suggestions en cas d'erreur
      }
    } else {
      setIssuerSuggestions([]);
    }
  };

  const handleAddressInputChangeForClient = async (e) => {
    const value = e.target.value;
    handleChange(e);
    autoResizeTextarea(clientTextareaRef);

    if (value.length > 2) {
      try {
        const apiKey = import.meta.env.VITE_LOCATION_API_KEY; // Utilisez import.meta.env pour Vite
        const response = await fetch(
          `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${value}&format=json`
        );
        const results = await response.json();
        setClientSuggestions(results);
      } catch (error) {
        console.error('Erreur lors de la récupération des suggestions d\'adresse:', error);
        setClientSuggestions([]); // Vider les suggestions en cas d'erreur
      }
    } else {
      setClientSuggestions([]);
    }
  };


  const handleSelectIssuerSuggestion = (suggestion) => {
    const { display_name } = suggestion;

    // Diviser la chaîne 'display_name' par les virgules pour extraire les différentes parties de l'adresse
    const addressParts = display_name.split(',').map(part => part.trim());

    // Exemple : ["43", "Grande Rue", "Étiolles", "Saint-Germain-lès-Corbeil", "Essonne", "91450", "France"]
    const street = addressParts[0] + ', ' + addressParts[1]; // Rue (index 0 et 1)
    const city = addressParts[2]; // Ville (index 2)
    const postalCode = addressParts[addressParts.length - 2]; // Code postal (avant-dernier élément)
    const country = addressParts[addressParts.length - 1]; // Pays (dernier élément)

    // Remplir les champs avec les données extraites
    handleChange({ target: { name: 'issuer.adresse', value: `${street}, ${city}` } });

    handleChange({ target: { name: 'issuer.postalCode', value: postalCode } });

    handleChange({ target: { name: 'issuer.country', value: country } });

    setIssuerSuggestions([]); // Vider les suggestions après la sélection
  };


  const handleSelectClientSuggestion = (suggestion) => {
    const { display_name } = suggestion;

    // Diviser la chaîne 'display_name' par les virgules pour extraire les différentes parties de l'adresse
    const addressParts = display_name.split(',').map(part => part.trim());

    // Exemple : ["43", "Grande Rue", "Étiolles", "Saint-Germain-lès-Corbeil", "Essonne", "91450", "France"]
    const street = addressParts[0] + ', ' + addressParts[1]; // Rue (index 0 et 1)
    const city = addressParts[2]; // Ville (index 2)
    const postalCode = addressParts[addressParts.length - 2]; // Code postal (avant-dernier élément)
    const country = addressParts[addressParts.length - 1]; // Pays (dernier élément)

    // Remplir les champs avec les données extraites
    handleChange({ target: { name: 'client.adresse', value: `${street}, ${city}` } });

    handleChange({ target: { name: 'client.postalCode', value: postalCode } });

    handleChange({ target: { name: 'client.country', value: country } });

    setClientSuggestions([]); // Vider les suggestions après la sélection
  };



  const handleAddItem = () => {
    const items = [...invoiceData.items, { description: '', quantity: 1, unitPrice: 0 }];
    handleInvoiceDataChange(prevState => ({ ...prevState, items }));
  };

  const handleRemoveItem = (index) => {
    const items = [...invoiceData.items];
    items.splice(index, 1);
    handleInvoiceDataChange(prevState => ({ ...prevState, items }));
  };

  const handleVatChange = (e) => {
    handleInvoiceDataChange(prevState => ({ ...prevState, vatRate: parseFloat(e.target.value) || 0 }));
  };

  useEffect(() => {
    const generatePdfDocument = async () => {
      const doc = <InvoicePDF invoiceData={invoiceData} />;
      const instance = pdf([]);
      instance.updateContainer(doc);
      const blob = await instance.toBlob();
      setPdfInstance(URL.createObjectURL(blob));
    };
    generatePdfDocument();
  }, [invoiceData]);

  useEffect(() => {
    const subtotal = invoiceData.items.reduce((acc, curr) => acc + curr.quantity * curr.unitPrice, 0);
    const vatAmount = subtotal * (invoiceData.vatRate / 100).toFixed(2);
    const total = (parseFloat(subtotal) + parseFloat(vatAmount)).toFixed(2);
    handleInvoiceDataChange((prevState) => ({ ...prevState, subtotal, vatAmount, total }));
  }, [invoiceData.items, invoiceData.vatRate]);

  useEffect(() => {
    const updateItemsNames = () => {
      const items = invoiceData.items;
      if ((items.length > 1)) {
        setItemsNames('Articles / Services');
      } else {
        setItemsNames('Article / Service');
      }
    };
    updateItemsNames();
  }, [invoiceData.items]);

  const formatTotal = (total) => {
    return parseFloat(total) === 0 ? '0€' : `${total}€`;
  };

  return (
    <>
      <VStack mt={{ base: '1rem', lg: '2rem' }} boxShadow=' 1px solid black' align="start">
        <Text mb='1rem' color="red"> {totalError()}</Text>
        <Flex w='100%' justifyContent='space-between'>

          <Flex w={{ base: 'unset', lg: '25vw' }} direction='column' pb="2rem">
            <Heading mb='1rem' size="sm">Votre Société :</Heading>
            <Input
              _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
              _active={{ bg: "white", color: "black" }}
              className={getClassForField(invoiceData.issuer.company)}
              placeholder="Nom de votre société (Si professionnel)" name="number" value={invoiceData.issuer.company} onChange={handleChange} />
          </Flex>

          <Flex direction='row' w={{ base: 'unset', lg: '25vw' }} justifyContent='space-between' pb="2rem">
            <Flex direction='column' w='48%'>
              <Heading mb='1rem' size="sm">Facture n° :</Heading>
              <Input
                _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                _active={{ bg: "white", color: "black" }}
                className={getClassForField(invoiceData.number)}
                placeholder="Numéro de facture"
                name="number"
                value={invoiceData.number}
                onChange={handleChange}
              />
            </Flex>

            <Flex direction='column' w='48%'>
              <Heading mb='1rem' size="sm">Date :</Heading>
              <DatePicker
                className='neue-down'
                boxShadow='rgba(174, 174, 192, 0.4) -1.5px -1.5px 3px 0px, rgb(255, 255, 255) 1.5px 1.5px 3px 0px !important'
                position='static !important'
                backgroundColor='white'
                color="#0B3860"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                minDate={new Date()}
                maxDate={new Date().setFullYear(new Date().getFullYear() + 1)}
                dateFormat="dd/MM/yyyy"
                customInput={<CustomInput />}
              />
            </Flex>
          </Flex>

        </Flex>
        <Flex flexDirection={{ base: 'column', lg: 'row' }} w='25vw' justifyContent='space-between' width='-webkit-fill-available' pb="2rem">
          <Flex direction="column" w={{ base: 'unset', lg: '25vw' }} alignItems='start'>
            <Heading mb='1rem' size="sm">Informations sur l'émetteur :</Heading>

            <Input className={getClassForField(invoiceData.issuer.name)}
              placeholder="Nom et Prénom / Société*" name="issuer.name" value={invoiceData.issuer.name} onChange={handleChange} />
            <Textarea
              ref={issuerTextareaRef}
              className={getClassForField(invoiceData.issuer.adresse)}
              placeholder="Adresse*"
              name="issuer.adresse"
              value={invoiceData.issuer.adresse}
              onChange={handleAddressInputChangeForIssuer}
              rows={1}
              size="md"
              wrap="soft"
              resize="none"
            />
            {/* Suggestions dropdown */}
            {issuerSuggestions.length > 0 && (
              <ul style={{ border: '1px solid #ccc', listStyle: 'none', margin: 0, padding: '0.5rem' }}>
                {issuerSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectIssuerSuggestion(suggestion)}
                    style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}

            <Flex gap="0.5rem" w="-webkit-fill-available">
              <Input
                className={getClassForField(invoiceData.issuer.country)}
                placeholder="Pays*"
                name="issuer.country"
                value={invoiceData.issuer.country}
                onChange={handleChange}
              />
              <Input
                className={getClassForField(invoiceData.issuer.postalCode)}
                placeholder="Code postal*"
                name="issuer.postalCode"
                value={invoiceData.issuer.postalCode}
                onChange={handleChange}
              />
            </Flex>


            <Input
              className='classicinput' placeholder="N° de Siret (Si professionnel)" name="issuer.siret" value={invoiceData.issuer.siret} onChange={handleChange} />
            <Input
              className={getClassForField(invoiceData.issuer.email)} placeholder="Email de l'émetteur*" name="issuer.email" value={invoiceData.issuer.email} onChange={handleChange} />
          </Flex>
          <Flex w={{ base: 'unset', lg: '25vw' }} mt={{ base: '3rem', lg: '5rem' }} direction="column" alignItems='start'>
            <Heading mb='1rem' size="sm">Informations sur le client :</Heading>
            <Input className={getClassForField(invoiceData.client.name)}
              placeholder="Nom et Prénom / Société*" name="client.name" value={invoiceData.client.name} onChange={handleChange} />
            <Textarea
              ref={clientTextareaRef} // Référence pour l'auto-resize
              className={getClassForField(invoiceData.client.adresse)}
              placeholder="Adresse*"
              name="client.adresse"
              value={invoiceData.client.adresse}
              onChange={handleAddressInputChangeForClient}
              rows={1}
              size="md"
              wrap="soft"
              resize="none" // Désactive le redimensionnement manuel
            />
            {/* Suggestions dropdown */}
            {clientSuggestions.length > 0 && (
              <ul style={{ border: '1px solid #ccc', listStyle: 'none', margin: 0, padding: '0.5rem' }}>
                {clientSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelectClientSuggestion(suggestion)}
                    style={{ cursor: 'pointer', padding: '0.5rem', borderBottom: '1px solid #ddd' }}
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}

            <Flex gap="0.5rem" w="-webkit-fill-available">
              <Input
                className={getClassForField(invoiceData.client.country)}
                placeholder="Pays*"
                name="client.country"
                value={invoiceData.client.country}
                onChange={handleChange}
              />
              <Input
                className={getClassForField(invoiceData.client.postalCode)}
                placeholder="Code postal*"
                name="client.postalCode"
                value={invoiceData.client.postalCode}
                onChange={handleChange}
              />
            </Flex>


            <Input className='classicinput' placeholder="N° de Siret (Si professionnel)" name="client.siret" value={invoiceData.client.siret} onChange={handleChange} />
            <Input className={getClassForField(invoiceData.client.email)} placeholder="Email du client*" name="client.email" value={invoiceData.client.email} onChange={handleChange} />
          </Flex>
        </Flex>

        <Flex direction='column' className='neue-up' borderWidth='1px' borderRadius='10px' pt='1rem' pl='1.5rem' pr='1.5rem' pb='1rem' w='100%' mb={{ base: '2rem', lg: '0rem' }}>
          <Heading mb='1rem' mt='1rem' size="md">{itemsnames}</Heading>
          {isMobile ? (
            <>
              {invoiceData.items.map((item, index) => (
                <Box key={index} borderBottom="1px solid #f2f2f2" pt='1rem' pb='1rem' mb='1rem'>
                  <Flex gap='10px'>
                    <Flex gap='10px' direction='column'>
                      <Text fontFamily="heading"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        textAlign="center"
                        mb={2}
                        pb={3}
                        lineHeight="4"
                        fontSize="xs"
                        color="gray.600"
                        borderBottom="1px"
                        borderColor="gray.100">Description</Text>
                      <Input
                        _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                        className={getClassForField(item.description)}
                        placeholder="Description*"
                        value={item.description}
                        onChange={handleChange}
                        name={`items.${index}.description`}
                        mb={2}
                      />
                    </Flex>
                    <Flex gap='10px' direction='column'>
                      <Text fontFamily="heading"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        textAlign="center"
                        mb={2}
                        pb={3}
                        lineHeight="4"
                        fontSize="xs"
                        color="gray.600"
                        borderBottom="1px"
                        borderColor="gray.100">Quantité</Text>
                      <InputGroup>
                        <Input
                          _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                          className={getClassForField(item.quantity, true)}
                          boxShadow='rgba(174, 174, 192, 0.4) -1.5px -1.5px 3px 0px, rgb(255, 255, 255) 1.5px 1.5px 3px 0px;'
                          placeholder="Quantité"
                          name={`items.${index}.quantity`}
                          type="number"
                          value={item.quantity}
                          onChange={handleChange}
                        />
                        <InputRightElement children={
                          <IconButton
                            aria-label="Supprimer l'article"
                            icon={<DeleteIcon />}
                            size="sm"
                            backgroundColor="transparent"
                            onClick={() => handleRemoveItem(index)}
                          />
                        } />
                      </InputGroup>
                    </Flex>
                    <Flex gap='10px' direction='column'>
                      <Text fontFamily="heading"
                        fontWeight="bold"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        textAlign="center"
                        mb={2}
                        pb={3}
                        lineHeight="4"
                        fontSize="xs"
                        color="gray.600"
                        borderBottom="1px"
                        borderColor="gray.100">Prix ht/U</Text>
                      <Input
                        _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                        textAlign='end'
                        className={getClassForField(item.unitPrice)}
                        placeholder="Prix unitaire (HT)"
                        type="number"
                        value={item.unitPrice}
                        onChange={handleChange}
                        name={`items.${index}.unitPrice`}
                        mb={2}
                      />
                    </Flex>
                  </Flex>
                  <Flex justifyContent='end'>
                    <Text alignItems='end' mt='0.5rem'><strong>Total (HT):</strong> {item.quantity * item.unitPrice} {invoiceData.devise}</Text>
                  </Flex>
                </Box>
              ))}
              <Link onClick={handleAddItem} display='flex' alignItems='center' color="#745FF2">
                Ajouter un article
                <AddIcon w='2.5' ml="2" />
              </Link>
              <Flex gap='20px' direction='column' alignItems='end' mt='2rem'>
                <Flex width='100%' borderBottom='1px solid #f2f2f2'>
                  <Heading width='100%' textAlign='end' mb='1rem' size='sm'>Sous-total HT : {invoiceData.subtotal}{invoiceData.devise}</Heading>
                </Flex>
                <Flex gap='10px' alignItems='center'>
                  <Heading size='sm'>TVA (%): </Heading>
                  <Input
                    _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                    w='4rem'
                    textAlign='end'
                    className='neue-down'
                    type="number"
                    value={invoiceData.vatRate}
                    onChange={handleVatChange}
                    placeholder="Taux de TVA"
                  />
                </Flex>
                <Flex mb='1rem' pt='1rem' width='100%' borderTop='1px solid #f2f2f2'>
                  <Heading width='100%' textAlign='end' mt='1rem' size='md'>Total TTC : {formatTotal(invoiceData.total)}</Heading>
                </Flex>
              </Flex>
            </>
          ) : (
            <Table variant="simple" borderRadius='10px'>
              <Thead>
                <Tr>
                  <Th className='head-tab' pl='0'>Description</Th>
                  <Th className='head-tab'>Quantité</Th>
                  <Th className='head-tab'>Prix ht/U</Th>
                  <Th className='head-tab'>Total/ht</Th>
                </Tr>
              </Thead>
              <Tbody>
                {invoiceData.items.map((item, index) => (
                  <Tr key={index}>
                    <Td pl='0'>
                      <Textarea
                        _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                        className={getClassForField(item.description)}
                        placeholder="Description*"
                        name={`items.${index}.description`}
                        value={item.description}
                        onChange={handleChange}
                        rows={1}
                        wrap="soft"
                        resize="none"
                      />
                    </Td>
                    <Td>
                      <InputGroup>
                        <Input
                          _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                          className={getClassForField(item.quantity, true)}
                          boxShadow='rgba(174, 174, 192, 0.4) -1.5px -1.5px 3px 0px, rgb(255, 255, 255) 1.5px 1.5px 3px 0px;'
                          placeholder="Quantité"
                          name={`items.${index}.quantity`}
                          type="number"
                          value={item.quantity}
                          onChange={handleChange}
                        />
                        <InputRightElement children={
                          <IconButton
                            aria-label="Supprimer l'article"
                            icon={<DeleteIcon />}
                            size="sm"
                            backgroundColor="transparent"
                            onClick={() => handleRemoveItem(index)}
                          />
                        } />
                      </InputGroup>
                    </Td>
                    <Td>
                      <Input
                        _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                        className={getClassForField(item.unitPrice)}
                        alignItems='end'
                        placeholder="Prix unitaire*"
                        name={`items.${index}.unitPrice`}
                        type="number"
                        value={item.unitPrice}
                        onChange={handleChange}
                      />
                    </Td>
                    <Td textAlign='end'>
                      {item.quantity * item.unitPrice}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
              <Tfoot>
                <Tr>
                  <Td pl='0' colSpan="4" borderBottom="none">
                    <Link onClick={handleAddItem} display='flex' w='fit-content' alignItems='center' color="#745FF2">
                      Ajouter un article
                      <AddIcon w='2.5' ml="2" />
                    </Link>
                  </Td>
                </Tr>
                <Tr>
                  <Td colSpan={3} style={{ paddingLeft: '0', textAlign: 'end' }}><Heading size='sm'>Sous-total HT :</Heading></Td>
                  <Td style={{ textAlign: 'end' }}><Heading size='sm'>{invoiceData.subtotal}{invoiceData.devise}</Heading></Td>
                </Tr>
                <Tr>
                  <Td colSpan={3} style={{ paddingLeft: '0', textAlign: 'end' }}><Heading size='sm'>TVA (%):</Heading></Td>
                  <Td style={{ textAlign: 'end' }}>
                    <Input
                      _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
                      w='10vh'
                      textAlign='end'
                      className='neue-down'
                      type="number"
                      value={invoiceData.vatRate}
                      onChange={handleVatChange}
                      placeholder="Taux de TVA"
                    />
                  </Td>
                </Tr>
                <Tr alignContent='center' alignItems='center'>
                  <Td colSpan={3} style={{ paddingLeft: '0', textAlign: 'end' }}><Heading size='md'>Total TTC :</Heading></Td>
                  <Td style={{ textAlign: 'end' }}><Heading size='md'>{formatTotal(invoiceData.total)}</Heading></Td>
                </Tr>
                <Tr border='none !important' alignContent='end' alignItems='end'>
                  <Td color="red" borderBottom="none" colSpan={4} style={{ paddingLeft: '0', textAlign: 'end' }}> <Text> {totalError()}</Text> </Td>
                </Tr>
              </Tfoot>
            </Table>
          )}
        </Flex>
        <Flex direction="column" alignItems='start' mt={isMobile ? "2rem" : "1rem"}>
          <Heading mb='1rem' size="sm">Saisissez votre RIB/IBAN</Heading>
          <Input
            _focus={{ borderColor: "#745FF2", boxShadow: "none" }}
            className='neue-down'
            placeholder="Votre IBAN (Facultatif)"
            name="issuer.iban"
            value={invoiceData.issuer.iban}
            onChange={handleChange}
          />
        </Flex>
        <Text p='0' mt='1rem' color='#4A5568' w='97%'>
  Ce champ est uniquement requis si vous souhaitez recevoir votre paiement par virement.<br />
  Veuillez toutefois vous assurer de respecter la législation locale concernant les moyens de paiement en fonction des montants concernés.
</Text>

      </VStack>

    </>
  );
};

export default InvoiceCreator;
