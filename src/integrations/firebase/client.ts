
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Firebase configuration with your actual credentials
const firebaseConfig = {
  apiKey: "AIzaSyCfUi-2emJm69P27RxWsKgm9Cipm-XHi74",
  authDomain: "fraserpay-sac.firebaseapp.com",
  projectId: "fraserpay-sac",
  storageBucket: "fraserpay-sac.appspot.com",
  messagingSenderId: "1076398745844",
  appId: "1:1076398745844:web:7aa0f09d05611d96a496a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

// Create Google Auth Provider with domain restriction
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  hd: 'pdsb.net' // Restrict to this specific domain
});

// Enable local emulators for development - using conditional checks to prevent connection errors
if (import.meta.env.DEV) {
  try {
    // Check if we're running locally and not in a deployed environment
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      console.log("In local development environment, using Firebase emulators");
      // Uncomment these lines to use local emulators during development
      // connectAuthEmulator(auth, "http://localhost:9099");
      // connectFirestoreEmulator(firestore, "localhost", 8080);
      // connectFunctionsEmulator(functions, "localhost", 5001);
      // connectStorageEmulator(storage, "localhost", 9199);
    } else {
      console.log("Not connecting to emulators in non-localhost environment");
    }
  } catch (error) {
    console.error("Error connecting to Firebase emulators:", error);
  }
}

// Function to clear Firebase auth state (useful for troubleshooting)
export const clearFirebaseAuth = async () => {
  try {
    await auth.signOut();
    localStorage.removeItem('firebase:authUser');
    console.log('Firebase auth cleared');
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
};

export { app, auth, firestore, functions, storage };
