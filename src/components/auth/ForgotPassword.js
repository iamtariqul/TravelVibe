import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  VStack, 
  Heading, 
  Text, 
  Alert, 
  AlertIcon,
  AlertTitle
} from '@chakra-ui/react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return setError('Please enter your email');
    }
    
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your email for password reset instructions');
    } catch (error) {
      setError('Failed to reset password. Please check if your email is correct.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt="10">
      <VStack spacing="5" align="stretch">
        <Heading textAlign="center">Password Reset</Heading>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        {message && (
          <Alert status="success">
            <AlertIcon />
            <AlertTitle>{message}</AlertTitle>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <VStack spacing="4">
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email"
              />
            </FormControl>
            
            <Button 
              type="submit" 
              colorScheme="teal" 
              width="100%" 
              isLoading={loading}
            >
              Reset Password
            </Button>
          </VStack>
        </form>
        
        <Text textAlign="center">
          <Link to="/login" style={{ color: 'teal' }}>Back to Login</Link>
        </Text>
      </VStack>
    </Box>
  );
} 