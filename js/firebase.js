// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBTDvl3j7d5r--sfuDbBYzGuLCBRsI5EO4",
  authDomain: "digital-logbook-f61cf.firebaseapp.com",
  projectId: "digital-logbook-f61cf",
  storageBucket: "digital-logbook-f61cf.firebasestorage.app",
  messagingSenderId: "108153479571",
  appId: "1:108153479571:web:4a96f136f5fa3b1082c866",
  measurementId: "G-9R41JFV8FM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);