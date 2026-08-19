import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  resetUserPassword,
} from '../services/authService';
import { subscribeToUserProfile, updateUserProfile } from '../services/userService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to User Profile when Firebase User is active
  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const unsubscribeProfile = subscribeToUserProfile(
      user.uid,
      (userProfile) => {
        setProfile(userProfile);
        setLoading(false);
      },
      (error) => {
        console.warn('Profile sync issue:', error);
        setLoading(false);
      }
    );

    return () => unsubscribeProfile();
  }, [user]);

  const signUp = async (name: string, email: string, pass: string) => {
    await registerWithEmail(name, email, pass);
  };

  const signIn = async (email: string, pass: string) => {
    await loginWithEmail(email, pass);
  };

  const signInGoogle = async () => {
    await loginWithGoogle();
  };

  const resetPassword = async (email: string) => {
    await resetUserPassword(email);
  };

  const logout = async () => {
    await logoutUser();
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfile(user.uid, updates);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signInGoogle,
        resetPassword,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
