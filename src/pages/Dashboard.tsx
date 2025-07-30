import { AnimatedDashboard } from "@/components/AnimatedDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { Truck, Calculator, FileText, TrendingUp, MapPin, DollarSign, Users, Settings, CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openCustomerPortal } = useSubscription();

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
              <Button onClick={() => navigate('/calculator')} variant="outline" className="h-16">
                <Calculator className="mr-2 h-5 w-5" />
                Savings Calculator
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Management & Settings */}
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
      </div>
    </div>
  );
};

export default Dashboard;