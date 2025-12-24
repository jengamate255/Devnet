// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDrrdVlNz31-UAnEW6wIiiP5dmV-cpd3UQ",
    authDomain: "devnet-fc606.firebaseapp.com",
    projectId: "devnet-fc606",
    storageBucket: "devnet-fc606.firebasestorage.app",
    messagingSenderId: "887311395166",
    appId: "1:887311395166:web:89d30ddba879aa026dc7cf",
    measurementId: "G-VSEHQC9SGF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, db, auth, storage };
export default app;
