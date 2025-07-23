import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, FileText, TrendingUp, TrendingDown, DollarSign, Fuel, MapPin, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  calculateIFTA,
  getCurrentQuarter,
  formatCurrency,
  formatMiles,
  STATE_TAX_RATES,
  type IFTACalculationResult
} from '@/lib/iftaCalculations';

const IFTACalculator = () => {
  const { user } = useAuth();
  const [calculation, setCalculation] = useState<IFTACalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [trips, setTrips] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);

  const currentQuarter = getCurrentQuarter();

  useEffect(() => {
    // Set default to current quarter
    setSelectedQuarter(currentQuarter.quarter.toString());
    setSelectedYear(currentQuarter.year.toString());
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch trip logs
      const { data: tripData, error: tripError } = await (supabase as any)
        .from('trip_logs')
        .select('*')
        .eq('user_id', user?.id);

      if (tripError) throw tripError;

      // Fetch receipts
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', user?.id);

      if (receiptError) throw receiptError;

      setTrips(tripData || []);
      setReceipts(receiptData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data for calculations');
    }
  };

  const handleCalculate = async () => {
    if (!selectedQuarter || !selectedYear) {
      toast.error('Please select a quarter and year');
      return;
    }

    setLoading(true);
    try {
      const result = calculateIFTA(
        trips,
        receipts,
        parseInt(selectedQuarter),
        parseInt(selectedYear)
      );
      setCalculation(result);
      toast.success('IFTA calculation completed!');
    } catch (error) {
      console.error('Error calculating IFTA:', error);
      toast.error('Failed to calculate IFTA taxes');
    } finally {
      setLoading(false);
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
      years.push(year);
    }
    return years;
  };

  const getStatusColor = (amount: number) => {
    if (amount > 0) return 'text-destructive';
    if (amount < 0) return 'text-success';
    return 'text-muted-foreground';
  };

  const getStatusIcon = (amount: number) => {
    if (amount > 0) return <TrendingUp className="h-4 w-4" />;
    if (amount < 0) return <TrendingDown className="h-4 w-4" />;
    return <DollarSign className="h-4 w-4" />;
  };

  const getStatusText = (amount: number) => {
    if (amount > 0) return 'Amount Owed';
    if (amount < 0) return 'Refund Due';
    return 'No Tax Due';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            IFTA Tax Calculator
          </CardTitle>
          <CardDescription>
            Calculate quarterly fuel taxes based on your trip logs and fuel receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Quarter</label>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Q1 (Jan - Mar)</SelectItem>
                  <SelectItem value="2">Q2 (Apr - Jun)</SelectItem>
                  <SelectItem value="3">Q3 (Jul - Sep)</SelectItem>
                  <SelectItem value="4">Q4 (Oct - Dec)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {generateYearOptions().map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleCalculate} 
              disabled={loading || !selectedQuarter || !selectedYear}
              className="w-full md:w-auto"
            >
              {loading ? 'Calculating...' : 'Calculate IFTA'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {calculation && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Total Miles</p>
                </div>
                <p className="text-2xl font-bold">{formatMiles(calculation.totalMiles)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Fuel Purchased</p>
                </div>
                <p className="text-2xl font-bold">{calculation.totalFuelPurchased} gal</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Average MPG</p>
                </div>
                <p className="text-2xl font-bold">{calculation.averageMPG}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(calculation.netAmount)}
                  <p className="text-sm text-muted-foreground">{getStatusText(calculation.netAmount)}</p>
                </div>
                <p className={`text-2xl font-bold ${getStatusColor(calculation.netAmount)}`}>
                  {formatCurrency(Math.abs(calculation.netAmount))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Net Amount Alert */}
          <Alert className={calculation.netAmount !== 0 ? 'border-primary' : ''}>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Q{calculation.quarter} {calculation.year} IFTA Summary:</strong>
              {calculation.netAmount > 0 && (
                <span className="text-destructive font-medium">
                  {' '}You owe {formatCurrency(calculation.netAmount)} in fuel taxes.
                </span>
              )}
              {calculation.netAmount < 0 && (
                <span className="text-success font-medium">
                  {' '}You are due a refund of {formatCurrency(Math.abs(calculation.netAmount))}.
                </span>
              )}
              {calculation.netAmount === 0 && (
                <span className="text-muted-foreground font-medium">
                  {' '}Your fuel taxes are balanced - no payment or refund due.
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* State Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                State-by-State Breakdown
              </CardTitle>
              <CardDescription>
                Detailed fuel tax calculations for each state
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State</TableHead>
                      <TableHead className="text-right">Miles</TableHead>
                      <TableHead className="text-right">Fuel Used (gal)</TableHead>
                      <TableHead className="text-right">Fuel Purchased (gal)</TableHead>
                      <TableHead className="text-right">Tax Rate</TableHead>
                      <TableHead className="text-right">Tax Owed</TableHead>
                      <TableHead className="text-right">Net Tax</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculation.stateBreakdown.map((state) => (
                      <TableRow key={state.state}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {STATE_TAX_RATES[state.state]?.name || state.state}
                            <Badge variant="outline" className="text-xs">
                              {state.state}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatMiles(state.miles)}</TableCell>
                        <TableCell className="text-right">{state.fuelUsed}</TableCell>
                        <TableCell className="text-right">{state.fuelPurchased}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(STATE_TAX_RATES[state.state]?.taxRate || 0)}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(state.taxOwed)}</TableCell>
                        <TableCell className={`text-right font-medium ${getStatusColor(state.netTax)}`}>
                          {formatCurrency(state.netTax)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trip Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{trips.length}</p>
            <p className="text-sm text-muted-foreground">Total trip logs recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Fuel Receipt Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{receipts.length}</p>
            <p className="text-sm text-muted-foreground">Total fuel receipts scanned</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IFTACalculator;