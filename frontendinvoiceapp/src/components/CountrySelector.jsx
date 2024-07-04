import React, { useState } from 'react';
import Select from 'react-select';
import countryList from 'country-list';
import { Box, Flex, Input, Button } from '@chakra-ui/react';

const countries = countryList.getData().map(country => ({
  value: country.code,
  label: country.name,
  flag: `https://www.countryflags.io/${country.code}/flat/32.png`,
}));

const CountrySelector = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [email, setEmail] = useState('');

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
  };

  return (
    <Flex direction="column" alignItems="center" w="100%">
      <Box  padding='0rem !important'  className='neue-down' mb="2rem" w="100%">
        <Select 
          options={countries}
          onChange={handleCountryChange}
          placeholder="Select a country"
          formatOptionLabel={country => (
            <Flex alignItems="center">
              <img src={country.flag} alt={country.label} style={{ marginRight: 10 }} />
              {country.label}
            </Flex>
          )}
          styles={{
            control: (provided) => ({
              ...provided,
              borderRadius: '0.5rem',
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected ? '#745FF2' : provided.backgroundColor,
              color: state.isSelected ? 'white' : provided.color,
            }),
          }}
        />
      </Box>
    </Flex>
  );
};

export default CountrySelector;
