import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Input,
  Select,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Stack,
  Checkbox,
  Divider,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FaStar, FaMapMarkerAlt, FaBed, FaBath, FaUsers } from 'react-icons/fa';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export default function Search() {
  const [searchParams] = useSearchParams();
  const searchLocation = searchParams.get('location') || '';
  const searchCategory = searchParams.get('category') || '';
  const navigate = useNavigate();
  
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [propertyType, setPropertyType] = useState('');
  const [amenities, setAmenities] = useState({
    wifi: false,
    kitchen: false,
    pool: false,
    airConditioning: false,
    oceanView: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastCreatedListingId, setLastCreatedListingId] = useState(null);
  const [showAllListings, setShowAllListings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [filterApplyTrigger, setFilterApplyTrigger] = useState(0);
  
  const db = getFirestore();
  const toast = useToast();
  const propertyBgColor = useColorModeValue('white', 'gray.800');
  const filterBgColor = useColorModeValue('white', 'gray.700');
  const sectionBgColor = useColorModeValue('gray.50', 'gray.900');

  // Get the last created listing ID from session storage
  useEffect(() => {
    const storedListingId = sessionStorage.getItem('lastCreatedListingId');
    if (storedListingId) {
      console.log("Search.js: Found last created listing ID in session storage:", storedListingId);
      setLastCreatedListingId(storedListingId);
    }
  }, []);

  // Fetch listings from Firebase
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        setFilteredListings([]); // Clear filtered listings before fetching new ones
        const listingsRef = collection(db, "listings");
        
        console.log(`Search.js: Fetching listings with showAllListings=${showAllListings}`);
        
        // Create a query based on whether we want to show all listings or just active ones
        let q;
        
        if (showAllListings) {
          // Show all listings regardless of status
          try {
            console.log("Search.js: Attempting to query all listings with ordering");
            q = query(listingsRef, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            
            console.log(`Search.js: Query successful, found ${querySnapshot.size} listings (all statuses)`);
            
            const listingsData = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              console.log(`Search.js: Processing listing ${doc.id}:`, data);
              
              listingsData.push({
                id: doc.id,
                title: data.title,
                location: data.location,
                price: data.price,
                rating: data.rating || 0,
                reviews: data.reviews || 0,
                image: data.mainImage || (data.images && data.images.length > 0 ? data.images[0] : ''),
                images: data.images || [],
                beds: data.beds,
                baths: data.baths,
                guests: data.guests,
                type: data.type,
                status: data.status || 'unknown',
                amenities: Object.entries(data.amenities || {})
                  .filter(([_, value]) => value === true)
                  .map(([key]) => {
                    // Convert camelCase to readable format
                    return key === 'wifi' ? 'WiFi' :
                           key === 'airConditioning' ? 'Air conditioning' :
                           key === 'oceanView' ? 'Ocean view' :
                           key.charAt(0).toUpperCase() + key.slice(1);
                  })
              });
            });
            
            console.log("Search.js: Processed all listings:", listingsData);
            setAllListings(listingsData);
          } catch (indexError) {
            console.error("Search.js: Index error for all listings, falling back to unordered query:", indexError);
            
            // Fallback to simple query without ordering
            q = query(listingsRef);
            const fallbackSnapshot = await getDocs(q);
            
            const listingsData = [];
            fallbackSnapshot.forEach((doc) => {
              const data = doc.data();
              console.log(`Search.js: Processing listing ${doc.id} from fallback:`, data);
              
              listingsData.push({
                id: doc.id,
                title: data.title,
                location: data.location,
                price: data.price,
                rating: data.rating || 0,
                reviews: data.reviews || 0,
                image: data.mainImage || (data.images && data.images.length > 0 ? data.images[0] : ''),
                images: data.images || [],
                beds: data.beds,
                baths: data.baths,
                guests: data.guests,
                type: data.type,
                status: data.status || 'unknown',
                amenities: Object.entries(data.amenities || {})
                  .filter(([_, value]) => value === true)
                  .map(([key]) => {
                    return key === 'wifi' ? 'WiFi' :
                           key === 'airConditioning' ? 'Air conditioning' :
                           key === 'oceanView' ? 'Ocean view' :
                           key.charAt(0).toUpperCase() + key.slice(1);
                  })
              });
            });
            
            console.log("Search.js: Processed all fallback listings:", listingsData);
            setAllListings(listingsData);
          }
        } else {
          // Original code for active listings only
          try {
            // Try to get listings with ordering (requires composite index)
            console.log("Search.js: Attempting to query with ordering");
            q = query(listingsRef, where("status", "==", "active"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            
            console.log(`Search.js: Query successful, found ${querySnapshot.size} listings`);
            
            const listingsData = [];
            querySnapshot.forEach((doc) => {
              // Transform the data to match the expected format
              const data = doc.data();
              console.log(`Search.js: Processing listing ${doc.id}:`, data);
              
              listingsData.push({
                id: doc.id,
                title: data.title,
                location: data.location,
                price: data.price,
                rating: data.rating || 0,
                reviews: data.reviews || 0,
                image: data.mainImage || (data.images && data.images.length > 0 ? data.images[0] : ''),
                images: data.images || [],
                beds: data.beds,
                baths: data.baths,
                guests: data.guests,
                type: data.type,
                status: data.status || 'unknown',
                amenities: Object.entries(data.amenities || {})
                  .filter(([_, value]) => value === true)
                  .map(([key]) => {
                    // Convert camelCase to readable format
                    return key === 'wifi' ? 'WiFi' :
                           key === 'airConditioning' ? 'Air conditioning' :
                           key === 'oceanView' ? 'Ocean view' :
                           key.charAt(0).toUpperCase() + key.slice(1);
                  })
              });
            });
            
            console.log("Search.js: Processed all listings:", listingsData);
            setAllListings(listingsData);
          } catch (indexError) {
            console.error("Search.js: Index error, falling back to unordered query:", indexError);
            
            // If composite index is not available, fall back to simple query
            q = query(listingsRef, where("status", "==", "active"));
            console.log("Search.js: Executing fallback query without ordering");
            const fallbackSnapshot = await getDocs(q);
            
            console.log(`Search.js: Fallback query successful, found ${fallbackSnapshot.size} listings`);
            
            const listingsData = [];
            fallbackSnapshot.forEach((doc) => {
              const data = doc.data();
              console.log(`Search.js: Processing listing ${doc.id} from fallback:`, data);
              
              listingsData.push({
                id: doc.id,
                title: data.title,
                location: data.location,
                price: data.price,
                rating: data.rating || 0,
                reviews: data.reviews || 0,
                image: data.mainImage || (data.images && data.images.length > 0 ? data.images[0] : ''),
                images: data.images || [],
                beds: data.beds,
                baths: data.baths,
                guests: data.guests,
                type: data.type,
                status: data.status || 'unknown',
                amenities: Object.entries(data.amenities || {})
                  .filter(([_, value]) => value === true)
                  .map(([key]) => {
                    return key === 'wifi' ? 'WiFi' :
                           key === 'airConditioning' ? 'Air conditioning' :
                           key === 'oceanView' ? 'Ocean view' :
                           key.charAt(0).toUpperCase() + key.slice(1);
                  })
              });
            });
            
            console.log("Search.js: Processed all fallback listings:", listingsData);
            setAllListings(listingsData);
          }
        }
      } catch (error) {
        console.error("Search.js: Error fetching listings:", error);
        // Set empty array to prevent errors in the UI
        setAllListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, [db, showAllListings]);

  // Apply filters
  useEffect(() => {
    // Filter listings based on search parameters and filters
    if (!allListings.length) {
      console.log("Search.js: No listings to filter");
      return;
    }
    
    console.log("Search.js: Filter apply triggered", filterApplyTrigger);
    
    // If we have listings but filteredListings is empty, clear filters
    if (filteredListings.length === 0 && allListings.length > 0) {
      console.log("Search.js: No filtered listings but allListings exists. Consider resetting filters.");
    }
    
    console.log("Search.js: Starting to filter listings:", allListings);
    console.log("Search.js: Current filter settings:", {
      searchLocation,
      searchCategory,
      propertyType,
      priceRange,
      amenities
    });
    
    let results = [...allListings];
    
    if (searchLocation) {
      console.log(`Search.js: Filtering by location: "${searchLocation}"`);
      results = results.filter(listing => 
        listing.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
      console.log(`Search.js: After location filter: ${results.length} listings`);
    }
    
    // Add category filter
    if (searchCategory) {
      console.log(`Search.js: Filtering by category: "${searchCategory}"`);
      
      // Set property type if the search category matches a property type option
      // This helps synchronize navbar categories with the property type filter
      const propertyTypes = ['Apartment', 'House', 'Villa', 'Cabin', 'Loft', 'Treehouse'];
      if (propertyTypes.some(type => type.toLowerCase() === searchCategory.toLowerCase())) {
        // Only set propertyType if it's coming from URL params and not already set by the user
        if (!propertyType) {
          console.log(`Search.js: Setting property type to match category: ${searchCategory}`);
          setPropertyType(searchCategory);
        }
      }
      
      results = results.filter(listing => {
        // Check if the listing type matches the category
        if (listing.type && listing.type.toLowerCase() === searchCategory.toLowerCase()) {
          return true;
        }
        
        // Check if any amenity matches the category
        if (listing.amenities && listing.amenities.some(amenity => 
          amenity.toLowerCase().includes(searchCategory.toLowerCase())
        )) {
          return true;
        }
        
        // Check if the location matches the category
        if (listing.location && listing.location.toLowerCase().includes(searchCategory.toLowerCase())) {
          return true;
        }
        
        // Special handling for Beach and Mountain categories
        if ((searchCategory.toLowerCase() === 'beach' && 
             (listing.type?.toLowerCase().includes('beach') || 
              listing.location?.toLowerCase().includes('beach') || 
              listing.amenities?.some(a => a.toLowerCase().includes('ocean') || a.toLowerCase().includes('beach'))))
        ) {
          return true;
        }
        
        if ((searchCategory.toLowerCase() === 'mountain' && 
             (listing.type?.toLowerCase().includes('mountain') || 
              listing.location?.toLowerCase().includes('mountain') ||
              listing.amenities?.some(a => a.toLowerCase().includes('mountain') || a.toLowerCase().includes('view'))))
        ) {
          return true;
        }
        
        return false;
      });
      console.log(`Search.js: After category filter: ${results.length} listings`);
    }
    
    if (propertyType) {
      console.log(`Search.js: Filtering by property type: "${propertyType}"`);
      results = results.filter(listing => listing.type === propertyType);
      console.log(`Search.js: After property type filter: ${results.length} listings`);
    }
    
    console.log(`Search.js: Filtering by price range: ${priceRange[0]} - ${priceRange[1]}`);
    results = results.filter(listing => 
      listing.price >= priceRange[0] && listing.price <= priceRange[1]
    );
    console.log(`Search.js: After price range filter: ${results.length} listings`);
    
    // Filter by amenities
    // Create a debugging function to check amenities
    const debugAmenityFilter = (name, filterResults) => {
      console.log(`Search.js: After ${name} filter: ${filterResults.length} listings`);
      if (filterResults.length === 0) {
        console.log(`Search.js: WARNING - ${name} filter removed all listings`);
        // Log the amenities of the first few listings to help debug
        if (results.length > 0) {
          console.log(`Search.js: Previous listings had amenities:`, 
            results.slice(0, 3).map(l => ({ id: l.id, amenities: l.amenities })));
        }
      }
    };

    // More lenient amenity matching with includes() instead of exact matching
    if (amenities.wifi) {
      console.log(`Search.js: Filtering by wifi amenity`);
      const prevResults = [...results];
      results = results.filter(listing => 
        listing.amenities && listing.amenities.some(amenity => 
          amenity.toLowerCase().includes('wifi') || amenity.toLowerCase() === 'wi-fi'
        )
      );
      debugAmenityFilter('wifi', results);
      // If filter removed all listings, don't apply it
      if (results.length === 0 && prevResults.length > 0) {
        results = prevResults;
        console.log(`Search.js: Reverting wifi filter as it would remove all listings`);
      }
    }
    
    if (amenities.kitchen) {
      console.log(`Search.js: Filtering by kitchen amenity`);
      const prevResults = [...results];
      results = results.filter(listing => 
        listing.amenities && listing.amenities.some(amenity => 
          amenity.toLowerCase().includes('kitchen')
        )
      );
      debugAmenityFilter('kitchen', results);
      // If filter removed all listings, don't apply it
      if (results.length === 0 && prevResults.length > 0) {
        results = prevResults;
        console.log(`Search.js: Reverting kitchen filter as it would remove all listings`);
      }
    }
    
    if (amenities.pool) {
      console.log(`Search.js: Filtering by pool amenity`);
      const prevResults = [...results];
      results = results.filter(listing => 
        listing.amenities && listing.amenities.some(amenity => 
          amenity.toLowerCase().includes('pool')
        )
      );
      debugAmenityFilter('pool', results);
      // If filter removed all listings, don't apply it
      if (results.length === 0 && prevResults.length > 0) {
        results = prevResults;
        console.log(`Search.js: Reverting pool filter as it would remove all listings`);
      }
    }
    
    if (amenities.airConditioning) {
      console.log(`Search.js: Filtering by air conditioning amenity`);
      const prevResults = [...results];
      results = results.filter(listing => 
        listing.amenities && listing.amenities.some(amenity => 
          amenity.toLowerCase().includes('air conditioning') || 
          amenity.toLowerCase().includes('ac') ||
          amenity.toLowerCase().includes('a/c')
        )
      );
      debugAmenityFilter('air conditioning', results);
      // If filter removed all listings, don't apply it
      if (results.length === 0 && prevResults.length > 0) {
        results = prevResults;
        console.log(`Search.js: Reverting air conditioning filter as it would remove all listings`);
      }
    }
    
    if (amenities.oceanView) {
      console.log(`Search.js: Filtering by ocean view amenity`);
      const prevResults = [...results];
      results = results.filter(listing => 
        listing.amenities && listing.amenities.some(amenity => 
          amenity.toLowerCase().includes('ocean') || 
          amenity.toLowerCase().includes('sea') ||
          amenity.toLowerCase().includes('view')
        )
      );
      debugAmenityFilter('ocean view', results);
      // If filter removed all listings, don't apply it
      if (results.length === 0 && prevResults.length > 0) {
        results = prevResults;
        console.log(`Search.js: Reverting ocean view filter as it would remove all listings`);
      }
    }
    
    console.log("Search.js: Final filtered results:", results);
    
    // If no results after filtering but we had listings initially,
    // add a fallback to show all listings
    if (results.length === 0 && allListings.length > 0) {
      console.log("Search.js: WARNING - All filters removed all listings. Showing all listings as fallback.");
      setFilteredListings(allListings);
      
      // Reset filters that may be causing issues
      if (searchLocation) {
        console.log("Search.js: Resetting searchLocation filter");
        // Don't actually reset the filter state, just log for debugging
      }
      
      // Show alert to user that filters were reset
      toast({
        title: "No listings match your filters",
        description: "We've reset some filters to show you available properties",
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top"
      });
      
    } else {
      setFilteredListings(results);
    }
  }, [searchLocation, searchCategory, priceRange, propertyType, amenities, allListings, filterApplyTrigger]);

  const handleAmenityChange = (amenity) => {
    setAmenities(prev => ({
      ...prev,
      [amenity]: !prev[amenity]
    }));
  };

  const handleViewProperty = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  // Add function to check if a listing is the last created one
  const isLastCreatedListing = (listingId) => {
    return listingId === lastCreatedListingId;
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = filteredListings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredListings.length]);

  const toggleShowAllListings = () => {
    setShowAllListings(prev => !prev);
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <Heading size="lg" mb={6}>
          {searchLocation 
            ? `Stays in ${searchLocation}` 
            : 'All Available Stays'}
        </Heading>
        
        {lastCreatedListingId && (
          <Box mb={4} p={3} bg="green.100" borderRadius="md">
            <Text>
              Looking for your newly created listing? We're highlighting it below if it appears in the search results.
            </Text>
          </Box>
        )}
        
        {/* Debug controls */}
        <Box mb={4} p={3} bg="gray.100" borderRadius="md">
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold">Debug Controls:</Text>
            <Button 
              size="sm" 
              colorScheme={showAllListings ? "red" : "blue"}
              onClick={toggleShowAllListings}
            >
              {showAllListings ? "Show Only Active Listings" : "Show All Listings (Debug)"}
            </Button>
          </Flex>
        </Box>
        
        <Grid templateColumns={{ base: '1fr', md: '250px 1fr' }} gap={8}>
          {/* Filters Column */}
          <GridItem>
            <Box bg={filterBgColor} p={5} borderRadius="md" shadow="sm">
              <Heading size="md" mb={4}>Filters</Heading>
              
              {/* Price Range Filter */}
              <Box mb={6}>
                <Text fontWeight="bold" mb={2}>Price Range (per night)</Text>
                <Flex justify="space-between" mb={2}>
                  <Text>৳{priceRange[0]}</Text>
                  <Text>৳{priceRange[1]}</Text>
                </Flex>
                <RangeSlider
                  aria-label={['min', 'max']}
                  defaultValue={priceRange}
                  min={0}
                  max={50000}
                  step={10}
                  onChange={(val) => setPriceRange(val)}
                >
                  <RangeSliderTrack>
                    <RangeSliderFilledTrack bg="teal.500" />
                  </RangeSliderTrack>
                  <RangeSliderThumb index={0} />
                  <RangeSliderThumb index={1} />
                </RangeSlider>
              </Box>
              
              <Divider mb={6} />
              
              {/* Property Type Filter */}
              <Box mb={6}>
                <Text fontWeight="bold" mb={2}>Property Type</Text>
                <Select 
                  placeholder="Select type" 
                  value={propertyType} 
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Villa">Villa</option>
                  <option value="Cabin">Cabin</option>
                  <option value="Loft">Loft</option>
                  <option value="Treehouse">Treehouse</option>
                </Select>
              </Box>
              
              <Divider mb={6} />
              
              {/* Amenities Filter */}
              <Box mb={6}>
                <Text fontWeight="bold" mb={2}>Amenities</Text>
                <Stack spacing={2}>
                  <Checkbox 
                    isChecked={amenities.wifi}
                    onChange={() => handleAmenityChange('wifi')}
                  >
                    WiFi
                  </Checkbox>
                  <Checkbox 
                    isChecked={amenities.kitchen}
                    onChange={() => handleAmenityChange('kitchen')}
                  >
                    Kitchen
                  </Checkbox>
                  <Checkbox 
                    isChecked={amenities.pool}
                    onChange={() => handleAmenityChange('pool')}
                  >
                    Pool
                  </Checkbox>
                  <Checkbox 
                    isChecked={amenities.airConditioning}
                    onChange={() => handleAmenityChange('airConditioning')}
                  >
                    Air Conditioning
                  </Checkbox>
                  <Checkbox 
                    isChecked={amenities.oceanView}
                    onChange={() => handleAmenityChange('oceanView')}
                  >
                    Ocean View
                  </Checkbox>
                </Stack>
              </Box>
              
              <Button 
                colorScheme="teal" 
                width="full"
                onClick={() => {
                  // Force re-filter by incrementing the trigger
                  setFilterApplyTrigger(prev => prev + 1);
                  setCurrentPage(1);
                  console.log("Search.js: Apply Filters button clicked");
                }}
              >
                Apply Filters
              </Button>
            </Box>
          </GridItem>
          
          {/* Results Column */}
          <GridItem>
            {filteredListings.length === 0 ? (
              <Box textAlign="center" p={10}>
                <Heading size="md">No listings found</Heading>
                <Text mt={2}>Try adjusting your filters or search for a different location</Text>
                
                {lastCreatedListingId && (
                  <Text mt={4} color="red.500">
                    Your newly created listing was not found in the search results. This could be because:
                    <Box as="ul" pl={5} mt={2} textAlign="left">
                      <Box as="li">The Firebase index is still being built (can take a few minutes)</Box>
                      <Box as="li">The listing doesn't match the current search filters</Box>
                      <Box as="li">There might be an issue with the listing data</Box>
                    </Box>
                  </Text>
                )}
              </Box>
            ) : (
              <>
                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                  {currentListings.map((listing) => (
                    <GridItem key={listing.id}>
                      <Box 
                        bg={isLastCreatedListing(listing.id) ? 'green.50' : propertyBgColor}
                        borderRadius="lg"
                        overflow="hidden"
                        shadow="md"
                        transition="transform 0.3s"
                        _hover={{ transform: 'translateY(-5px)', cursor: 'pointer' }}
                        onClick={() => handleViewProperty(listing.id)}
                        border={isLastCreatedListing(listing.id) ? '2px solid' : '1px solid'}
                      borderColor={isLastCreatedListing(listing.id) ? 'green.400' : 'transparent'}
                    >
                      {isLastCreatedListing(listing.id) && (
                        <Box bg="green.400" color="white" py={1} px={3} position="absolute" zIndex={1}>
                          Your New Listing
                        </Box>
                      )}
                      
                      {/* Show status badge for debug mode */}
                      {showAllListings && listing.status && (
                        <Box 
                          bg={listing.status === 'active' ? 'green.400' : 'orange.400'} 
                          color="white" 
                          py={1} 
                          px={3} 
                          position="absolute" 
                          zIndex={1}
                          right={0}
                        >
                          {listing.status}
                        </Box>
                      )}
                      
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        h="240px"
                        w="100%"
                        objectFit="cover"
                      />
                      <Box p={5}>
                        <Flex justify="space-between" align="baseline">
                          <Badge colorScheme="teal" fontSize="0.8em">
                            {listing.type}
                          </Badge>
                          <Flex align="center">
                            <Icon as={FaStar} color="yellow.400" mr={1} />
                            <Text fontWeight="bold">{listing.rating}</Text>
                            <Text ml={1} color="gray.500" fontSize="sm">({listing.reviews})</Text>
                          </Flex>
                        </Flex>
                        <Heading size="md" my={2} noOfLines={1}>
                          {listing.title}
                        </Heading>
                        <Flex align="center" mb={2}>
                          <Icon as={FaMapMarkerAlt} color="gray.500" mr={1} />
                          <Text color="gray.500" fontSize="sm" noOfLines={1}>
                            {listing.location}
                          </Text>
                        </Flex>
                        <Flex justify="space-between" mt={4} wrap="wrap">
                          <Flex align="center" mr={3}>
                            <Icon as={FaBed} color="gray.500" mr={1} />
                            <Text fontSize="sm">{listing.beds} beds</Text>
                          </Flex>
                          <Flex align="center" mr={3}>
                            <Icon as={FaBath} color="gray.500" mr={1} />
                            <Text fontSize="sm">{listing.baths} baths</Text>
                          </Flex>
                          <Flex align="center">
                            <Icon as={FaUsers} color="gray.500" mr={1} />
                            <Text fontSize="sm">Up to {listing.guests} guests</Text>
                          </Flex>
                        </Flex>
                        <Flex justify="space-between" align="center" mt={4}>
                          <Text fontWeight="bold" fontSize="xl">
                            ৳{listing.price} <Text as="span" fontSize="sm" fontWeight="normal">night</Text>
                          </Text>
                          <Button 
                            colorScheme="teal" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProperty(listing.id);
                            }}
                          >
                            View Details
                          </Button>
                        </Flex>
                      </Box>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Box mt={8}>
                  <HStack justify="center" spacing={2}>
                    <IconButton
                      icon={<ChevronLeftIcon />}
                      onClick={() => handlePageChange(currentPage - 1)}
                      isDisabled={currentPage === 1}
                      aria-label="Previous page"
                      size="sm"
                    />
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <Button
                        key={pageNumber}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        colorScheme={currentPage === pageNumber ? 'teal' : 'gray'}
                        variant={currentPage === pageNumber ? 'solid' : 'outline'}
                      >
                        {pageNumber}
                      </Button>
                    ))}
                    
                    <IconButton
                      icon={<ChevronRightIcon />}
                      onClick={() => handlePageChange(currentPage + 1)}
                      isDisabled={currentPage === totalPages}
                      aria-label="Next page"
                      size="sm"
                    />
                  </HStack>
                  
                  <Text textAlign="center" mt={4} fontSize="sm" color="gray.600">
                    Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredListings.length)} of {filteredListings.length} listings
                  </Text>
                </Box>
              )}
              </>
            )}
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
} 