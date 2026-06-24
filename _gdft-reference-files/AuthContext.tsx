
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

const AUTH_PROVIDER_KEY = 'gymday_auth_provider';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  authProvider: 'google' | 'email' | null;
  signInWithGoogle: () => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authProvider, setAuthProvider] = useState<'google' | 'email' | null>(
    () => (localStorage.getItem(AUTH_PROVIDER_KEY) as 'google' | 'email' | null)
  );

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session:", error);
        }
        setSession(initialSession);
        setUser(initialSession?.user || null);
      } catch (err) {
        console.error("Unexpected error checking session:", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);

      // When a SIGNED_IN event fires via Google OAuth, the provider will be in the session
      if (event === 'SIGNED_IN' && session?.user) {
        const provider = session.user.app_metadata?.provider;
        if (provider === 'google') {
          localStorage.setItem(AUTH_PROVIDER_KEY, 'google');
          setAuthProvider('google');
        }
        // Note: email sign-ins are set explicitly in Login.tsx via setStoredProvider
      }

      if (event === 'SIGNED_OUT') {
        localStorage.removeItem(AUTH_PROVIDER_KEY);
        setAuthProvider(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const origin = window.location.origin;
      const redirectUrl = origin.endsWith('/') ? origin.slice(0, -1) : origin;

      // Mark that we are about to do a Google sign-in.
      // This survives the page redirect (stored in localStorage).
      localStorage.setItem(AUTH_PROVIDER_KEY, 'google');
      localStorage.removeItem('supabase.auth.token');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.assign(data.url);
      }
    } catch (error: any) {
      // If Google login failed, remove the flag we just set
      localStorage.removeItem(AUTH_PROVIDER_KEY);
      console.error("Google Auth Failure:", error);
      toast.error(error.message || "Failed to sign in with Google");
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || "Failed to update password");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem(AUTH_PROVIDER_KEY);
      setAuthProvider(null);
      toast.success("Signed out successfully");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error(error.message || "Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, authProvider, signInWithGoogle, updatePassword, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
