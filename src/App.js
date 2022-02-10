import React from 'react';
import { ChakraProvider, Box, VStack, Grid, theme } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import Input from './Input.js';

export default function App() {
  return (
    <>
      <ChakraProvider theme={theme}>
        <Box fontSize="lg">
          <Grid minH="100vh">
            <ColorModeSwitcher justifySelf="flex-end" />
            <VStack spacing={2}>
              <Input />
            </VStack>
          </Grid>
        </Box>
      </ChakraProvider>
    </>
  );
}
