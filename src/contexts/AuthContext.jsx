import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Register new user
  const register = async (email, password, userData) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name
      await updateProfile(user, {
        displayName: userData.name
      })

      // Create user profile in Firestore
      const userDoc = {
        uid: user.uid,
        email: user.email,
        name: userData.name,
        role: userData.role, // 'event_manager' or 'musician'
        createdAt: new Date().toISOString(),
        ...userData
      }

      await setDoc(doc(db, 'users', user.uid), userDoc)
      setUserProfile(userDoc)
      
      toast.success('Account created successfully!')
      return user
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      return user
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth)
      setUserProfile(null)
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      if (currentUser) {
        await setDoc(doc(db, 'users', currentUser.uid), updates, { merge: true })
        setUserProfile(prev => ({ ...prev, ...updates }))
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const profile = userDoc.data()
        setUserProfile(profile)
        return profile
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user)
        await fetchUserProfile(user.uid)
      } else {
        setCurrentUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userProfile,
    register,
    login,
    logout,
    updateUserProfile,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
