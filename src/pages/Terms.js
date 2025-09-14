import { Box, Container, Heading, Text, Stack, List, ListItem, useColorModeValue } from '@chakra-ui/react';

export default function Terms() {
  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.300');
  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} py={12}>
      <Container maxW="5xl">
        <Stack spacing={6} bg={bg} p={{ base: 6, md: 10 }} rounded="lg" boxShadow="sm">
          <Heading as="h1" size="lg">Terms of Service</Heading>
          <Text color={muted}>Last updated: {new Date().toLocaleDateString()}</Text>
          <Stack spacing={4} color={muted}>
            <Text>
              These Terms govern your use of the TravelVibe website and services. By using our site,
              you agree to these Terms.
            </Text>
            <Heading as="h2" size="md">1. Use of Service</Heading>
            <List spacing={2} pl={4} styleType="disc">
              <ListItem>Provide accurate information when creating an account or listing.</ListItem>
              <ListItem>Do not misuse, disrupt, or attempt to access data you are not authorized to access.</ListItem>
            </List>
            <Heading as="h2" size="md">2. Listings & Bookings</Heading>
            <List spacing={2} pl={4} styleType="disc">
              <ListItem>Hosts are responsible for accuracy and legality of their listings.</ListItem>
              <ListItem>Guests must comply with host rules and applicable laws.</ListItem>
            </List>
            <Heading as="h2" size="md">3. Liability</Heading>
            <Text>Service is provided "as is" without warranties. TravelVibe is not liable for indirect damages.</Text>
            <Heading as="h2" size="md">4. Changes</Heading>
            <Text>We may update these Terms from time to time. Continued use constitutes acceptance.</Text>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
