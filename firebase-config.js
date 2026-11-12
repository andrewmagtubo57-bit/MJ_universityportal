import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getAuth} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {getFirestore} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

export const cfg = {
  apiKey: "AIzaSyBjEy6Vhp0AD87dtslG81N2TaBPLaLWJz0",
  authDomain: "student-portal-87309.firebaseapp.com",
  projectId: "student-portal-87309",
  storageBucket: "student-portal-87309.firebasestorage.app",
  messagingSenderId: "434870403146",
  appId: "1:434870403146:web:b98f8eb32ac52d3ba8e6b3",
  measurementId: "G-V8WVRJWCR3"
};

const app = initializeApp(cfg);
export const auth = getAuth(app), db = getFirestore(app);