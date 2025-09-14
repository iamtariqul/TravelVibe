import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  Image,
  Flex,
  Badge,
  Icon,
  Button,
  HStack,
  VStack,
  Divider,
  useColorModeValue,
  SimpleGrid,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Center,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import {
  FaStar,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaUsers,
  FaWifi,
  FaSwimmingPool,
  FaSnowflake,
  FaUtensils,
  FaMountain,
  FaHeart,
  FaShare,
  FaRegCalendarAlt,
  FaParking,
  FaTv,
  FaFire,
  FaHotTub,
  FaTshirt,
  FaDumbbell,
  FaLaptop,
} from 'react-icons/fa';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import AddReview from '../components/reviews/AddReview';

// Map amenity keys to icons
const amenityIcons = {
  wifi: FaWifi,
  kitchen: FaUtensils,
  airConditioning: FaSnowflake,
  heating: FaFire,
  tv: FaTv,
  parking: FaParking,
  pool: FaSwimmingPool,
  hotTub: FaHotTub,
  washer: FaTshirt,
  dryer: FaTshirt,
  workspace: FaLaptop,
  gym: FaDumbbell,
  oceanView: FaMountain,
};

// Helper function to format amenity names
const formatAmenityName = (key) => {
  if (key === 'wifi') return 'WiFi';
  if (key === 'tv') return 'TV';
  if (key === 'airConditioning') return 'Air Conditioning';
  if (key === 'oceanView') return 'Ocean View';
  if (key === 'hotTub') return 'Hot Tub';
  
  // Convert camelCase to Title Case
  return key.replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [nights, setNights] = useState(5); // Default to 5 nights
  const { currentUser } = useAuth();
  const toast = useToast();
  const db = getFirestore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Move useColorModeValue hooks to the top level
  const reviewBgColor = useColorModeValue('gray.50', 'gray.700');
  const bookingWidgetBgColor = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        setLoading(true);
        
        // Fetch property details
        const propertyRef = doc(db, "listings", id);
        const propertySnap = await getDoc(propertyRef)
          .catch(error => {
            console.error("Error accessing property:", error);
            // Check if it's a permissions error
            if (error.code === 'permission-denied') {
              toast({
                title: "Access Denied",
                description: "You don't have permission to view this property. It may be inactive or private.",
                status: "error",
                duration: 5000,
                isClosable: true,
              });
            }
            return null;
          });
        
        // Handle null response from catch block
        if (!propertySnap) {
          navigate('/search');
          return;
        }
        
        if (!propertySnap.exists()) {
          toast({
            title: "Property not found",
            description: "The property you're looking for doesn't exist or has been removed",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          navigate('/search');
          return;
        }
        
        const propertyData = propertySnap.data();
        
        // If the property is not active and user is not the host, redirect
        if (propertyData.status !== 'active' && 
            (!currentUser || currentUser.uid !== propertyData.hostId)) {
          toast({
            title: "Property Not Available",
            description: "This property is currently not available for booking.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          navigate('/search');
          return;
        }
        
        setProperty({
          id: propertySnap.id,
          ...propertyData,
          // Ensure these fields exist
          rating: propertyData.rating || 0,
          reviews: propertyData.reviews || 0,
        });
        
        // Fetch reviews for this property
        try {
          const reviewsRef = collection(db, "reviews");
          const q = query(
            reviewsRef, 
            where("propertyId", "==", id),
            orderBy("createdAt", "desc")
          );
          const reviewsSnap = await getDocs(q);
          
          const reviewsData = [];
          reviewsSnap.forEach((doc) => {
            reviewsData.push({ id: doc.id, ...doc.data() });
          });
          
          setReviews(reviewsData);
        } catch (indexError) {
          console.error("Index error for reviews, falling back to unordered query:", indexError);
          
          // Fallback to a simple query without ordering
          const reviewsRef = collection(db, "reviews");
          const simpleQuery = query(reviewsRef, where("propertyId", "==", id));
          const fallbackSnap = await getDocs(simpleQuery);
          
          const reviewsData = [];
          fallbackSnap.forEach((doc) => {
            reviewsData.push({ id: doc.id, ...doc.data() });
          });
          
          setReviews(reviewsData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching property data:", error);
        toast({
          title: "Error",
          description: "Failed to load property details",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };
    
    if (id) {
      fetchPropertyData();
    }
  }, [id, db, navigate, toast]);

  // Calculate nights when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate);
      const end = new Date(checkOutDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays || 1); // Ensure at least 1 night
    }
  }, [checkInDate, checkOutDate]);

  const handleBooking = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to book this property",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }
    
    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Dates required",
        description: "Please select check-in and check-out dates",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // In a real app, this would navigate to a booking confirmation page
    // or process the booking
    navigate(`/booking/${id}?checkin=${checkInDate}&checkout=${checkOutDate}&guests=${guestCount}`);
  };

  const handleAddReview = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to leave a review",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }
    
    // Check if user is the host
    if (property.hostId === currentUser.uid) {
      toast({
        title: "Cannot review own property",
        description: "You cannot review your own property listing",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    onOpen();
  };

  const handleReviewAdded = (newReview) => {
    // Add the new review to the top of the list
    setReviews([newReview, ...reviews]);
    
    // Update the property's review count and rating
    setProperty(prev => ({
      ...prev,
      reviews: prev.reviews + 1,
      rating: prev.rating + ((newReview.rating - prev.rating) / 10) // Adjust rating slightly
    }));
    
    // Close the modal
    onClose();
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  if (!property) {
    return (
      <Container maxW="container.xl" py={10}>
        <Text>Property not found</Text>
      </Container>
    );
  }

  // Calculate total price
  const cleaningFee = 60;
  const serviceFee = 80;
  const totalPrice = (property.price * nights) + cleaningFee + serviceFee;

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <Heading mb={2}>{property.title}</Heading>
        <Flex justify="space-between" align="center" mb={6}>
          <Flex align="center">
            <Icon as={FaStar} color="yellow.400" mr={1} />
            <Text fontWeight="bold">{property.rating.toFixed(1)}</Text>
            <Text ml={1} color="gray.500">
              ({property.reviews} reviews) • 
            </Text>
            <Flex align="center" ml={2}>
              <Icon as={FaMapMarkerAlt} color="gray.500" mr={1} />
              <Text color="gray.500">{property.location}</Text>
            </Flex>
          </Flex>
          <HStack>
            <Button leftIcon={<FaShare />} variant="ghost">
              Share
            </Button>
            <Button leftIcon={<FaHeart />} variant="ghost">
              Save
            </Button>
          </HStack>
        </Flex>

        {/* Property Images */}
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }}
          templateRows={{ base: 'repeat(5, 1fr)', md: 'repeat(2, 1fr)' }}
          gap={4}
          mb={8}
          height={{ base: 'auto', md: '500px' }}
        >
          <GridItem colSpan={{ base: 1, md: 2 }} rowSpan={{ base: 1, md: 2 }}>
            <Image
              src={property.images && property.images.length > 0 ? property.images[0] : ''}
              alt={property.title}
              h="100%"
              w="100%"
              objectFit="cover"
              borderRadius="lg"
            />
          </GridItem>
          {property.images && property.images.slice(1, 5).map((image, idx) => (
            <GridItem key={idx} colSpan={1} rowSpan={1}>
              <Image
                src={image}
                alt={`${property.title} - image ${idx + 1}`}
                h="100%"
                w="100%"
                objectFit="cover"
                borderRadius="lg"
              />
            </GridItem>
          ))}
        </Grid>

        {/* Property Info and Booking */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Left Column - Property Details */}
          <GridItem>
            <Flex 
              justify="space-between" 
              align={{ base: 'flex-start', sm: 'center' }} 
              mb={6}
              direction={{ base: 'column', sm: 'row' }}
            >
              <Box mb={{ base: 4, sm: 0 }}>
                <Heading as="h3" size="lg">
                  {property.type} hosted by {property.hostName || 'Host'}
                </Heading>
                <Flex mt={1}>
                  <Text>{property.beds} beds</Text>
                  <Text mx={2}>•</Text>
                  <Text>{property.baths} baths</Text>
                  <Text mx={2}>•</Text>
                  <Text>Up to {property.guests} guests</Text>
                </Flex>
              </Box>
              <Avatar 
                size="lg" 
                src={property.hostImage || ''} 
                name={property.hostName || 'Host'} 
              />
            </Flex>

            <Divider mb={6} />

            {/* Property Description */}
            <Box mb={8}>
              <Heading as="h3" size="md" mb={4}>
                About this place
              </Heading>
              <Text>{property.description}</Text>
            </Box>

            <Divider mb={6} />

            {/* Amenities */}
            <Box mb={8}>
              <Heading as="h3" size="md" mb={4}>
                What this place offers
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {property.amenities && Object.entries(property.amenities)
                  .filter(([_, value]) => value === true)
                  .map(([key]) => (
                    <Flex key={key} align="center">
                      <Icon as={amenityIcons[key] || FaMountain} color="teal.500" mr={2} />
                      <Text>{formatAmenityName(key)}</Text>
                    </Flex>
                  ))
                }
              </SimpleGrid>
            </Box>

            <Divider mb={6} />

            {/* Reviews */}
            <Box mb={8}>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading as="h3" size="md">
                  <Flex align="center">
                    <Icon as={FaStar} color="yellow.400" mr={2} />
                    {property.rating.toFixed(1)} · {property.reviews} reviews
                  </Flex>
                </Heading>
                <Button 
                  colorScheme="teal" 
                  variant="outline" 
                  onClick={handleAddReview}
                >
                  Write a Review
                </Button>
              </Flex>

              <VStack spacing={4} align="stretch">
                {reviews.length > 0 ? (
                  reviews.slice(0, 3).map((review) => (
                    <Box key={review.id} p={4} bg={reviewBgColor} borderRadius="md">
                      <Flex mb={2}>
                        <Avatar size="sm" src={review.userAvatar || ''} name={review.userName || 'User'} mr={2} />
                        <Box>
                          <Text fontWeight="bold">{review.userName || 'User'}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long' 
                            }) : 'Recent'}
                          </Text>
                        </Box>
                        <Flex ml="auto" align="center">
                          <Icon as={FaStar} color="yellow.400" mr={1} />
                          <Text>{review.rating}</Text>
                        </Flex>
                      </Flex>
                      <Text>{review.comment}</Text>
                    </Box>
                  ))
                ) : (
                  <Text color="gray.500">No reviews yet</Text>
                )}
                {reviews.length > 3 && (
                  <Button variant="outline" colorScheme="teal" width="full">
                    Show all {reviews.length} reviews
                  </Button>
                )}
              </VStack>
            </Box>
          </GridItem>

          {/* Right Column - Booking Widget */}
          <GridItem>
            <Box 
              position="sticky"
              top="20px"
              p={6}
              borderRadius="lg"
              boxShadow="lg"
              bg={bookingWidgetBgColor}
              borderWidth="1px"
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="2xl" fontWeight="bold">
                  ৳{property.price} <Text as="span" fontSize="md" fontWeight="normal">night</Text>
                </Text>
                <Flex align="center">
                  <Icon as={FaStar} color="yellow.400" mr={1} />
                  <Text fontWeight="bold">{property.rating.toFixed(1)}</Text>
                  <Text ml={1} color="gray.500">({property.reviews})</Text>
                </Flex>
              </Flex>

              <VStack spacing={4} align="stretch">
                <Flex>
                  <Box 
                    flex="1" 
                    p={2} 
                    border="1px" 
                    borderColor="gray.200" 
                    borderTopLeftRadius="md"
                    borderBottomLeftRadius="md"
                  >
                    <Text fontSize="xs" fontWeight="bold">CHECK-IN</Text>
                    <input 
                      type="date" 
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      style={{ border: 'none', width: '100%' }}
                    />
                  </Box>
                  <Box 
                    flex="1" 
                    p={2} 
                    border="1px" 
                    borderColor="gray.200"
                    borderLeftWidth="0"
                    borderTopRightRadius="md"
                    borderBottomRightRadius="md"
                  >
                    <Text fontSize="xs" fontWeight="bold">CHECK-OUT</Text>
                    <input 
                      type="date" 
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      style={{ border: 'none', width: '100%' }}
                    />
                  </Box>
                </Flex>

                <Box p={2} border="1px" borderColor="gray.200" borderRadius="md">
                  <Text fontSize="xs" fontWeight="bold">GUESTS</Text>
                  <select 
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    style={{ border: 'none', width: '100%' }}
                  >
                    {[...Array(property.guests)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'guest' : 'guests'}
                      </option>
                    ))}
                  </select>
                </Box>

                <Button 
                  colorScheme="teal" 
                  size="lg" 
                  width="full"
                  onClick={handleBooking}
                >
                  Reserve
                </Button>

                <Text textAlign="center">You won't be charged yet</Text>

                <Box mt={4}>
                  <Flex justify="space-between" mb={2}>
                    <Text>৳{property.price} x {nights} nights</Text>
                    <Text>৳{property.price * nights}</Text>
                  </Flex>
                  <Flex justify="space-between" mb={2}>
                    <Text>Cleaning fee</Text>
                    <Text>৳{cleaningFee}</Text>
                  </Flex>
                  <Flex justify="space-between" mb={2}>
                    <Text>Service fee</Text>
                    <Text>৳{serviceFee}</Text>
                  </Flex>
                  <Divider my={4} />
                  <Flex justify="space-between" fontWeight="bold">
                    <Text>Total</Text>
                    <Text>৳{totalPrice}</Text>
                  </Flex>
                </Box>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Container>

      {/* Add Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Write a Review</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <AddReview 
              propertyId={id} 
              propertyHostId={property.hostId}
              onReviewAdded={handleReviewAdded}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
} 