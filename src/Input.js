import React, { useState, useRef, useEffect } from 'react';
import {
  NumberInput,
  NumberInputField,
  Text,
  Button,
} from '@chakra-ui/react';

export default function Input() {
  const [inputs, setInputs] = useState({
    versions: undefined,
    numOfItems: undefined,
    screens: undefined,
    maxItemsPerScreen: undefined,
    screensWithMaxItems: undefined,
  });

  function handleInputChange(newValue, inputName) {
    console.log(newValue, inputName);
    setInputs(prevInputs => ({
      ...prevInputs,
      [inputName]: newValue,
    }));
  }

  const onSubmit = (event) => {
    event.preventDefault();
    fetch(
      '/api/get_aug_md_design',
      {
        method: 'POST',
        body: JSON.stringify(inputs),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ).then(res => {
      return res.blob(); // for files
//  return res.json() // for json
    }).then(data => {
      console.log(data);
      // download file
      const href = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.download = `AugMD Design.csv`;
      a.href = href;
      a.click();
      a.href = '';
      return;
    });
  };


  return (
    <>
      <form onSubmit={onSubmit}>

        <Text mb='8px'>Number of Versions:</Text>
        <NumberInput
          value={isNaN(inputs.versions) ? '':inputs.versions}
          onChange={(valueAsString, valueAsNumber) => handleInputChange(valueAsNumber, 'versions')}>
          <NumberInputField
            type='int'

          />
        </NumberInput>

        <Text mb='8px'>Number of Items:</Text>
        <NumberInput
          value={inputs.numOfItems}
          onChange={(valueAsString, valueAsNumber) => handleInputChange(valueAsNumber, 'numOfItems')}>
          <NumberInputField
            type='int'

          />
        </NumberInput>

        <Text mb='8px'>Number of Screens:</Text>
        <NumberInput value={inputs.screens}
                     onChange={(valueAsString, valueAsNumber) => handleInputChange(valueAsNumber, 'screens')}>
          <NumberInputField
            type='int'
          />
        </NumberInput>

        <Text mb='8px'>Maximum Items per Screen:</Text>
        <NumberInput
          value={inputs.maxItemsPerScreen}
          onChange={(valueAsString, valueAsNumber) => handleInputChange(valueAsNumber, 'maxItemsPerScreen')}>
          <NumberInputField
            type='int'
          />
        </NumberInput>

        <Text mb='8px'>Number of Screens with {inputs.maxItemsPerScreen ?? "max items per screen"} items:</Text>
        <NumberInput
          value={inputs.screensWithMaxItems}
          onChange={(valueAsString, valueAsNumber) => handleInputChange(valueAsNumber, 'screensWithMaxItems')}>
          <NumberInputField
            type='int'
          />
        </NumberInput>

        <Button type='submit'>Submit</Button>
      </form>


    </>
  );
}


