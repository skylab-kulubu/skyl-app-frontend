'use client';

import React, { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  token: string | null;
  roles: string[];
  isModerator: boolean;
  hasAccess: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const token = session?.accessToken ?? null;
  const roles = session?.roles ?? [];

  const login = () => signIn('keycloak');
  const logout = () => signOut({ callbackUrl: '/' });

  const hasAccess = roles.includes('skylapp:access');
  const isModerator = roles.includes('skylapp:moderator');

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout, token, roles, isModerator, hasAccess }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};