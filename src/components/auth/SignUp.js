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
  InputGroup,
  InputRightElement,
  IconButton,
  useToast
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignUp() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('SignUp form submitted');
    
    if (!email || !password || !confirmPassword || !displayName) {
      console.log('Missing fields');
      return setError('Please fill in all fields');
    }
    
    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      return setError('Passwords do not match');
    }
    
    if (password.length < 6) {
      console.log('Password too short');
      return setError('Password must be at least 6 characters');
    }
    
    try {
      console.log('Attempting to sign up with:', { email, displayName });
      setError('');
      setLoading(true);
      
      // Call signup function
      const user = await signup(email, password, displayName);
      console.log('Signup successful, user:', user);
      
      // Sign out the user immediately after signup to ensure they need to log in again
      try {
        await logout();
        console.log('User logged out after signup');
      } catch (logoutError) {
        console.error('Error during logout after signup:', logoutError);
        // Continue despite logout error
      }
      
      // Show success toast
      toast({
        title: 'Account created successfully!',
        description: 'Please log in with your new account.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      console.log('Redirecting to login page');
      
      // Force redirect to login page
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('Signup error details:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please use a different email or log in.');
      } else {
        setError(`Failed to create an account: ${error.message || error}`);
      }
    } finally {
      setLoading(false);
      console.log('Signup process completed');
    }
  };

  return (
    <Box maxW="md" mx="auto" mt="10">
      <VStack spacing="5" align="stretch">
        <Heading textAlign="center">Sign Up</Heading>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <VStack spacing="4">
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input 
                type="text" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="Enter your full name"
              />
            </FormControl>
            
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
            
            <FormControl isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup>
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Confirm your password"
                />
                <InputRightElement>
                  <IconButton
                    icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    variant="ghost"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
              Sign Up
            </Button>
          </VStack>
        </form>
        
        <Text textAlign="center">
          Already have an account? <Link to="/login" style={{ color: 'teal' }}>Log In</Link>
        </Text>
      </VStack>
    </Box>
  );
} 