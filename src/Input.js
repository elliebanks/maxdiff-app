import React, { useState, useEffect } from 'react';
import {
  NumberInput,
  NumberInputField,
  Text,
  Button,
  Alert,
  AlertIcon,
  Table,
  Tbody,
  Td,
  Tr,
  Thead,
  Th,
  Stack,
  Container,
  Box,
} from '@chakra-ui/react';

export default function Input() {
  // input state variable used to handle the default values and user
  // input fields within the rendered form

  const [inputs, setInputs] = useState({
    versions: parseInt('100'),
    numOfItems: parseInt('20'),
    screens: parseInt('5'),
    maxItemsPerScreen: parseInt('4'),
    screensWithMaxItems: parseInt('5'),
  });

  // initial state variable holds default values, parseInt() used to convert
  // the strings to integers to prevent backend errors and display the numbers upon rendering

  // state must be set for sample design & errors because they will both be returned
  // and rendered depending on the user input field submissions

  const [sampleDesign, setSampleDesign] = useState();
  const [error, setError] = useState();

  // handleInputChange function handles the state change of each input field
  // setInputs updates the state of inputs. Pass the inputName & newValue as arguments.

  function handleInputChange(newValue, inputName) {
    // console.log(newValue, inputName);
    setInputs(prevInputs => ({
      ...prevInputs,
      // rest parameter for previous input numbers
      [inputName]: isNaN(newValue) ? '' : newValue,
      // line checks if the new entered value is a number or if input is empty
      // before setting the newValue to the input state
    }));
  }

  // onSubmit event handler handles the button click submission of new values in order to
  // reach the backend API to return an Excel file data spreadsheet

  const onSubmit = event => {
    event.preventDefault();
    fetch('/api/get_aug_md_design', {
      // fetch the API
      method: 'POST', // method is POST because sending data to the backend
      body: JSON.stringify(inputs), // turns input data into JSON for the backend
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        // use of .then promise - waiting for response from the backend
        return res.blob(); // return response for Excel file from backend
        //  return res.json() // for json
      })
      .then(data => {
        // data received from the backend
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

  useEffect(
    function getVersionPreview() {
      // check to see if input fields are blank
      if (Object.keys(inputs).some(key => inputs[key] === '')) {
        // if any of the input fields are blank, remove the error message and/or the preview design
        setError(null);
        setSampleDesign(null);
        return;
      }
      let status = 0;
      fetch('/api/get_version_preview', {
        method: 'POST',
        body: JSON.stringify(inputs),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
          status = res.status; // for error
          return res.json(); // for json - for the preview design
        })
        .then(data => {
          console.log(data);
          if (status === 400) {
            // if there is a status error - display the error message
            // hide the sample design
            setError(data.message);
            setSampleDesign(null);
          } else {
            // if there is no status error - display the sample design
            // hide the error message
            setError(null);
            setSampleDesign(data.sample_design);
          }
        });
    },
    [inputs] // pass inputs as dependencies to handle their state change
  );

  return (
    <>
      <Stack
        justify={'center'}
        align={'center'}
        spacing="120px"
        direction={{ lg: 'row', base: 'column' }}
      >
        <Container
          maxW="container.sm"
          position={'relative'}
          w={'75%'}
          margin={12}
          centerContent
        >
          <form onSubmit={onSubmit}>
            <Text m={4}>Number of Versions:</Text>
            <NumberInput
              focusBorderColor={'orange.400'}
              value={isNaN(inputs.versions) ? '' : inputs.versions}
              onChange={(valueAsString, valueAsNumber) =>
                handleInputChange(valueAsNumber, 'versions')
              }
            >
              <NumberInputField type="int" required />
            </NumberInput>

            <Text m={4}>Number of Items:</Text>
            <NumberInput
              focusBorderColor={'orange.400'}
              value={inputs.numOfItems}
              onChange={(valueAsString, valueAsNumber) =>
                handleInputChange(valueAsNumber, 'numOfItems')
              }
            >
              <NumberInputField type="int" required />
            </NumberInput>

            <Text m={4}>Number of Screens:</Text>
            <NumberInput
              focusBorderColor={'orange.400'}
              value={inputs.screens}
              onChange={(valueAsString, valueAsNumber) =>
                handleInputChange(valueAsNumber, 'screens')
              }
            >
              <NumberInputField type="int" required />
            </NumberInput>

            <Text m={4}>Maximum Items per Screen:</Text>
            <NumberInput
              focusBorderColor={'orange.400'}
              value={inputs.maxItemsPerScreen}
              onChange={(valueAsString, valueAsNumber) =>
                handleInputChange(valueAsNumber, 'maxItemsPerScreen')
              }
            >
              <NumberInputField type="int" required />
            </NumberInput>

            <Text m={4}>
              Number of Screens with{' '}
              {inputs.maxItemsPerScreen ?? 'max items per screen'} items:
            </Text>
            <NumberInput
              focusBorderColor={'orange.400'}
              value={inputs.screensWithMaxItems}
              onChange={(valueAsString, valueAsNumber) =>
                handleInputChange(valueAsNumber, 'screensWithMaxItems')
              }
            >
              <NumberInputField type="int" required />
            </NumberInput>

            <Button
              isDisabled={!inputs || error}
              mt={6}
              _hover={{ bg: 'orange.400' }}
              type="submit"
            >
              Create Design
            </Button>
          </form>
        </Container>

        <Container
          maxW="container.sm"
          position={'relative'}
          w={'50%'}
          margin={12}
          centerContent
        >
          {sampleDesign ? (
            <Table>
              <Thead>
                <Tr>
                  <Th />
                  {sampleDesign[0].map((item, i) => (
                    <Th key={i}>Item {i + 1}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {sampleDesign.map((row, i) => (
                  <Tr key={i}>
                    <Th>screen {i + 1}</Th>
                    {row.map((item, i) => (
                      <Td key={i}>{item}</Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : null}
          {error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : null}
        </Container>
      </Stack>
    </>
  );
}
