import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, LogOut, MapPin, Receipt, Calculator, FileText, Users, Settings, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptionStatus, setSubscriptionStatus] = useState('trial');

  // Fetch user profile and subscription status
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status, subscription_tier')
          .eq('user_id', user.id)
          .single();
        
        if (data && !error) {
          setSubscriptionStatus(data.subscription_status);
        }
      }
    };
    
    if (user && !loading) {
      fetchProfile();
    }
  }, [user, loading]);

  const handleFeatureClick = (featureName: string) => {
    if (subscriptionStatus === 'trial') {
      toast({
        title: "Upgrade Required",
        description: `${featureName} is only available with a paid subscription. Upgrade now to access all features!`,
        variant: "destructive"
      });
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">TrueTrucker IFTA Pro</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Manage your IFTA compliance and track your miles efficiently.
          </p>
        </div>

        {/* Trial Banner */}
        {subscriptionStatus === 'trial' && (
          <Card className="mb-8 border-warning/20 bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-warning mb-1">⚠️ Trial Account</h3>
                  <p className="text-sm text-muted-foreground">
                    You can explore the app but functions are locked until you upgrade to a paid plan.
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Miles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">States Traveled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">This quarter</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fuel Receipts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">0</div>
              <p className="text-xs text-muted-foreground">Uploaded</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tax Owed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">$0.00</div>
              <p className="text-xs text-muted-foreground">Current quarter</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Track Miles</CardTitle>
                  <CardDescription>Log your trips and mileage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => handleFeatureClick('Track Miles')}
                disabled={subscriptionStatus === 'trial'}
              >
                {subscriptionStatus === 'trial' && <Lock className="h-4 w-4 mr-2" />}
                Start Tracking
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-secondary/10 p-2 rounded-lg">
                  <Receipt className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Scan Receipts</CardTitle>
                  <CardDescription>Upload and process fuel receipts</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleFeatureClick('Scan Receipts')}
                disabled={subscriptionStatus === 'trial'}
              >
                {subscriptionStatus === 'trial' && <Lock className="h-4 w-4 mr-2" />}
                Upload Receipt
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-accent/10 p-2 rounded-lg">
                  <Calculator className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">IFTA Calculator</CardTitle>
                  <CardDescription>Calculate taxes by state</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleFeatureClick('IFTA Calculator')}
                disabled={subscriptionStatus === 'trial'}
              >
                {subscriptionStatus === 'trial' && <Lock className="h-4 w-4 mr-2" />}
                Calculate Taxes
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-success/10 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-success" />
                </div>
                <div>
                  <CardTitle className="text-lg">Quarterly Returns</CardTitle>
                  <CardDescription>Generate and download reports</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleFeatureClick('Quarterly Returns')}
                disabled={subscriptionStatus === 'trial'}
              >
                {subscriptionStatus === 'trial' && <Lock className="h-4 w-4 mr-2" />}
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-warning/10 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-lg">Fleet Management</CardTitle>
                  <CardDescription>Manage multiple vehicles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleFeatureClick('Fleet Management')}
                disabled={subscriptionStatus === 'trial'}
              >
                {subscriptionStatus === 'trial' && <Lock className="h-4 w-4 mr-2" />}
                Manage Fleet
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-muted/20 p-2 rounded-lg">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Settings</CardTitle>
                  <CardDescription>Configure your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Open Settings</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;