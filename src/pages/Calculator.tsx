import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Calculator as CalculatorIcon, 
  DollarSign, 
  Truck, 
  Calendar,
  TrendingUp,
  Zap,
  CheckCircle,
  Clock
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Calculator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentMethod: '',
    quarterlyMiles: '',
    avgFuelPrice: '',
    timeSpentOnIFTA: '',
    errorRate: ''
  });
  const [results, setResults] = useState<any>(null);

  const calculateSavings = () => {
    // Basic validation - only require method and miles
    if (!formData.currentMethod || !formData.quarterlyMiles) {
      console.log('Missing required fields:', { method: formData.currentMethod, miles: formData.quarterlyMiles });
      return;
    }
    
    console.log('Calculating savings with data:', formData);
    console.log('✅ Calculator function executed successfully');

    const miles = parseFloat(formData.quarterlyMiles) || 0;
    const fuelPrice = parseFloat(formData.avgFuelPrice) || 3.50; // Default fuel price
    const timeHours = parseFloat(formData.timeSpentOnIFTA) || 0;
    const errorRate = parseFloat(formData.errorRate) || 5; // Default 5% error rate

    // Calculate current costs based on method
    const hourlyRate = 25; // $25/hour labor cost
    const currentTimeCost = timeHours * hourlyRate * 4; // 4 quarters per year
    
    // Penalty costs based on miles and error rate
    const penaltyCost = (miles * 4 * 0.002 * errorRate / 100) * 750; // Annual penalty estimate
    
    // Method-specific costs
    let methodSpecificCost = 0;
    switch (formData.currentMethod) {
      case 'manual':
        methodSpecificCost = 500; // Paper filing and administrative costs
        break;
      case 'spreadsheet':
        methodSpecificCost = 200; // Software licenses
        break;
      case 'basic-software':
        methodSpecificCost = 800; // Basic software annual cost
        break;
      case 'accountant':
        methodSpecificCost = 2400; // Professional services
        break;
      default:
        methodSpecificCost = 300;
    }
    
    const totalCurrentCost = currentTimeCost + penaltyCost + methodSpecificCost;

    // Calculate savings with TrueTrucker
    const newTimeCost = timeHours * 0.2 * hourlyRate * 4; // 80% time reduction
    const newPenaltyCost = penaltyCost * 0.05; // 95% error reduction
    const subscriptionCost = 348; // Annual subscription ($29/month)
    const totalNewCost = newTimeCost + newPenaltyCost + subscriptionCost;

    const annualSavings = Math.max(0, totalCurrentCost - totalNewCost);
    const timeSavings = timeHours * 4 * 0.8; // Hours saved per year
    const roiPercentage = subscriptionCost > 0 ? ((annualSavings / subscriptionCost) * 100) : 0;

    const calculationResults = {
      currentCost: totalCurrentCost,
      newCost: totalNewCost,
      annualSavings,
      timeSavings,
      roiPercentage: roiPercentage.toFixed(0)
    };
    
    console.log('✅ Calculation results:', calculationResults);
    setResults(calculationResults);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-primary text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="mr-4 border-white/30 text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                IFTA Savings Calculator
              </h1>
              <p className="text-xl text-white/90">
                Discover how much time and money you could save with TrueTrucker IFTA Pro.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Input Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalculatorIcon className="h-6 w-6 mr-2 text-primary" />
                      Calculate Your Savings
                    </CardTitle>
                    <CardDescription>
                      Tell us about your current IFTA process to see your potential savings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="currentMethod">Current IFTA Method</Label>
                      <Select 
                        value={formData.currentMethod} 
                        onValueChange={(value) => setFormData({...formData, currentMethod: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your current method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual/Paper Records</SelectItem>
                          <SelectItem value="spreadsheet">Excel Spreadsheets</SelectItem>
                          <SelectItem value="basic-software">Basic IFTA Software</SelectItem>
                          <SelectItem value="accountant">Hired Accountant/Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quarterlyMiles">Quarterly Miles Driven</Label>
                      <Input
                        id="quarterlyMiles"
                        type="number"
                        placeholder="e.g., 25000"
                        value={formData.quarterlyMiles}
                        onChange={(e) => setFormData({...formData, quarterlyMiles: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="avgFuelPrice">Average Fuel Price ($/gallon)</Label>
                      <Input
                        id="avgFuelPrice"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 3.75"
                        value={formData.avgFuelPrice}
                        onChange={(e) => setFormData({...formData, avgFuelPrice: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="timeSpentOnIFTA">Hours Spent on IFTA (per quarter)</Label>
                      <Input
                        id="timeSpentOnIFTA"
                        type="number"
                        placeholder="e.g., 8"
                        value={formData.timeSpentOnIFTA}
                        onChange={(e) => setFormData({...formData, timeSpentOnIFTA: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="errorRate">Estimated Error Rate (%)</Label>
                      <Select 
                        value={formData.errorRate} 
                        onValueChange={(value) => setFormData({...formData, errorRate: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select error rate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Very Low (1%)</SelectItem>
                          <SelectItem value="3">Low (3%)</SelectItem>
                          <SelectItem value="5">Average (5%)</SelectItem>
                          <SelectItem value="10">High (10%)</SelectItem>
                          <SelectItem value="15">Very High (15%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={calculateSavings} 
                      className="w-full" 
                      size="lg"
                      variant="hero"
                      disabled={!formData.currentMethod || !formData.quarterlyMiles}
                    >
                      <DollarSign className="h-5 w-5 mr-2" />
                      Calculate My Savings
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Results */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {results ? (
                  <Card className="border-success">
                    <CardHeader>
                      <CardTitle className="flex items-center text-success">
                        <TrendingUp className="h-6 w-6 mr-2" />
                        Your Potential Savings
                      </CardTitle>
                      <CardDescription>
                        Here's how much you could save with TrueTrucker IFTA Pro:
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-destructive">
                            ${results.currentCost.toFixed(0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Current Annual Cost</div>
                        </div>
                        <div className="text-center p-4 bg-success/10 rounded-lg">
                          <div className="text-2xl font-bold text-success">
                            ${results.newCost.toFixed(0)}
                          </div>
                          <div className="text-sm text-muted-foreground">With TrueTrucker</div>
                        </div>
                      </div>

                      <div className="text-center p-6 bg-gradient-primary rounded-lg text-white">
                        <div className="text-3xl font-bold mb-2">
                          ${results.annualSavings.toFixed(0)}
                        </div>
                        <div className="text-lg">Annual Savings</div>
                        <div className="text-sm text-white/80 mt-2">
                          {results.roiPercentage}% ROI on your investment
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-primary" />
                            Time Saved
                          </span>
                          <span className="font-semibold">{results.timeSavings.toFixed(0)} hours/year</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-success" />
                            Error Reduction
                          </span>
                          <span className="font-semibold">90%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <Zap className="h-4 w-4 mr-2 text-secondary" />
                            Efficiency Gain
                          </span>
                          <span className="font-semibold">5x faster</span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t">
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={() => navigate('/auth')}
                        >
                          Start Free Trial
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate('/auth?mode=signup')}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Start Your Subscription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Savings Report</CardTitle>
                      <CardDescription>
                        Complete the form to see your personalized savings calculation.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-12">
                      <CalculatorIcon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Fill out the calculator to see how much you could save with TrueTrucker IFTA Pro.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Calculator;