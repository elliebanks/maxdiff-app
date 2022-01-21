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
  Box,
} from '@chakra-ui/react';

export default function Input() {
  const [inputs, setInputs] = useState({
    versions: '',
    numOfItems: '',
    screens: '',
    maxItemsPerScreen: '',
    screensWithMaxItems: '',
  });

  const [sampleDesign, setSampleDesign] = useState();
  const [error, setError] = useState();

  function handleInputChange(newValue, inputName) {
    console.log(newValue, inputName);
    setInputs(prevInputs => ({
      ...prevInputs,
      [inputName]: isNaN(newValue) ? '' : newValue,
    }));
  }

  const onSubmit = event => {
    event.preventDefault();
    fetch('/api/get_aug_md_design', {
      method: 'POST',
      body: JSON.stringify(inputs),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        return res.blob(); // for files
        //  return res.json() // for json
      })
      .then(data => {
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
      if (Object.keys(inputs).some(key => inputs[key] === '')) {
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
          status = res.status;
          return res.json(); // for json
        })
        .then(data => {
          console.log(data);
          if (status === 400) {
            setError(data.message);
            setSampleDesign(null);
          } else {
            setError(null);
            setSampleDesign(data.sample_design);
          }
        });
    },
    [inputs]
  );

  return (
    <>
      <Stack direction={['column', 'row']} justify={'space-between'}>
        <form onSubmit={onSubmit}>
          <Text mb="8px">Number of Versions:</Text>
          <NumberInput
            value={isNaN(inputs.versions) ? '' : inputs.versions}
            onChange={(valueAsString, valueAsNumber) =>
              handleInputChange(valueAsNumber, 'versions')
            }
          >
            <NumberInputField type="int" required />
          </NumberInput>

          <Text mb="8px">Number of Items:</Text>
          <NumberInput
            defaultValue={20}
            value={inputs.numOfItems}
            onChange={(valueAsString, valueAsNumber) =>
              handleInputChange(valueAsNumber, 'numOfItems')
            }
          >
            <NumberInputField type="int" required />
          </NumberInput>
          <Text mb="8px">Number of Screens:</Text>
          <NumberInput
            defaultValue={5}
            value={inputs.screens}
            onChange={(valueAsString, valueAsNumber) =>
              handleInputChange(valueAsNumber, 'screens')
            }
          >
            <NumberInputField type="int" required />
          </NumberInput>
          <Text mb="8px">Maximum Items per Screen:</Text>
          <NumberInput
            defaultValue={4}
            value={inputs.maxItemsPerScreen}
            onChange={(valueAsString, valueAsNumber) =>
              handleInputChange(valueAsNumber, 'maxItemsPerScreen')
            }
          >
            <NumberInputField type="int" required />
          </NumberInput>
          <Text mb="8px">
            Number of Screens with{' '}
            {inputs.maxItemsPerScreen ?? 'max items per screen'} items:
          </Text>
          <NumberInput
            defaultValue={4}
            value={inputs.screensWithMaxItems}
            onChange={(valueAsString, valueAsNumber) =>
              handleInputChange(valueAsNumber, 'screensWithMaxItems')
            }
          >
            <NumberInputField type="int" required />
          </NumberInput>
          <Button type="submit">Submit</Button>
        </form>

        <Box>
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
        </Box>
      </Stack>

      <Box mt={{ base: 4, md: 100 }} ml={{ md: 6 }}>
        {error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : null}
      </Box>
    </>
  );
}
