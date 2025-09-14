import { Box, Container, Heading, Text, Stack, FormControl, FormLabel, Input, Textarea, Button, useColorModeValue, useToast } from '@chakra-ui/react';
import { useState } from 'react';

export default function Contact() {
  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.300');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const toast = useToast();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!name || !/.+@.+\..+/.test(email) || !message) {
      toast({ title: 'Please fill all fields correctly.', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    toast({ title: 'Message sent!', description: 'We will get back to you soon.', status: 'success', duration: 3000, isClosable: true });
    setName(''); setEmail(''); setMessage('');
  };

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} py={12}>
      <Container maxW="5xl">
        <Stack spacing={6} bg={bg} p={{ base: 6, md: 10 }} rounded="lg" boxShadow="sm">
          <Heading as="h1" size="lg">Contact Us</Heading>
          <Text color={muted}>Have a question or feedback? Send us a message.</Text>
          <form onSubmit={onSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Message</FormLabel>
                <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" />
              </FormControl>
              <Button type="submit" colorScheme="teal" alignSelf="flex-start">Send</Button>
            </Stack>
          </form>
        </Stack>
      </Container>
    </Box>
  );
}
