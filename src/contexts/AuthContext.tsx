import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { securityMonitor } from '@/lib/securityMonitoring';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any;
  signUp: (email: string, password: string, captchaToken?: string | null) => Promise<{ error: any }>;
  signIn: (email: string, password: string, captchaToken?: string | null) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.warn('⚠️ supabase.auth.getSession error:', error);
        // If a stale/invalid refresh token is present, clear it out.
        supabase.auth.signOut();
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, captchaToken?: string | null) => {
    console.log('🔄 AuthContext signUp called', { email, passwordLength: password.length });
    
    // Check rate limiting
    if (securityMonitor.checkRateLimit(`signup_${email}`, 3)) {
      const error = { message: 'Too many signup attempts. Please try again later.' };
      securityMonitor.logAuthFailure(email, 'Rate limit exceeded for signup');
      return { error };
    }

    const redirectUrl = `${window.location.origin}/`;
    console.log('🔗 Redirect URL:', redirectUrl);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          ...(captchaToken ? { captchaToken } : {}),
        },
      });

      if (error) {
        console.log('❌ Supabase signUp error:', error);
        securityMonitor.logAuthFailure(email, `Signup failed: ${error.message}`);
      } else {
        console.log('✅ Supabase signUp successful');
        
        // Send welcome email to new user
        try {
          console.log('📧 Sending welcome email to:', email);
          await supabase.functions.invoke('send-welcome-email', {
            body: { email }
          });
          console.log('✅ Welcome email sent successfully');
        } catch (emailError) {
          console.log('⚠️ Welcome email failed to send:', emailError);
          // Don't return error - sign up should still succeed even if email fails
        }
      }

      return { error };
    } catch (error) {
      console.log('💥 Unexpected error in signUp:', error);
      securityMonitor.logAuthFailure(email, `Signup error: ${error}`);
      return { error };
    }
  };

  const signIn = async (email: string, password: string, captchaToken?: string | null) => {
    console.log('🔄 AuthContext signIn called', { email, passwordLength: password.length });
    
    // Check if this is a test account first
    if (email.includes('@truetrucker.com')) {
      try {
        const { data: isTestAccount } = await supabase.rpc('validate_test_account', {
          email_input: email,
          password_input: password
        });
        
        if (isTestAccount) {
          // Create a mock session for test accounts
          const mockUser = {
            id: `test-${email.split('@')[0]}`,
            email,
            app_metadata: { test_account: true },
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            role: 'authenticated'
          };
          
          setUser(mockUser as any);
          setSession({ user: mockUser, access_token: 'test-token' } as any);
          console.log('✅ Test account login successful');
          return { error: null };
        }
      } catch (testError) {
        console.log('Test account validation failed:', testError);
      }
    }
    
    // Check rate limiting
    if (securityMonitor.checkRateLimit(`signin_${email}`, 5)) {
      const error = { message: 'Too many login attempts. Please try again later.' };
      securityMonitor.logAuthFailure(email, 'Rate limit exceeded for signin');
      return { error };
    }
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        ...(captchaToken ? { options: { captchaToken } } : {}),
      });

      if (error) {
        console.log('❌ Supabase signIn error:', error);
        securityMonitor.logAuthFailure(email, `Signin failed: ${error.message}`);
        
        // Log authentication event to database
        try {
          await supabase.rpc('log_auth_event', {
            event_type: 'auth_failure',
            user_email: email,
            details: { error: error.message }
          });
        } catch (logError) {
          console.warn('Failed to log auth event:', logError);
        }
      } else {
        console.log('✅ Supabase signIn successful');
      }

      return { error };
    } catch (error) {
      console.log('💥 Unexpected error in signIn:', error);
      securityMonitor.logAuthFailure(email, `Signin error: ${error}`);
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?mode=reset`;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      return { error };
    } catch (error) {
      console.log('💥 Unexpected error in resetPassword:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    profile,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};