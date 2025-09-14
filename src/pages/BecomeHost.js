import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Icon,
  Divider,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react';
import { FaHome, FaMoneyBillWave, FaCalendarAlt, FaUsers, FaStar } from 'react-icons/fa';

export default function BecomeHost() {
  const { currentUser, getUserProfile, becomeHost } = useAuth();
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!currentUser) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to become a host',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
        return;
      }
      
      try {
        const userProfile = await getUserProfile();
        if (userProfile && userProfile.userType === 'host') {
          setIsHost(true);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking user status:', error);
        setLoading(false);
      }
    };
    
    checkUserStatus();
  }, [currentUser, getUserProfile, navigate, toast]);
  
  const handleBecomeHost = async () => {
    if (!currentUser) return;
    
    try {
      setSubmitting(true);
      await becomeHost();
      setIsHost(true);
      toast({
        title: 'Success!',
        description: 'You are now a host. You can start listing properties.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error becoming a host:', error);
      toast({
        title: 'Error',
        description: 'Failed to become a host. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCreateListing = () => {
    navigate('/create-listing');
  };
  
  const handleViewListings = () => {
    navigate('/my-listings');
  };
  
  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }
  
  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {!isHost ? (
            <Box bg={bgColor} p={8} borderRadius="lg" boxShadow="md">
              <VStack spacing={6} align="stretch">
                <Heading size="xl" textAlign="center">Become a Host</Heading>
                <Text textAlign="center" fontSize="lg">
                  Share your space and earn extra income by becoming a host on TravelVibe
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mt={8}>
                  <VStack align="center" p={4}>
                    <Icon as={FaHome} w={10} h={10} color="teal.500" mb={4} />
                    <Heading size="md">List your space</Heading>
                    <Text textAlign="center">
                      Whether it's a room, apartment, or villa, you can share it with travelers
                    </Text>
                  </VStack>
                  
                  <VStack align="center" p={4}>
                    <Icon as={FaMoneyBillWave} w={10} h={10} color="teal.500" mb={4} />
                    <Heading size="md">Earn money</Heading>
                    <Text textAlign="center">
                      Set your own price and earn extra income by hosting guests
                    </Text>
                  </VStack>
                  
                  <VStack align="center" p={4}>
                    <Icon as={FaCalendarAlt} w={10} h={10} color="teal.500" mb={4} />
                    <Heading size="md">You're in control</Heading>
                    <Text textAlign="center">
                      Choose your availability, house rules, and how you interact with guests
                    </Text>
                  </VStack>
                </SimpleGrid>
                
                <Divider my={6} />
                
                <Flex justify="center">
                  <Button 
                    colorScheme="teal" 
                    size="lg" 
                    onClick={handleBecomeHost}
                    isLoading={submitting}
                  >
                    Become a Host
                  </Button>
                </Flex>
              </VStack>
            </Box>
          ) : (
            <Box bg={bgColor} p={8} borderRadius="lg" boxShadow="md">
              <VStack spacing={6} align="stretch">
                <Heading size="xl" textAlign="center">Welcome, Host!</Heading>
                <Text textAlign="center" fontSize="lg">
                  You're now a host on TravelVibe. Start managing your properties and listings.
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box p={6} borderWidth="1px" borderRadius="lg" textAlign="center">
                    <Icon as={FaHome} w={10} h={10} color="teal.500" mb={4} />
                    <Heading size="md" mb={4}>Create a Listing</Heading>
                    <Text mb={6}>
                      Add a new property to your portfolio and start hosting guests
                    </Text>
                    <Button 
                      colorScheme="teal" 
                      onClick={handleCreateListing}
                      width="full"
                    >
                      Create Listing
                    </Button>
                  </Box>
                  
                  <Box p={6} borderWidth="1px" borderRadius="lg" textAlign="center">
                    <Icon as={FaMoneyBillWave} w={10} h={10} color="teal.500" mb={4} />
                    <Heading size="md" mb={4}>Manage Listings</Heading>
                    <Text mb={6}>
                      View and manage all your property listings
                    </Text>
                    <Button 
                      colorScheme="teal" 
                      variant="outline"
                      onClick={handleViewListings}
                      width="full"
                    >
                      View Listings
                    </Button>
                  </Box>
                </SimpleGrid>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
} 