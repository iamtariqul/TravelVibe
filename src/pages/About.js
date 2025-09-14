import { Box, Container, Heading, Text, Stack, useColorModeValue } from '@chakra-ui/react';

export default function About() {
  const bg = useColorModeValue('white', 'gray.800');
  const muted = useColorModeValue('gray.600', 'gray.300');
  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} py={12}>
      <Container maxW="5xl">
        <Stack spacing={6} bg={bg} p={{ base: 6, md: 10 }} rounded="lg" boxShadow="sm">
          <Heading as="h1" size="lg">About TravelVibe</Heading>
          <Text color={muted} fontSize="lg">
            TravelVibe helps travelers discover unique stays and empowers hosts to share their spaces.
            We focus on a clean, fast experience powered by modern web tech and Firebase.
          </Text>
          <Text color={muted}>
            This project showcases listing search, detailed property pages, reviews, and host tools.
            We’re continuously improving the platform with better discovery, trust, and safety features.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
