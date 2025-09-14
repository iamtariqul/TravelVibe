import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  useColorModeValue,
  Heading,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  HStack,
  useToast,
  Flex,
  Icon,
  VisuallyHidden,
  chakra,
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube, FaInstagram, FaFacebook } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

const SocialButton = ({ children, label, href }) => {
  const socialButtonBg = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  const hoverBg = useColorModeValue('blackAlpha.200', 'whiteAlpha.200');
  
  return (
    <chakra.button
      bg={socialButtonBg}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: hoverBg,
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export default function Footer() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const [email, setEmail] = useState('');
  const toast = useToast();

  const onSubscribe = () => {
    const trimmed = email.trim();
    const valid = /.+@.+\..+/.test(trimmed);
    if (!valid) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    toast({
      title: 'Subscribed!',
      description: 'Thanks for subscribing to TravelVibe updates.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setEmail('');
  };
  
  return (
    <Box
      bg={bgColor}
      color={textColor}
      mt="auto"
    >
      <Container as={Stack} maxW={'6xl'} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <Link as={RouterLink} to="/about">About Us</Link>
            <Link as={RouterLink} to="/contact">Contact Us</Link>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Resources</ListHeader>
            <Link as={RouterLink} to="/search">Explore Stays</Link>
            <Link as={RouterLink} to="/become-host">Become a Host</Link>
            <Link as={RouterLink} to="/profile">Your Account</Link>
            <Link as={RouterLink} to="/my-listings">Your Listings</Link>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Legal</ListHeader>
            <Link as={RouterLink} to="/terms">Terms of Service</Link>
          </Stack>

          <Stack align={'flex-start'}>
            <ListHeader>Stay in the loop</ListHeader>
            <Text>Subscribe for travel tips and product updates</Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={2} w="full">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <Button colorScheme="teal" onClick={onSubscribe}>Subscribe</Button>
            </Stack>
            <Text mt={3} fontSize="sm" color="gray.500">Get the app</Text>
            <HStack spacing={2} mt={1}>
              <Box
                as="a"
                href="#"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                px={3}
                py={1}
                _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}
                aria-label="Get it on Google Play"
              >
                Google Play
              </Box>
              <Box
                as="a"
                href="#"
                border="1px solid"
                borderColor="gray.300"
                borderRadius="md"
                px={3}
                py={1}
                _hover={{ bg: useColorModeValue('gray.100', 'whiteAlpha.200') }}
                aria-label="Download on the App Store"
              >
                App Store
              </Box>
            </HStack>
          </Stack>
        </SimpleGrid>
      </Container>

      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={borderColor}
      >
        <Container
          as={Stack}
          maxW={'6xl'}
          py={4}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ md: 'space-between' }}
          align={{ md: 'center' }}
        >
          <Text> {new Date().getFullYear()} TravelVibe. All rights reserved</Text>
          <Stack direction={'row'} spacing={6}>
            <SocialButton label={'Twitter'} href={'#'}>
              <FaTwitter />
            </SocialButton>
            <SocialButton label={'YouTube'} href={'#'}>
              <FaYoutube />
            </SocialButton>
            <SocialButton label={'Instagram'} href={'#'}>
              <FaInstagram />
            </SocialButton>
            <SocialButton label={'Facebook'} href={'#'}>
              <FaFacebook />
            </SocialButton>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}