import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, LogOut, MapPin, Receipt, Calculator, FileText, Users, Settings, Lock, Crown, CreditCard, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

const Dashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscribed, subscription_tier, openCustomerPortal, createCheckout } = useSubscription();

  const isPaid = subscribed && subscription_tier !== 'free';

  const handleFeatureClick = (featureName: string) => {
    if (!isPaid) {
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

        {/* Subscription Status Banner */}
        {!isPaid ? (
          <Card className="mb-8 border-warning/20 bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-warning mb-1">⚠️ Trial Account</h3>
                  <p className="text-sm text-muted-foreground">
                    You can explore the app but functions are locked until you upgrade to a paid plan.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Direct navigation to pricing/checkout
                    window.location.href = '/auth';
                  }}
                >
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Crown className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-primary mb-1">
                      {subscription_tier === 'small' && 'Small Fleet Plan'}
                      {subscription_tier === 'medium' && 'Medium Fleet Plan'}
                      {subscription_tier === 'large' && 'Large Fleet Plan'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      All features unlocked. Manage your subscription anytime.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={openCustomerPortal}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
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
                onClick={() => {
                  if (!isPaid) {
                    handleFeatureClick('Track Miles');
                  } else {
                    navigate('/mileage-tracker');
                  }
                }}
                disabled={!isPaid}
              >
                {!isPaid && <Lock className="h-4 w-4 mr-2" />}
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
                onClick={() => {
                  if (!isPaid) {
                    handleFeatureClick('Scan Receipts');
                  } else {
                    navigate('/scan-receipt');
                  }
                }}
                disabled={!isPaid}
              >
                {!isPaid && <Lock className="h-4 w-4 mr-2" />}
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
                onClick={() => {
                  if (!isPaid) {
                    handleFeatureClick('IFTA Calculator');
                  } else {
                    navigate('/ifta-reports');
                  }
                }}
                disabled={!isPaid}
              >
                {!isPaid && <Lock className="h-4 w-4 mr-2" />}
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
                disabled={!isPaid}
              >
                {!isPaid && <Lock className="h-4 w-4 mr-2" />}
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
                disabled={!isPaid}
              >
                {!isPaid && <Lock className="h-4 w-4 mr-2" />}
                Manage Fleet
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Invoice Management</CardTitle>
                  <CardDescription>Create and send customer invoices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  if (!isPaid) {
                    handleFeatureClick('Invoice Management');
                  } else {
                    navigate('/invoices');
                  }
                }}
                disabled={!isPaid}
              >
                {!isPaid && <Lock className="h-4 w-4 mr-2" />}
                Manage Invoices
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