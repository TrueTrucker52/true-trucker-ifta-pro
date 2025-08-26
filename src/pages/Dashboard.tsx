import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { Truck, Calculator, FileText, TrendingUp, MapPin, DollarSign, Users, Settings, CreditCard, ArrowLeft, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { TrialGuard } from "@/components/TrialGuard";
import { BOLUpgradeIncentive } from '@/components/BOLUpgradeIncentive';
import { OptimizedLoadingState } from "@/components/OptimizedLoadingState";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    openCustomerPortal, 
    trial_active, 
    trial_days_remaining, 
    subscription_status, 
    subscribed,
    subscription_tier,
    createCheckout,
    checkSubscription,
    loading
  } = useSubscription();

  const quickStats = [
    { title: "Total Miles", value: "12,847", icon: MapPin, trend: "+8.2%" },
    { title: "Fuel Purchases", value: "$8,423", icon: DollarSign, trend: "+5.1%" },
    { title: "Tax Owed", value: "$1,247", icon: Calculator, trend: "-2.3%" },
    { title: "Active Reports", value: "3", icon: FileText, trend: "+1" }
  ];

  const monthlyData = [
    { month: "Jan", miles: 4200, fuel: 2800 },
    { month: "Feb", miles: 3800, fuel: 2600 },
    { month: "Mar", miles: 4500, fuel: 3100 },
    { month: "Apr", miles: 4100, fuel: 2900 },
    { month: "May", miles: 4300, fuel: 3000 },
    { month: "Jun", miles: 4600, fuel: 3200 }
  ];

  const chartConfig = {
    miles: { label: "Miles", color: "hsl(var(--primary))" },
    fuel: { label: "Fuel ($)", color: "hsl(var(--secondary))" }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <OptimizedLoadingState size="lg" message="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.email?.split('@')[0] || 'Driver'}</h1>
              <p className="text-muted-foreground mt-2">Your IFTA management dashboard</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>

          {/* Trial Status Card */}
          {!subscribed && (
            <Card className={`mb-6 ${trial_active ? 'border-primary/50 bg-primary/5' : 'border-destructive/50 bg-destructive/5'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${trial_active ? 'bg-primary/20' : 'bg-destructive/20'}`}>
                      {trial_active ? (
                        <Clock className="h-5 w-5 text-primary" />
                      ) : (
                        <Star className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      {trial_active ? (
                        <>
                          <h3 className="font-semibold text-foreground">
                            Free Trial Active - {trial_days_remaining} day{trial_days_remaining !== 1 ? 's' : ''} remaining
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            You're currently enjoying full access to all IFTA features
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="font-semibold text-foreground">
                            Free Trial Ended
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Subscribe to continue using all IFTA features
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trial_active && trial_days_remaining <= 3 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/pricing')}
                        >
                          View All Plans
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => createCheckout('medium')}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Upgrade Now
                        </Button>
                      </>
                    )}
                    {trial_active && trial_days_remaining > 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/pricing')}
                      >
                        Upgrade Early
                      </Button>
                    )}
                    {subscription_status === 'trial_expired' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/pricing')}
                        >
                          View All Plans
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => createCheckout('medium')}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Subscribe Now
                        </Button>
                      </>
                    )}
                    {/* Add refresh button for cached subscription issues */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await checkSubscription();
                        window.location.reload();
                      }}
                      className="text-xs"
                    >
                      🔄 Refresh Status
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {subscribed && (
            <Card className="mb-6 border-success/50 bg-success/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-success/20">
                      <Star className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {subscription_tier?.toUpperCase()} Plan Active
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        You have full access to all IFTA features
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
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-success">{stat.trend}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <TrialGuard feature="Advanced Analytics" requiredTier="small">
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Miles */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Mileage</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="miles" fill="var(--color-miles)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Fuel Spending */}
            <Card>
              <CardHeader>
                <CardTitle>Fuel Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart data={monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="fuel" stroke="var(--color-fuel)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TrialGuard>

        {/* BOL Upgrade Incentive */}
        <BOLUpgradeIncentive showIf="starter" />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button onClick={() => navigate('/ifta-reports')} className="h-16">
                <Calculator className="mr-2 h-5 w-5" />
                IFTA Tax Calculator
              </Button>
              <Button onClick={() => navigate('/scan-receipt')} variant="outline" className="h-16">
                <FileText className="mr-2 h-5 w-5" />
                Scan Receipt
              </Button>
              <Button onClick={() => navigate('/mileage-tracker')} variant="outline" className="h-16">
                <Truck className="mr-2 h-5 w-5" />
                Track Mileage
              </Button>
              <Button onClick={() => navigate('/bol-management')} variant="outline" className="h-16">
                <FileText className="mr-2 h-5 w-5" />
                BOL Management
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Tools */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Additional Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button onClick={() => navigate('/calculator')} variant="outline" className="h-16">
                <Calculator className="mr-2 h-5 w-5" />
                Savings Calculator
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Management & Settings */}
        <TrialGuard feature="Fleet Management" requiredTier="medium">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Management & Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => navigate('/vehicles')} variant="outline" className="h-16">
                  <Users className="mr-2 h-5 w-5" />
                  Fleet Management
                </Button>
                <Button onClick={openCustomerPortal} variant="outline" className="h-16">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Manage Subscription
                </Button>
                <Button onClick={() => navigate('/account')} variant="outline" className="h-16">
                  <Settings className="mr-2 h-5 w-5" />
                  Settings / Configure Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TrialGuard>
      </div>
    </div>
  );
};

export default Dashboard;