import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Badge,
  HStack,
  VStack,
  Image,
  useColorModeValue,
  Spinner,
  Center,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider
} from '@chakra-ui/react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const MyBookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const fetchBookings = async () => {
      try {
        const db = getFirestore();
        const bookingsRef = collection(db, 'bookings');
        
        // Query bookings where the current user is either the guest or host
        const guestQuery = query(bookingsRef, where('guestId', '==', currentUser.uid));
        const hostQuery = query(bookingsRef, where('hostId', '==', currentUser.uid));
        
        const [guestSnapshot, hostSnapshot] = await Promise.all([
          getDocs(guestQuery),
          getDocs(hostQuery)
        ]);
        
        const bookingsData = [];
        
        // Add guest bookings
        guestSnapshot.forEach((doc) => {
          bookingsData.push({ id: doc.id, ...doc.data() });
        });
        
        // Add host bookings
        hostSnapshot.forEach((doc) => {
          bookingsData.push({ id: doc.id, ...doc.data() });
        });
        
        // Remove any duplicates (in case a booking appears in both queries)
        const uniqueBookings = bookingsData.filter((booking, index, self) =>
          index === self.findIndex((b) => b.id === booking.id)
        );
        
        // Sort bookings by check-in date (most recent first)
        uniqueBookings.sort((a, b) => b.checkIn.toDate() - a.checkIn.toDate());
        
        setBookings(uniqueBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookings();
  }, [currentUser, navigate]);
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'completed':
        return 'blue';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  const getPastBookings = () => {
    const now = new Date();
    return bookings.filter(booking => 
      booking.checkOut.toDate() < now
    );
  };
  
  const getUpcomingBookings = () => {
    const now = new Date();
    return bookings.filter(booking => 
      booking.checkOut.toDate() >= now
    );
  };
  
  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  // Sample booking data for development
  const dummyBookings = [
    {
      id: '1',
      propertyId: 'property1',
      propertyName: 'Seaside Villa',
      propertyImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      checkIn: { toDate: () => new Date(Date.now() + 86400000 * 10) }, // 10 days from now
      checkOut: { toDate: () => new Date(Date.now() + 86400000 * 15) }, // 15 days from now
      guests: 2,
      totalPrice: 750,
      status: 'confirmed',
      location: 'Malibu, CA'
    },
    {
      id: '2',
      propertyId: 'property2',
      propertyName: 'Mountain Retreat',
      propertyImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
      checkIn: { toDate: () => new Date(Date.now() - 86400000 * 20) }, // 20 days ago
      checkOut: { toDate: () => new Date(Date.now() - 86400000 * 15) }, // 15 days ago
      guests: 4,
      totalPrice: 1200,
      status: 'completed',
      location: 'Aspen, CO'
    }
  ];
  
  // Use dummy data for development if no real bookings
  const displayBookings = bookings.length > 0 ? bookings : dummyBookings;
  const pastBookings = bookings.length > 0 ? getPastBookings() : [dummyBookings[1]];
  const upcomingBookings = bookings.length > 0 ? getUpcomingBookings() : [dummyBookings[0]];

  const BookingCard = ({ booking }) => (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden"
      bg={bgColor}
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Image 
        src={booking.propertyImage} 
        alt={booking.propertyName} 
        height="200px" 
        width="100%" 
        objectFit="cover"
      />
      
      <Box p={5}>
        <HStack justifyContent="space-between" mb={2}>
          <Heading size="md">{booking.propertyName}</Heading>
          <Badge colorScheme={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </HStack>
        
        <Text fontSize="sm" color={textColor} mb={2}>
          {booking.location}
        </Text>
        
        <Divider my={3} />
        
        <VStack spacing={2} align="stretch">
          <HStack justifyContent="space-between">
            <Text fontSize="sm" fontWeight="bold">Check-in:</Text>
            <Text fontSize="sm">{formatDate(booking.checkIn)}</Text>
          </HStack>
          
          <HStack justifyContent="space-between">
            <Text fontSize="sm" fontWeight="bold">Check-out:</Text>
            <Text fontSize="sm">{formatDate(booking.checkOut)}</Text>
          </HStack>
          
          <HStack justifyContent="space-between">
            <Text fontSize="sm" fontWeight="bold">Guests:</Text>
            <Text fontSize="sm">{booking.guests}</Text>
          </HStack>
          
          <HStack justifyContent="space-between">
            <Text fontSize="sm" fontWeight="bold">Total:</Text>
            <Text fontSize="sm">৳{booking.totalPrice}</Text>
          </HStack>
        </VStack>
        
      </Box>
    </Box>
  );

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={2}>My Bookings</Heading>
          <Text color={textColor}>Manage your trip reservations</Text>
        </Box>
        
        <Tabs colorScheme="teal" isFitted variant="enclosed">
          <TabList>
            <Tab>Upcoming Bookings ({upcomingBookings.length})</Tab>
            <Tab>Past Stays ({pastBookings.length})</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              {upcomingBookings.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {upcomingBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </SimpleGrid>
              ) : (
                <Center py={10}>
                  <VStack spacing={3}>
                    <Text fontSize="lg">No upcoming bookings</Text>
                    <Button 
                      colorScheme="teal" 
                      onClick={() => navigate('/search')}
                    >
                      Find a place to stay
                    </Button>
                  </VStack>
                </Center>
              )}
            </TabPanel>
            
            <TabPanel px={0}>
              {pastBookings.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {pastBookings.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </SimpleGrid>
              ) : (
                <Center py={10}>
                  <Text fontSize="lg">No past bookings found</Text>
                </Center>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default MyBookings; 