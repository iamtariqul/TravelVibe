import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Image,
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast
} from '@chakra-ui/react';
import { FaBed, FaBath, FaUsers, FaEllipsisV, FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function MyListings() {
  const { currentUser, getUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const db = getFirestore();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!currentUser) {
          toast({
            title: "Authentication required",
            description: "Please log in to view your listings",
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
        
        fetchListings();
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [currentUser, getUserProfile, navigate, toast]);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, where("hostId", "==", currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const listingsData = [];
      querySnapshot.forEach((doc) => {
        listingsData.push({ id: doc.id, ...doc.data() });
      });
      
      setListings(listingsData);
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast({
        title: "Error",
        description: "Failed to load your listings",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewListing = (listingId) => {
    navigate(`/property/${listingId}`);
  };

  const handleEditListing = (listingId) => {
    navigate(`/edit-listing/${listingId}`);
  };

  const confirmDelete = (listing) => {
    setSelectedListing(listing);
    onOpen();
  };

  const handleDeleteListing = async () => {
    if (!selectedListing) return;
    
    try {
      await deleteDoc(doc(db, "listings", selectedListing.id));
      
      setListings(prev => prev.filter(listing => listing.id !== selectedListing.id));
      
      toast({
        title: "Listing deleted",
        description: "Your property listing has been removed",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast({
        title: "Error",
        description: "Failed to delete listing",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleStatus = async (listing) => {
    const newStatus = listing.status === 'active' ? 'inactive' : 'active';
    
    try {
      await updateDoc(doc(db, "listings", listing.id), {
        status: newStatus
      });
      
      setListings(prev => prev.map(item => 
        item.id === listing.id ? { ...item, status: newStatus } : item
      ));
      
      toast({
        title: `Listing ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
        description: `Your property is now ${newStatus === 'active' ? 'visible to' : 'hidden from'} guests`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating listing status:", error);
      toast({
        title: "Error",
        description: "Failed to update listing status",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="xl">My Listings</Heading>
            <Text color="gray.500" mt={1}>
              Manage your property listings
            </Text>
          </Box>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="teal"
            onClick={() => navigate('/create-listing')}
          >
            Add New Listing
          </Button>
        </Flex>

        {listings.length === 0 ? (
          <Alert
            status="info"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="200px"
            borderRadius="md"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              No listings yet
            </AlertTitle>
            <Text>
              Create your first property listing to start hosting guests.
            </Text>
            <Button
              mt={4}
              colorScheme="teal"
              onClick={() => navigate('/create-listing')}
            >
              Create Listing
            </Button>
          </Alert>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {listings.map((listing) => (
              <Box
                key={listing.id}
                bg={bgColor}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Box position="relative">
                  <Image
                    src={listing.mainImage || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={listing.title}
                    h="200px"
                    w="100%"
                    objectFit="cover"
                  />
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme={listing.status === 'active' ? 'green' : 'red'}
                    fontSize="xs"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {listing.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </Box>

                <Box p={5}>
                  <Heading size="md" noOfLines={1} mb={2}>
                    {listing.title}
                  </Heading>
                  
                  <Text fontSize="lg" fontWeight="bold" color="teal.500" mb={3}>
                    ৳{listing.price} <Text as="span" fontSize="sm" fontWeight="normal">night</Text>
                  </Text>
                  
                  <Text color="gray.500" fontSize="sm" mb={4} noOfLines={2}>
                    {listing.location}
                  </Text>
                  
                  <HStack spacing={4} mb={4}>
                    <Flex align="center">
                      <Icon as={FaBed} color="gray.500" mr={1} />
                      <Text fontSize="sm">{listing.beds} beds</Text>
                    </Flex>
                    <Flex align="center">
                      <Icon as={FaBath} color="gray.500" mr={1} />
                      <Text fontSize="sm">{listing.baths} baths</Text>
                    </Flex>
                    <Flex align="center">
                      <Icon as={FaUsers} color="gray.500" mr={1} />
                      <Text fontSize="sm">{listing.guests} guests</Text>
                    </Flex>
                  </HStack>
                  
                  <Flex justify="space-between" align="center">
                    <Button
                      leftIcon={<FaEye />}
                      variant="outline"
                      colorScheme="teal"
                      size="sm"
                      onClick={() => handleViewListing(listing.id)}
                    >
                      View
                    </Button>
                    
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FaEllipsisV />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem 
                          icon={<FaEdit />} 
                          onClick={() => handleEditListing(listing.id)}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem 
                          icon={listing.status === 'active' ? <FaEye /> : <FaEye />} 
                          onClick={() => handleToggleStatus(listing)}
                        >
                          {listing.status === 'active' ? 'Deactivate' : 'Activate'}
                        </MenuItem>
                        <MenuItem 
                          icon={<FaTrash />} 
                          color="red.500"
                          onClick={() => confirmDelete(listing)}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete "{selectedListing?.title}"? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteListing}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
} 