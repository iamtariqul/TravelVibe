import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    
    if (!email || !password) {
      console.log('Missing email or password');
      return setError('Please fill in all fields');
    }
    
    try {
      console.log('Attempting to log in with:', email);
      setError('');
      setLoading(true);
      const result = await login(email, password);
      console.log('Login successful:', result.user?.uid);
      
      // Show success toast
      toast({
        title: 'Login successful!',
        description: 'Welcome back to TravelVibe.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      console.log('Redirecting to page');
      // Redirect to page
      navigate('/search');
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
      console.log('Login process completed');
    }
  };

  return (
    <Box maxW="md" mx="auto" mt="10">
      <VStack spacing="5" align="stretch">
        <Heading textAlign="center">Log In</Heading>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
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
            
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter your password"
                />
                <InputRightElement>
                  <IconButton
                    icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
            
            <Button 
              type="submit" 
              colorScheme="teal" 
              width="100%" 
              isLoading={loading}
            >
              Log In
            </Button>
          </VStack>
        </form>
        
        <Text textAlign="center">
          Don't have an account? <Link to="/signup" style={{ color: 'teal' }}>Sign Up</Link>
        </Text>
        
        <Text textAlign="center">
          <Link to="/forgot-password" style={{ color: 'teal' }}>Forgot Password?</Link>
        </Text>
      </VStack>
    </Box>
  );
} 