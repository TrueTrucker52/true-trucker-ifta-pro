import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Mail, Lock, Eye, EyeOff, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type AuthTab = 'signin' | 'signup' | 'reset';

interface SignInGuidance {
  title: string;
  description: string;
  targetTab: AuthTab;
  actionLabel: string;
}

const Auth = () => {
  const [searchParams] = useSearchParams();
  const requestedMode = searchParams.get('mode');
  const initialTab: AuthTab = requestedMode === 'signup' || requestedMode === 'reset' ? requestedMode : 'signin';
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [signInGuidance, setSignInGuidance] = useState<SignInGuidance | null>(null);
  const { signUp, signIn, resetPassword, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setSignInGuidance(null);
  }, [activeTab]);

  const checkAccountExists = async (value: string) => {
    const normalizedEmail = value.trim().toLowerCase();

    if (!normalizedEmail) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.warn('Unable to check account existence:', error);
      return null;
    }

    return Boolean(data);
  };

  const handleInvalidCredentials = async (value: string) => {
    const accountExists = await checkAccountExists(value);

    if (accountExists === false) {
      const guidance = {
        title: 'No account found',
        description: 'No account found with this email. Create an account instead to get started.',
        targetTab: 'signup' as const,
        actionLabel: 'Click Sign Up →',
      };

      setSignInGuidance(guidance);
      setActiveTab('signup');
      toast({
        title: guidance.title,
        description: guidance.description,
      });
      return;
    }

    const guidance = {
      title: 'Email or password incorrect',
      description: 'Email or password incorrect. Need an account? Click Sign Up, or reset your password if you already signed up.',
      targetTab: 'reset' as const,
      actionLabel: 'Reset password →',
    };

    setSignInGuidance(guidance);
    toast({
      title: guidance.title,
      description: guidance.description,
      variant: 'destructive',
    });
  };

  const joinFleetWithCode = async (userId: string, code: string) => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return;

    // Validate: alphanumeric, max 10 chars
    if (!/^[A-Z0-9]{1,10}$/.test(trimmedCode)) {
      toast({ title: '⚠️ Invalid fleet code', description: 'Code should be letters and numbers only.', variant: 'destructive' });
      return;
    }

    // Look up fleet by invite code
    const { data: fleet, error: fleetError } = await supabase
      .rpc('lookup_fleet_by_invite_code', { invite_code_input: trimmedCode })
      .maybeSingle();

    if (fleetError || !fleet) {
      toast({ title: '⚠️ Invalid fleet code', description: 'Check with your fleet owner for the correct code.', variant: 'destructive' });
      return;
    }

    // Check if already in a fleet
    const { data: existing } = await supabase
      .from('fleet_members')
      .select('id')
      .eq('driver_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (existing) {
      toast({ title: '⚠️ Already in a fleet', description: 'You are already part of a fleet. Leave your current fleet first.', variant: 'destructive' });
      return;
    }

    // Join fleet
    const { error: joinError } = await supabase.from('fleet_members').insert({
      fleet_id: fleet.id,
      driver_id: userId,
      status: 'active',
      invitation_status: 'accepted',
    });

    if (joinError) {
      toast({ title: 'Error', description: 'Failed to join fleet. Please try again.', variant: 'destructive' });
      return;
    }

    // Assign driver role
    await supabase.from('user_roles').upsert({
      user_id: userId,
      role: 'driver' as any,
    }, { onConflict: 'user_id,role' });

    toast({ title: `✅ You have joined ${fleet.company_name}!`, description: 'Welcome to your fleet.' });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Sign up form submitted', { email, passwordLength: password.length });
    
    if (!email || !password) {
      console.log('❌ Validation failed - missing fields');
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      console.log('❌ Validation failed - password too short');
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('📧 Calling signUp function...');
    
    try {
      const { error } = await signUp(email, password, null);
      
      if (error) {
        console.log('❌ Sign up error:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Sign up successful!');

        // If invite code provided, try to join fleet after signup
        if (inviteCode.trim()) {
          // Get the newly created user
          const { data: { user: newUser } } = await supabase.auth.getUser();
          if (newUser) {
            await joinFleetWithCode(newUser.id, inviteCode);
          }
        }

        toast({
          title: "Success!",
          description: "Account created successfully! Please check your email to confirm your account before signing in.",
        });
        // Clear form
        setEmail('');
        setPassword('');
        setInviteCode('');
      }
    } catch (error) {
      console.log('💥 Unexpected error during sign up:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Sign in form submitted', { email, passwordLength: password.length });
    
    if (!email || !password) {
      console.log('❌ Validation failed - missing fields');
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    console.log('🔑 Calling signIn function...');
    
    try {
      const { error } = await signIn(email, password, null);
      
      if (error) {
        console.log('❌ Sign in error:', error);
        if (/invalid login credentials/i.test(error.message ?? '')) {
          await handleInvalidCredentials(email);
          return;
        }

        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Sign in successful! Redirecting to dashboard...');
        navigate('/dashboard');
      }
    } catch (error) {
      console.log('💥 Unexpected error during sign in:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions",
        });
        setResetEmail('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">TrueTrucker IFTA Pro</h1>
          <p className="text-muted-foreground mt-2">Start your 7-day free trial</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AuthTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setSignInGuidance(null);
                        }}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setSignInGuidance(null);
                        }}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                    Beta mode: sign in with email and password only.
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                {signInGuidance && (
                  <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                    <p className="font-medium text-foreground">{signInGuidance.title}</p>
                    <p className="mt-1 text-muted-foreground">{signInGuidance.description}</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab(signInGuidance.targetTab)}
                      className="mt-2 font-medium text-primary hover:underline"
                    >
                      {signInGuidance.actionLabel}
                    </button>
                  </div>
                )}
                
                <div className="text-center mt-4 space-y-2">
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <p className="text-sm font-medium text-foreground">Having trouble signing in?</p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('reset')}
                      className="text-sm text-primary hover:underline font-medium mt-1"
                    >
                      Reset your password here →
                    </button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Choose a password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Fleet Invite Code */}
                  <div className="space-y-2">
                    <Label htmlFor="invite-code" className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> Have a Fleet Invite Code? <span className="text-xs">(optional)</span>
                    </Label>
                    <Input
                      id="invite-code"
                      type="text"
                      placeholder="e.g. MIKE42"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 10))}
                      maxLength={10}
                      className="uppercase tracking-widest font-mono"
                    />
                    {inviteCode && (
                      <p className="text-xs text-muted-foreground">
                        You'll be linked to your fleet owner's company after signup.
                      </p>
                    )}
                  </div>

          <div className="bg-success/10 p-3 rounded-lg">
            <p className="text-sm text-success font-medium">🎉 7-Day FREE Trial</p>
            <p className="text-xs text-muted-foreground mt-1">
              <strong>Full access to all features • No credit card required</strong>
            </p>
            <p className="text-xs text-success font-medium mt-2">
              ✅ Try everything risk-free for 7 days
             </p>
           </div>
                  
                  <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground">
                    Beta mode: no reCAPTCHA required during testing.
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Start Free Trial"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="reset" className="space-y-4 mt-6">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold">Reset Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter your email and we'll send you a reset link
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;