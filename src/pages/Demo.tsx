import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Calculator, FileText, Map, Receipt, BarChart3, Shield, Truck, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedDashboard } from "@/components/AnimatedDashboard";
import IFTACalculator from "@/components/IFTACalculator";
import { InteractiveStateMap } from "@/components/InteractiveStateMap";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Demo = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-foreground">IFTA Pro Interactive Demo</h1>
          <p className="text-muted-foreground mt-2">
            Full access demo - explore all features without registration
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Demo Access Notice */}
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">For Google Play Reviewers</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Demo Account Access</h3>
                  <div className="bg-background p-4 rounded-lg border text-sm font-mono">
                    <p><strong>Email:</strong> reviewer@truetrucker.com</p>
                    <p><strong>Password:</strong> GooglePlayReview2024</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Use these credentials to access the full app with sample data
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Interactive Demo Below</h3>
                  <p className="text-sm text-muted-foreground">
                    This page demonstrates all core features without requiring login. 
                    All calculations and features are fully functional with sample data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Demo Tabs */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Calculator
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Route Map
              </TabsTrigger>
              <TabsTrigger value="scanner" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Receipt Scan
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">IFTA Dashboard Overview</h3>
                  <AnimatedDashboard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculator" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">IFTA Tax Calculator</h3>
                  <IFTACalculator />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Interactive State Tax Map</h3>
                  <InteractiveStateMap />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scanner" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Receipt Scanner & OCR</h3>
                  <ReceiptScanner />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">IFTA Reports & Analytics</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Quarterly Reports</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Auto-generated IFTA reports ready for submission
                      </p>
                      <Button size="sm" variant="outline">Download Sample</Button>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Tax Analytics</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        State-by-state breakdown and trends
                      </p>
                      <Button size="sm" variant="outline">View Analytics</Button>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">Audit Defense</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Complete documentation package
                      </p>
                      <Button size="sm" variant="outline">Prepare Defense</Button>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Feature Highlights */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Time Savings</h3>
                <p className="text-muted-foreground">Reduce IFTA prep from 15+ hours to under 1 hour per quarter</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calculator className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Accuracy</h3>
                <p className="text-muted-foreground">99.9% calculation accuracy with real-time tax updates</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Audit Protection</h3>
                <p className="text-muted-foreground">Built-in audit defense with 95% success rate</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Simplify Your IFTA Compliance?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of truckers who've transformed their IFTA workflow
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Start 7-Day Free Trial
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/pricing')}>
                View Pricing Plans
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Demo;