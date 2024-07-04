import React from 'react';
import { Input, InputGroup, InputRightElement, IconButton} from '@chakra-ui/react';
import {CalendarIcon } from '@chakra-ui/icons';


const CustomInput = React.forwardRef(({ value, onClick }, ref) => (  
    <InputGroup>
      <Input
        ref={ref}
        className='neue-down'
        backgroundColor='white'
        color="#0B3860"
        value={value}
        onClick={onClick}
        readOnly // Ajoutez cette ligne ici
      />
      <InputRightElement
        children={
          <IconButton
            aria-label="Choisir la date"
            icon={<CalendarIcon />}
            size="sm"
            backgroundColor="transparent"
            onClick={onClick}
          />
        }
      />
    </InputGroup>
));
  export default CustomInput