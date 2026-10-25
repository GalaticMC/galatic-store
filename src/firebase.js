import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Added for the database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAE9gzT_zCQ8sVcJArMU8UIj1huAFUc4sg",
  authDomain: "galatic-store.firebaseapp.com",
  projectId: "galatic-store",
  storageBucket: "galatic-store.firebasestorage.app",
  messagingSenderId: "812583038073",
  appId: "1:812583038073:web:aa8e1135f68f74a429f8a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app); // Exporting the database