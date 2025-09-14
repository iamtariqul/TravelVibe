import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Grid,
  GridItem,
  VStack,
  Image,
  Flex,
  useColorModeValue,
  Select,
  HStack,
} from '@chakra-ui/react';
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUserFriends } from 'react-icons/fa';

export default function Home() {
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [guests, setGuests] = useState(1);
  const navigate = useNavigate();
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.append('location', searchLocation);
    if (searchCategory) params.append('category', searchCategory);
    if (guests > 1) params.append('guests', guests);
    navigate(`/search?${params.toString()}`);
  };

  const handleDestinationClick = (destinationName, category) => {
    navigate(`/search?location=${encodeURIComponent(destinationName)}&category=${encodeURIComponent(category)}`);
  };
  
  const popularDestinations = [
    { id: 1, name: 'Coxs Bazar', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'Beach' },
    { id: 2, name: 'Sajek Valley', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'Culture' },
    { id: 3, name: 'Sundarban', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'Island' },
    { id: 4, name: 'Sreemangal', image: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', category: 'Mountain' },
  ];

  // Move useColorModeValue calls to the top level
  const sectionBgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgImage="url('https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
        height="600px"
        position="relative"
        _after={{
          content: '""',
          position: 'absolute',
          width: '100%',
          height: '100%',
          bgColor: 'blackAlpha.600',
          top: 0,
          left: 0,
        }}
      >
        <Container maxW={'6xl'} height="full" position="relative" zIndex="1">
          <Stack
            textAlign={'center'}
            spacing={{ base: 8, md: 10 }}
            py={{ base: 20, md: 28 }}
            direction={'column'}
            align={'center'}
            justify={'center'}
            height="full"
          >
            <Heading
              fontWeight={600}
              fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
              lineHeight={'110%'}
              color="white"
            >
              Find your perfect <Text as={'span'} color={'teal.400'}>vacation stay</Text>
            </Heading>
            <Text color={'gray.100'} maxW={'3xl'}>
              Discover amazing places to stay around the world with TravelVibe.
              Book unique homes, apartments, and experiences.
            </Text>
            <Box width={'full'} maxW={'md'} bg="white" p={4} borderRadius="lg">
              <VStack spacing={5}>
                <InputGroup>
                  <Input
                    placeholder="Where are you going?"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    size="lg"
                    fontSize="md"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                  <InputRightElement top="4px" right="4px">
                    <Button colorScheme="teal" onClick={handleSearch}>
                      <Icon as={FaSearch} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <HStack spacing={3} width="full">
                  <Select 
                    placeholder="Category"
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    bg="white"
                    borderColor="gray.300"
                  >
                    <option value="Beach">Beach</option>
                    <option value="Mountain">Mountain</option>
                    <option value="City">City</option>
                    <option value="Island">Island</option>
                    <option value="Culture">Culture</option>
                  </Select>
                  
                  <Select 
                    placeholder="Guests"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    bg="white"
                    borderColor="gray.300"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                    <option value={5}>5+ Guests</option>
                  </Select>
                  
                  <Button 
                    colorScheme="teal"
                    onClick={handleSearch}
                    px={8}
                    leftIcon={<FaSearch />}
                  >
                    Search
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Popular Destinations Section */}
      <Box py={10} bg={sectionBgColor}>
        <Container maxW={'6xl'}>
          <Heading as="h2" size="xl" mb={6}>
            Popular Destinations
          </Heading>
          <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
            {popularDestinations.map((destination) => (
              <GridItem 
                key={destination.id} 
                cursor="pointer" 
                onClick={() => handleDestinationClick(destination.name, destination.category)}
              >
                <Box 
                  borderRadius="lg" 
                  overflow="hidden" 
                  bg="white" 
                  boxShadow="md"
                  transition="all 0.3s"
                  _hover={{ 
                    transform: 'translateY(-5px)', 
                    boxShadow: 'xl',
                    borderColor: 'teal.400',
                    borderWidth: '2px'
                  }}
                  border="2px solid transparent"
                >
                  <Image src={destination.image} alt={destination.name} h="200px" w="100%" objectFit="cover" />
                  <Box p={4}>
                    <Text fontWeight="bold" fontSize="lg">{destination.name}</Text>
                    <Flex align="center" mt={2}>
                      <Icon as={FaMapMarkerAlt} color="teal.500" mr={2} />
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        {destination.category}
                      </Text>
                    </Flex>
                  </Box>
                </Box>
              </GridItem>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box py={10}>
        <Container maxW={'5xl'}>
          <Stack
            textAlign={'center'}
            spacing={{ base: 8, md: 10 }}
            py={{ base: 10, md: 10 }}
          >
            <Heading
              fontWeight={600}
              fontSize={{ base: '3xl', sm: '4xl', md: '5xl' }}
              lineHeight={'110%'}
            >
              Become a Host <br />
              <Text as={'span'} color={'teal.400'}>
                Share your space and earn income
              </Text>
            </Heading>
            <Text color={'gray.500'} maxW={'3xl'} mx="auto">
              Turn your extra space into extra income. Join our hosts who earn an average of ৳900 per month by sharing their homes.
            </Text>
            <Stack spacing={6} direction={'row'} justify="center">
              <Button
                rounded={'full'}
                px={6}
                py={8}
                colorScheme={'teal'}
                bg={'teal.400'}
                _hover={{ bg: 'teal.500' }}
                fontSize="lg"
                onClick={() => navigate('/become-host')}
              >
                Start Hosting
              </Button>
              <Button
                rounded={'full'}
                px={6}
                py={8}
                fontSize="lg"
                onClick={() => navigate('/about')}
              >
                Learn More
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
} 