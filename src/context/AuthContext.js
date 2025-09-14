import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register a new user
  async function signup(email, password, displayName) {
    console.log('AuthContext: Starting signup process');
    
    // Create the user account
    console.log('AuthContext: Creating user with email and password');
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('AuthContext: Error creating user account', error);
      throw error; // Re-throw to be caught by the component
    }
    
    const user = userCredential.user;
    console.log('AuthContext: User created successfully', user.uid);
    
    // Update profile - separate try/catch to continue even if this fails
    console.log('AuthContext: Updating user profile with displayName');
    try {
      await updateFirebaseProfile(user, { displayName });
      console.log('AuthContext: Profile updated successfully');
    } catch (profileError) {
      console.error('AuthContext: Error updating profile', profileError);
      // Continue despite profile update error
    }
    
    // Create user document in Firestore - separate try/catch to continue even if this fails
    console.log('AuthContext: Creating user document in Firestore');
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        displayName,
        createdAt: new Date(),
        userType: 'guest', // default type
        photoURL: '',
      });
      console.log('AuthContext: User document created successfully');
    } catch (firestoreError) {
      console.error('AuthContext: Error creating user document', firestoreError);
      // Continue despite Firestore error
    }
    
    console.log('AuthContext: Signup process completed successfully');
    return user;
  }

  // Sign in existing user
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Log out
  function logout() {
    return signOut(auth);
  }

  // Reset password
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Get user profile data
  async function getUserProfile() {
    if (!currentUser) return null;
    
    const docRef = doc(db, "users", currentUser.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  }

  // Update user profile
  async function updateProfile(userData) {
    if (!currentUser) throw new Error("No authenticated user");
    
    // Update Firebase Auth profile
    await updateFirebaseProfile(currentUser, userData);
    
    // Update Firestore user document
    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, userData);
    
    // Force refresh the currentUser object
    setCurrentUser({ ...currentUser, ...userData });
  }

  // Update user to be a host
  async function becomeHost() {
    if (!currentUser) return;
    
    const userRef = doc(db, "users", currentUser.uid);
    await setDoc(userRef, { userType: 'host' }, { merge: true });
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('AuthContext: Auth state changed', user ? `User: ${user.uid}` : 'No user');
      setCurrentUser(user);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    getUserProfile,
    becomeHost,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 