import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetail from './pages/PropertyDetail';
import Profile from './pages/Profile';
import MyBookings from './pages/MyBookings';
import BecomeHost from './pages/BecomeHost';
import CreateListing from './pages/CreateListing';
import MyListings from './pages/MyListings';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';

// Auth Components
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import ForgotPassword from './components/auth/ForgotPassword';

// Custom theme
const theme = extendTheme({
  colors: {
    brand: {
      100: '#E9F7F7',
      200: '#D3EFEF',
      300: '#BEE7E7',
      400: '#A8DFDF',
      500: '#5CBFBF',
      600: '#48A9A9',
      700: '#348282',
      800: '#205B5B',
      900: '#0C3434',
    },
  },
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Inter, sans-serif',
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/bookings" element={<MyBookings />} />
              <Route path="/become-host" element={<BecomeHost />} />
              <Route path="/create-listing" element={<CreateListing />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route path="/edit-listing/:id" element={<CreateListing />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
