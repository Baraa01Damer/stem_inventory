// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "stem-academy-inventory.firebaseapp.com",
    projectId: "stem-academy-inventory",
    storageBucket: "stem-academy-inventory.firebasestorage.app",
    messagingSenderId: "1099491588939",
    appId: "1:1099491588939:web:28ffdede443ca5228586ce",
    measurementId: "G-T3RDK6ELDX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export { firestore }