import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Checkbox,
  useColorModeValue,
  Divider,
  useToast,
  Spinner,
  Center,
  InputGroup,
  InputLeftElement,
  Icon,
  Image,
  Flex,
  IconButton
} from '@chakra-ui/react';
import { FaBed, FaBath, FaUsers, FaMoneyBillWave, FaPlus, FaLink, FaTrash } from 'react-icons/fa';
import { getFirestore, collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';

export default function CreateListing() {
  const { currentUser, getUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const navigate = useNavigate();
  const toast = useToast();
  const db = getFirestore();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    location: '',
    address: '',
    price: 100,
    beds: 1,
    baths: 1,
    guests: 2,
    amenities: {
      wifi: false,
      kitchen: false,
      airConditioning: false,
      heating: false,
      tv: false,
      parking: false,
      pool: false,
      hotTub: false,
      washer: false,
      dryer: false,
      workspace: false,
      gym: false
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!currentUser) {
          toast({
            title: "Authentication required",
            description: "Please log in to create a listing",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          navigate('/login');
          return;
        }

        const profile = await getUserProfile();
        setUserProfile(profile);
        
        if (!profile || profile.userType !== 'host') {
          toast({
            title: "Host status required",
            description: "You need to become a host first",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
          navigate('/become-host');
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [currentUser, getUserProfile, navigate, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name, value) => {
    // Ensure value is a valid number
    const numericValue = isNaN(value) ? 0 : value;
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity]
      }
    }));
  };

  const handleImageUrlChange = (e) => {
    setCurrentImageUrl(e.target.value);
  };

  const isValidImageUrl = (url) => {
    try {
      new URL(url); // Just check if it's a valid URL
      return true;
    } catch (e) {
      return false;
    }
  };

  const addImageUrl = () => {
    if (!currentImageUrl) {
      toast({
        title: "Empty URL",
        description: "Please enter an image URL",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!isValidImageUrl(currentImageUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (imageUrls.length >= 5) {
      toast({
        title: "Maximum images reached",
        description: "You can add a maximum of 5 images",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setImageUrls([...imageUrls, currentImageUrl]);
    setCurrentImageUrl('');
  };

  const removeImage = (index) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (imageUrls.length === 0) {
      toast({
        title: "Images required",
        description: "Please add at least one image URL of your property",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("CreateListing.js: Starting to create new listing");
      
      // Create listing document in Firestore
      const listingData = {
        ...formData,
        images: imageUrls,
        mainImage: imageUrls[0],
        hostId: currentUser.uid,
        hostName: userProfile.displayName || 'Host',
        hostImage: userProfile.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active',
        rating: 0,
        reviews: 0
      };
      
      console.log("CreateListing.js: Prepared listing data:", listingData);
      
      const docRef = await addDoc(collection(db, "listings"), listingData);
      console.log(`CreateListing.js: Listing created successfully with ID: ${docRef.id}`);
      
      // Double-check that the document was created with the correct status
      const docSnap = await getDoc(doc(db, "listings", docRef.id));
      if (docSnap.exists()) {
        console.log("CreateListing.js: Verification - Created document data:", docSnap.data());
      } else {
        console.error("CreateListing.js: Verification failed - Document does not exist after creation");
      }
      
      toast({
        title: "Success!",
        description: "Your property has been listed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Store the listing ID in session storage for reference
      sessionStorage.setItem('lastCreatedListingId', docRef.id);
      
      navigate(`/property/${docRef.id}`);
    } catch (error) {
      console.error("CreateListing.js: Error creating listing:", error);
      toast({
        title: "Error",
        description: "Failed to create listing. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to navigate to search page
  const goToSearchPage = () => {
    navigate('/search');
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl">Create Your Listing</Heading>
          <Text mt={2} color="gray.500">
            Share your space with travelers from around the world
          </Text>
        </Box>

        <Box
          as="form"
          onSubmit={handleSubmit}
          bg={bgColor}
          p={8}
          borderRadius="lg"
          boxShadow="md"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <VStack spacing={6} align="stretch">
            {/* Basic Information */}
            <Box>
              <Heading size="md" mb={4}>Basic Information</Heading>
              
              <FormControl isRequired mb={4}>
                <FormLabel>Listing Title</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Cozy Beachfront Villa with Ocean View"
                />
              </FormControl>
              
              <FormControl isRequired mb={4}>
                <FormLabel>Property Type</FormLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="Select property type"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Villa">Villa</option>
                  <option value="Cabin">Cabin</option>
                  <option value="Condo">Condo</option>
                  <option value="Loft">Loft</option>
                  <option value="Treehouse">Treehouse</option>
                  <option value="Boat">Boat</option>
                </Select>
              </FormControl>
              
              <FormControl isRequired mb={4}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your property, its unique features, and what guests can expect"
                  rows={5}
                />
              </FormControl>
            </Box>
            
            <Divider />
            
            {/* Location */}
            <Box>
              <Heading size="md" mb={4}>Location</Heading>
              
              <FormControl isRequired mb={4}>
                <FormLabel>City/Area</FormLabel>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Miami Beach, FL"
                />
              </FormControl>
              
              <FormControl isRequired mb={4}>
                <FormLabel>Full Address</FormLabel>
                <Textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter the full address of your property"
                  rows={3}
                />
                <FormHelperText>
                  This will not be shared publicly. Only confirmed guests will see this.
                </FormHelperText>
              </FormControl>
            </Box>
            
            <Divider />
            
            {/* Details */}
            <Box>
              <Heading size="md" mb={4}>Property Details</Heading>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                <FormControl isRequired>
                  <FormLabel>
                    <HStack>
                      <Icon as={FaBed} />
                      <Text>Beds</Text>
                    </HStack>
                  </FormLabel>
                  <NumberInput
                    min={1}
                    max={20}
                    value={formData.beds}
                    onChange={(value) => handleNumberChange('beds', parseInt(value))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>
                    <HStack>
                      <Icon as={FaBath} />
                      <Text>Bathrooms</Text>
                    </HStack>
                  </FormLabel>
                  <NumberInput
                    min={1}
                    max={10}
                    step={0.5}
                    value={formData.baths}
                    onChange={(value) => handleNumberChange('baths', parseFloat(value))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>
                    <HStack>
                      <Icon as={FaUsers} />
                      <Text>Max Guests</Text>
                    </HStack>
                  </FormLabel>
                  <NumberInput
                    min={1}
                    max={30}
                    value={formData.guests}
                    onChange={(value) => handleNumberChange('guests', parseInt(value))}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
              
              <FormControl isRequired mb={4}>
                <FormLabel>
                  <HStack>
                    <Icon as={FaMoneyBillWave} />
                    <Text>Price per Night (৳)</Text>
                  </HStack>
                </FormLabel>
                <NumberInput
                  min={1}
                  value={formData.price}
                  onChange={(value) => handleNumberChange('price', parseInt(value))}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Box>
            
            <Divider />
            
            {/* Amenities */}
            <Box>
              <Heading size="md" mb={4}>Amenities</Heading>
              <Text mb={4} color="gray.500">
                Select all amenities available at your property
              </Text>
              
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                <Checkbox
                  isChecked={formData.amenities.wifi}
                  onChange={() => handleAmenityChange('wifi')}
                >
                  WiFi
                </Checkbox>
                <Checkbox
                  isChecked={formData.amenities.kitchen}
                  onChange={() => handleAmenityChange('kitchen')}
                >
                  Kitchen
                </Checkbox>
                <Checkbox
                  isChecked={formData.amenities.airConditioning}
                  onChange={() => handleAmenityChange('airConditioning')}
                >
                  Air Conditioning
                </Checkbox>
                <Checkbox
                  isChecked={formData.amenities.heating}
                  onChange={() => handleAmenityChange('heating')}
                >
                  Heating
                </Checkbox>
                <Checkbox
                  isChecked={formData.amenities.tv}
                  onChange={() => handleAmenityChange('tv')}
                >
                  TV
                </Checkbox>
                <Checkbox
                  isChecked={formData.amenities.parking}
                  onChange={() => handleAmenityChange('parking')}
                >
                  Free Parking
                </Checkbox>
                <Checkbox
                  isChecked={formData.amenities.pool}
                  onChange={() => handleAmenityChange('pool')}
                >
                  Pool
                </Checkbox>
                <Checkbox
                  isChecked={formData.amenities.hotTub}
                  onChange={() => handleAmenityChange('hotTub')}
                >
                  Hot Tub
                </Checkbox>
                <Checkbox
                  isChecked={formData.amenities.washer}
                  onChange={() => handleAmenityChange('washer')}
                >
                  Washer
                </Checkbox>
                <Checkbox
                  isChecked={formData.amenities.dryer}
                  onChange={() => handleAmenityChange('dryer')}
                >
                  Dryer
                </Checkbox>
                <Checkbox
                  isChecked={formData.amenities.workspace}
                  onChange={() => handleAmenityChange('workspace')}
                >
                  Workspace
                </Checkbox>
                <Checkbox
                  isChecked={formData.amenities.gym}
                  onChange={() => handleAmenityChange('gym')}
                >
                  Gym
                </Checkbox>
              </SimpleGrid>
            </Box>
            
            <Divider />
            
            {/* Images */}
            <Box>
              <Heading size="md" mb={4}>Property Images</Heading>
              <Text mb={4} color="gray.500">
                Add image URLs of your property (minimum 1 image, maximum 5 images)
              </Text>
              
              <FormControl mb={6}>
                <FormLabel>Image URL</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaLink} color="gray.500" />
                  </InputLeftElement>
                  <Input
                    value={currentImageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button
                    ml={2}
                    leftIcon={<FaPlus />}
                    onClick={addImageUrl}
                    colorScheme="teal"
                  >
                    Add
                  </Button>
                </InputGroup>
                <FormHelperText>
                  Enter any valid URL to an image
                </FormHelperText>
              </FormControl>
              
              {imageUrls.length > 0 && (
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    Added Images ({imageUrls.length}/5):
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {imageUrls.map((url, index) => (
                      <Box key={index} position="relative" borderWidth="1px" borderRadius="md" overflow="hidden">
                        <Image
                          src={url}
                          alt={`Property image ${index + 1}`}
                          height="200px"
                          width="100%"
                          objectFit="cover"
                          fallbackSrc="https://via.placeholder.com/300x200?text=Image+Not+Found"
                        />
                        <HStack 
                          position="absolute" 
                          bottom={0} 
                          left={0} 
                          right={0} 
                          bg="blackAlpha.700" 
                          p={2} 
                          justify="space-between"
                        >
                          <Text color="white" fontSize="sm">
                            {index === 0 ? "Cover Photo" : `Image ${index + 1}`}
                          </Text>
                          <IconButton
                            icon={<FaTrash />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeImage(index)}
                            aria-label="Remove image"
                          />
                        </HStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </Box>
            
            <Divider mt={6} />
            
            <Box textAlign="center">
              <Button
                type="submit"
                colorScheme="teal"
                size="lg"
                isLoading={isSubmitting}
                loadingText="Creating Listing"
                px={12}
                mb={4}
              >
                Create Listing
              </Button>
              
              {/* Add a link to go directly to search page */}
              <Text mt={4} color="gray.500">
                After creating your listing, you can 
                <Button 
                  variant="link" 
                  colorScheme="teal" 
                  onClick={goToSearchPage}
                  ml={1}
                >
                  view all listings
                </Button>
              </Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
} 