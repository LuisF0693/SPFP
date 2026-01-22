import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const ADMIN_EMAILS = ['nando062218@gmail.com'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider component.
 * Manages user authentication state, including login, registration, and logout.
 * Uses Supabase Auth for session management and defines administrative access.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(currentUser ? ADMIN_EMAILS.includes(currentUser.email || '') : false);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsAdmin(currentUser ? ADMIN_EMAILS.includes(currentUser.email || '') : false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Initiates Google OAuth sign-in flow.
   */
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao fazer login com Google", error);
      throw error;
    }
  };

  /**
   * Signs in a user using email and password.
   * @param email - User's email
   * @param pass - User's password
   */
  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao fazer login com Email", error);
      throw error;
    }
  };

  /**
   * Registers a new user with email, password, and display name.
   * @param email - User's email
   * @param pass - User's password
   * @param name - User's full name
   */
  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            display_name: name,
            full_name: name
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Erro ao registrar usuário", error);
      throw error;
    }
  };

  /**
   * Logs out the current user and clears local authentication state.
   */
  const logout = async () => {
    try {
      // Limpar estado local imediatamente para evitar flash de conteúdo
      setUser(null);
      setSession(null);
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro ao fazer logout", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signInWithEmail, registerWithEmail, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};