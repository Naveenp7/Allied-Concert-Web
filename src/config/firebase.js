import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyCxX5vKEKZgTsbNyjsPRdUJCIoPOmsqmCY",
  authDomain: "concert-web-e2ca6.firebaseapp.com",
  projectId: "concert-web-e2ca6",
  storageBucket: "concert-web-e2ca6.firebasestorage.app",
  messagingSenderId: "905162906202",
  appId: "1:905162906202:web:a1fa8337ba5a217b961663",
  measurementId: "G-ZNP3XH7X7D"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
