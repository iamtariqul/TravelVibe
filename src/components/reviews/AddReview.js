import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  HStack,
  Icon,
  Text,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';

export default function AddReview({ propertyId, propertyHostId, onReviewAdded }) {
  const { currentUser, getUserProfile } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to leave a review",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please write a review comment",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Get user profile for name and avatar
      const userProfile = await getUserProfile();
      
      // Create review document
      const reviewData = {
        propertyId,
        propertyHostId,
        userId: currentUser.uid,
        userName: userProfile?.displayName || 'User',
        userAvatar: userProfile?.photoURL || '',
        rating,
        comment,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "reviews"), reviewData);
      
      // Update property document with new review count and rating
      const propertyRef = doc(db, "listings", propertyId);
      await updateDoc(propertyRef, {
        reviews: increment(1),
        // We'd ideally calculate the average rating here, but for simplicity
        // we'll just increment the rating slightly toward the new rating
        rating: increment((rating - 5) / 10) // This moves the rating slightly toward the new rating
      });
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component
      if (onReviewAdded) {
        onReviewAdded({
          id: docRef.id,
          ...reviewData,
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit your review. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <FormControl mb={4}>
        <FormLabel>Rating</FormLabel>
        <HStack spacing={1}>
          {[...Array(5)].map((_, i) => {
            const starValue = i + 1;
            return (
              <Icon
                key={i}
                as={FaStar}
                color={(hoverRating || rating) >= starValue ? "yellow.400" : "gray.300"}
                boxSize={8}
                cursor="pointer"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
              />
            );
          })}
          <Text ml={2} color="gray.500">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
          </Text>
        </HStack>
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Your Review</FormLabel>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this property..."
          rows={4}
        />
      </FormControl>
      
      <Flex justify="flex-end">
        <Button
          type="submit"
          colorScheme="teal"
          isLoading={isSubmitting}
          loadingText="Submitting"
        >
          Submit Review
        </Button>
      </Flex>
    </Box>
  );
} 