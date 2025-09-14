import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Container,
  Avatar,
  HStack,
  Divider,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    photoURL: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const inputReadOnlyBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setUserData({
      displayName: currentUser.displayName || '',
      email: currentUser.email || '',
      phoneNumber: currentUser.phoneNumber || '',
      photoURL: currentUser.photoURL || ''
    });
    
    setIsLoading(false);
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await updateProfile({
        displayName: userData.displayName,
        photoURL: userData.photoURL
      });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={2}>Your Profile</Heading>
          <Text color={textColor}>Manage your account information</Text>
        </Box>
        
        <Box p={8} bg={bgColor} boxShadow="md" borderRadius="lg">
          <VStack spacing={6}>
            <Avatar 
              size="2xl" 
              name={userData.displayName || 'User'} 
              src={userData.photoURL} 
            />
            
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Display Name</FormLabel>
                  <Input 
                    name="displayName"
                    value={userData.displayName}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input 
                    name="email"
                    value={userData.email}
                    isReadOnly
                    bg={inputReadOnlyBg}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Photo URL</FormLabel>
                  <Input 
                    name="photoURL"
                    value={userData.photoURL}
                    onChange={handleChange}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                </FormControl>
                
                <Divider my={4} />
                
                <HStack justify="flex-end">
                  <Button 
                    type="submit" 
                    colorScheme="teal" 
                    isLoading={loading}
                  >
                    Save Changes
                  </Button>
                </HStack>
              </VStack>
            </form>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Profile; 