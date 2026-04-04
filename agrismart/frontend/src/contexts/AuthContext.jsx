import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(uid) {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setUserProfile(docSnap.data())
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    await fetchProfile(result.user.uid)
    return result
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    // Create profile if doesn't exist
    const docRef = doc(db, 'users', result.user.uid)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      const profile = {
        fullName: result.user.displayName || '',
        email: result.user.email || '',
        role: 'Farmer',
        language: 'English',
        createdAt: new Date().toISOString(),
      }
      await setDoc(docRef, profile)
      setUserProfile(profile)
    } else {
      setUserProfile(docSnap.data())
    }
    return result
  }

  async function signup(email, password, profileData = {}) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const profile = {
      fullName: profileData.fullName || '',
      email,
      role: profileData.role || 'Farmer',
      language: 'English',
      phone: '',
      state: '',
      district: '',
      city: '',
      farmSize: '',
      farmSizeUnit: 'Acres',
      soilType: '',
      irrigationType: '',
      createdAt: new Date().toISOString(),
    }
    const docRef = doc(db, 'users', result.user.uid)
    await setDoc(docRef, profile)
    setUserProfile(profile)
    return result
  }

  async function logout() {
    await signOut(auth)
    setUserProfile(null)
  }

  async function refreshProfile() {
    if (currentUser) await fetchProfile(currentUser.uid)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        await fetchProfile(user.uid)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value = { currentUser, userProfile, login, loginWithGoogle, signup, logout, refreshProfile, loading }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
