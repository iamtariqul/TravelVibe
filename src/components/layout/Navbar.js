import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon
} from '@chakra-ui/icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const { currentUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Move useColorModeValue calls to the top level
  const bg = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.600', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const logoColor = useColorModeValue('teal.500', 'teal.300');
  
  // Fetch user profile to check if user is a host
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setUserProfile(userSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Box>
      <Flex
        bg={bg}
        color={color}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={borderColor}
        align={'center'}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <Text
            as={RouterLink}
            to="/"
            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
            fontFamily={'heading'}
            fontWeight={'bold'}
            fontSize={'xl'}
            color={logoColor}
            _hover={{ textDecoration: 'none' }}
          >
            TravelVibe
          </Text>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
          align={'center'}
        >
          <Button onClick={toggleColorMode} size="sm" variant="ghost">
            {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          </Button>
          
          {currentUser ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar
                  size={'sm'}
                  src={currentUser.photoURL || 'https://bit.ly/broken-link'}
                  name={currentUser.displayName || 'User'}
                />
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                <MenuItem as={RouterLink} to="/bookings">My Bookings</MenuItem>
                {userProfile && userProfile.userType === 'host' && (
                  <MenuItem as={RouterLink} to="/my-listings">My Listings</MenuItem>
                )}
                <MenuDivider />
                <MenuItem onClick={handleLogout} isDisabled={isLoggingOut}>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Button
                as={RouterLink}
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
                to={'/login'}
              >
                Sign In
              </Button>
              <Button
                as={RouterLink}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'teal.400'}
                to={'/signup'}
                _hover={{
                  bg: 'teal.500',
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('teal.500', 'teal.300');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={RouterLink}
                p={2}
                to={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  const textColor = useColorModeValue('gray.900', 'gray.200');
  const bgHover = useColorModeValue('teal.50', 'gray.700');
  const textColorHover = useColorModeValue('teal.500', 'teal.300');
  
  return (
    <Link
      as={RouterLink}
      to={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: bgHover }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            color={textColor}
            _groupHover={{ color: textColorHover }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'teal.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Stack
      bg={bgColor}
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text fontWeight={600}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={borderColor}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Link
                key={child.label}
                py={2}
                as={RouterLink}
                to={child.href}
              >
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Explore',
    href: '/search',
  },
  {
    label: 'Categories',
    children: [
      {
        label: 'Apartments',
        subLabel: 'Modern urban living spaces',
        href: '/search?category=Apartment',
      },
      {
        label: 'Houses',
        subLabel: 'Comfortable family homes',
        href: '/search?category=House',
      },
      {
        label: 'Villas',
        subLabel: 'Luxurious vacation properties',
        href: '/search?category=Villa',
      },
      {
        label: 'Cabins',
        subLabel: 'Cozy retreats in nature',
        href: '/search?category=Cabin',
      },
      {
        label: 'Lofts',
        subLabel: 'Open concept modern spaces',
        href: '/search?category=Loft',
      },
      {
        label: 'Treehouses',
        subLabel: 'Unique elevated experiences',
        href: '/search?category=Treehouse',
      },
      {
        label: 'Beach',
        subLabel: 'Properties near the ocean',
        href: '/search?category=Beach',
      },
      {
        label: 'Mountain',
        subLabel: 'Properties with mountain views',
        href: '/search?category=Mountain',
      },
    ],
  },
  {
    label: 'Host',
    href: '/become-host',
  },
]; 