import { useState } from 'react';
import IFTADemoTour from './IFTADemoTour';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Fuel, 
  FileText, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Truck,
  DollarSign,
  Star,
  Award,
  Zap,
  Target,
  Timer,
  Shield,
  CheckCircle,
  Clock,
  BarChart3,
  Calculator,
  Users
} from 'lucide-react';

const IFTADemo = () => {
  const [selectedVehicle, setSelectedVehicle] = useState('All Vehicles');

  const fuelData = [
    { state: 'CA', miles: 2847, percentage: 32.1, fuelUsed: 593.6, taxOwed: 930.3, trend: 'up' },
    { state: 'NV', miles: 1823, percentage: 20.6, fuelUsed: 321.8, taxOwed: 445.2, trend: 'down' },
    { state: 'AZ', miles: 1456, percentage: 16.4, fuelUsed: 287.3, taxOwed: 387.8, trend: 'up' },
    { state: 'TX', miles: 1234, percentage: 13.9, fuelUsed: 245.7, taxOwed: 334.1, trend: 'up' },
    { state: 'CO', miles: 987, percentage: 11.1, fuelUsed: 198.4, taxOwed: 267.9, trend: 'down' },
    { state: 'UT', miles: 523, percentage: 5.9, fuelUsed: 105.6, taxOwed: 142.7, trend: 'up' }
  ];

  const fuelTrends = [
    { month: 'Jan', gallons: 4200, cost: 12600 },
    { month: 'Feb', gallons: 3950, cost: 11850 },
    { month: 'Mar', gallons: 4580, cost: 13740 },
    { month: 'Apr', gallons: 4890, cost: 14670 },
    { month: 'May', gallons: 5120, cost: 15360 },
    { month: 'Jun', gallons: 4750, cost: 14250 }
  ];

  const recentTrips = [
    { id: 1, route: 'Los Angeles, CA → Phoenix, AZ', miles: 372, gallons: 78.4, date: '2024-01-20' },
    { id: 2, route: 'Phoenix, AZ → Denver, CO', miles: 586, gallons: 123.2, date: '2024-01-19' },
    { id: 3, route: 'Denver, CO → Las Vegas, NV', miles: 749, gallons: 157.3, date: '2024-01-18' },
    { id: 4, route: 'Las Vegas, NV → Sacramento, CA', miles: 498, gallons: 104.6, date: '2024-01-17' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Play className="h-6 w-6 text-primary" />
              </div>
              TrueTrucker IFTA Pro Demo
            </h2>
            <p className="text-muted-foreground mt-1">
              The #1 IFTA solution that saves truckers $15,000+ annually
            </p>
          </div>
          <Badge variant="secondary" className="bg-success/10 text-success">
            Live Demo
          </Badge>
        </div>
        
        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Timer className="h-5 w-5 text-success" />
                <span className="font-semibold text-success">97% Time Savings</span>
              </div>
              <p className="text-sm text-muted-foreground">
                From 8 hours to 15 minutes per quarterly report
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold text-primary">99.8% Accuracy</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered calculations eliminate costly errors
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-warning" />
                <span className="font-semibold text-warning">$15,000+ Saved</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Average annual savings per truck in penalties & fees
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tour Component */}
        <IFTADemoTour />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-tour="overview-tab">Overview</TabsTrigger>
          <TabsTrigger value="drivers" data-tour="drivers-tab">Drivers</TabsTrigger>
          <TabsTrigger value="vehicles" data-tour="vehicles-tab">Vehicles</TabsTrigger>
          <TabsTrigger value="ifta-summary" data-tour="ifta-tab">IFTA Summary</TabsTrigger>
          <TabsTrigger value="trip-reports" data-tour="trips-tab">Trip Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-tour="key-metrics">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Total Miles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8,870</div>
                <div className="flex items-center text-xs text-success">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs last period
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  Fuel Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,752 gal</div>
                <div className="flex items-center text-xs text-destructive">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -3% vs last period
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Tax Owed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2,508</div>
                <div className="flex items-center text-xs text-warning">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +5% vs last period
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Avg MPG
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5.06</div>
                <div className="flex items-center text-xs text-success">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3 vs last period
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fuel Summary by State */}
          <Card data-tour="fuel-summary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Fuel Summary by Jurisdiction
              </CardTitle>
              <CardDescription>
                Last 7 days • Sep 24 - Sep 30 • Previous 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fuelData.map((state) => (
                  <div key={state.state} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-sm w-8">{state.state}</div>
                      <div className="text-sm text-muted-foreground">{state.percentage}%</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-sm">
                        <div className="font-medium">{state.miles.toLocaleString()} mi</div>
                        <div className="text-xs text-muted-foreground">Miles</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{state.fuelUsed} gal</div>
                        <div className="text-xs text-muted-foreground">Fuel Used</div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">${state.taxOwed}</div>
                        <div className="text-xs text-muted-foreground">Tax Owed</div>
                      </div>
                      <div className="flex items-center">
                        {state.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-success" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fuel Trends Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fuel Trends</CardTitle>
                <CardDescription>Monthly fuel consumption and costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fuelTrends.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <div className="font-medium text-sm">{month.month}</div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <div>{month.gallons} gal</div>
                          <Progress value={month.gallons / 60} className="w-20 h-2" />
                        </div>
                        <div className="text-sm font-medium">${month.cost.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Trips</CardTitle>
                <CardDescription>Latest recorded trips and fuel usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTrips.map((trip) => (
                    <div key={trip.id} className="flex flex-col p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="font-medium text-sm mb-1">{trip.route}</div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{trip.miles} miles</span>
                        <span>{trip.gallons} gallons</span>
                        <span>{trip.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Driver Performance</CardTitle>
              <CardDescription>Fuel efficiency and compliance metrics by driver</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Driver performance data would appear here</p>
                <p className="text-sm">Track individual driver fuel efficiency and compliance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Fleet Overview</CardTitle>
              <CardDescription>Monitor fuel consumption across your fleet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Vehicle fleet data would appear here</p>
                <p className="text-sm">Compare performance across different vehicles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ifta-summary" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>IFTA Tax Summary</CardTitle>
              <CardDescription>Quarterly tax calculations and reporting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-success">$2,508.32</div>
                  <div className="text-sm text-muted-foreground">Total Tax Owed</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">$1,847.65</div>
                  <div className="text-sm text-muted-foreground">Tax Paid</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-warning">$660.67</div>
                  <div className="text-sm text-muted-foreground">Balance Due</div>
                </div>
              </div>
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generate IFTA Report
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trip-reports" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip Reports</CardTitle>
              <CardDescription>Detailed breakdown of all recorded trips</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrips.map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="font-medium">{trip.route}</div>
                      <div className="text-sm text-muted-foreground">{trip.date}</div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <div className="font-medium">{trip.miles} mi</div>
                        <div className="text-xs text-muted-foreground">Distance</div>
                      </div>
                      <div>
                        <div className="font-medium">{trip.gallons} gal</div>
                        <div className="text-xs text-muted-foreground">Fuel</div>
                      </div>
                      <div>
                        <div className="font-medium">{(trip.miles / trip.gallons).toFixed(1)} MPG</div>
                        <div className="text-xs text-muted-foreground">Efficiency</div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ROI Calculator Section */}
      <div className="mt-12 space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">See Your Return on Investment</h3>
          <p className="text-muted-foreground">Real savings calculations based on industry data</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Before TrueTrucker */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Before TrueTrucker IFTA Pro</CardTitle>
              <CardDescription>Traditional IFTA compliance costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Accountant/CPA fees (quarterly)</span>
                <span className="font-medium">$1,200</span>
              </div>
              <div className="flex justify-between">
                <span>Manual data entry (40 hours)</span>
                <span className="font-medium">$800</span>
              </div>
              <div className="flex justify-between">
                <span>Late filing penalties (avg)</span>
                <span className="font-medium">$2,500</span>
              </div>
              <div className="flex justify-between">
                <span>Audit defense costs</span>
                <span className="font-medium">$3,500</span>
              </div>
              <div className="flex justify-between">
                <span>Math errors & corrections</span>
                <span className="font-medium">$1,800</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold text-destructive">
                  <span>Annual Cost Per Truck:</span>
                  <span>$39,600</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* After TrueTrucker */}
          <Card className="border-success/20">
            <CardHeader>
              <CardTitle className="text-success">With TrueTrucker IFTA Pro</CardTitle>
              <CardDescription>Automated, accurate, and compliant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>TrueTrucker subscription (annual)</span>
                <span className="font-medium">$1,200</span>
              </div>
              <div className="flex justify-between">
                <span>Time investment (4 hours)</span>
                <span className="font-medium">$80</span>
              </div>
              <div className="flex justify-between">
                <span>Late filing penalties</span>
                <span className="font-medium line-through">$0</span>
              </div>
              <div className="flex justify-between">
                <span>Audit defense (included)</span>
                <span className="font-medium line-through">$0</span>
              </div>
              <div className="flex justify-between">
                <span>Math errors (AI-powered)</span>
                <span className="font-medium line-through">$0</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold text-success">
                  <span>Annual Cost Per Truck:</span>
                  <span>$1,280</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROI Summary */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-success">$38,320</div>
                <div className="text-sm text-muted-foreground">Annual Savings Per Truck</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">2,994%</div>
                <div className="text-sm text-muted-foreground">Return on Investment</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-warning">9.6 days</div>
                <div className="text-sm text-muted-foreground">Payback Period</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitive Advantage Section */}
      <div className="mt-12 space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Why We're the #1 Choice</h3>
          <p className="text-muted-foreground">See how we compare to other solutions</p>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Feature</th>
                    <th className="p-4 font-medium text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        TrueTrucker Pro
                      </div>
                    </th>
                    <th className="p-4 font-medium text-center">Competitor A</th>
                    <th className="p-4 font-medium text-center">Competitor B</th>
                    <th className="p-4 font-medium text-center">Manual Process</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">AI Receipt Scanning</td>
                    <td className="p-4 text-center"><CheckCircle className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="p-4 text-center text-muted-foreground">Limited</td>
                    <td className="p-4 text-center text-muted-foreground">No</td>
                    <td className="p-4 text-center text-muted-foreground">No</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Real-time Calculations</td>
                    <td className="p-4 text-center"><CheckCircle className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="p-4 text-center text-muted-foreground">No</td>
                    <td className="p-4 text-center text-muted-foreground">No</td>
                    <td className="p-4 text-center text-muted-foreground">No</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Mobile App</td>
                    <td className="p-4 text-center"><CheckCircle className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="p-4 text-center text-muted-foreground">Basic</td>
                    <td className="p-4 text-center"><CheckCircle className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="p-4 text-center text-muted-foreground">No</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Audit Defense</td>
                    <td className="p-4 text-center"><CheckCircle className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="p-4 text-center text-muted-foreground">Extra Cost</td>
                    <td className="p-4 text-center text-muted-foreground">No</td>
                    <td className="p-4 text-center text-muted-foreground">No</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Setup Time</td>
                    <td className="p-4 text-center text-success font-medium">5 minutes</td>
                    <td className="p-4 text-center text-muted-foreground">2-3 hours</td>
                    <td className="p-4 text-center text-muted-foreground">1-2 days</td>
                    <td className="p-4 text-center text-muted-foreground">N/A</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium">Annual Cost (per truck)</td>
                    <td className="p-4 text-center text-success font-bold">$1,200</td>
                    <td className="p-4 text-center text-muted-foreground">$2,400</td>
                    <td className="p-4 text-center text-muted-foreground">$1,800</td>
                    <td className="p-4 text-center text-destructive font-bold">$39,600</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final CTA */}
      <div className="mt-12 text-center">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-4">Ready to Save $38,000+ Per Truck This Year?</h3>
            <p className="mb-6 text-primary-foreground/90">
              Join 15,000+ truckers who trust TrueTrucker IFTA Pro for accurate, compliant fuel tax reporting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Zap className="h-4 w-4 mr-2" />
                Start 7-Day Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Your Savings
              </Button>
            </div>
            <p className="mt-4 text-sm text-primary-foreground/80">
              ✓ No credit card required ✓ Full feature access ✓ Cancel anytime
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IFTADemo;