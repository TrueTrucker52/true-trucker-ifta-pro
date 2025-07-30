import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, Download, Calendar, Truck, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TripReport {
  id: string;
  date: string;
  start_location: string;
  end_location: string;
  miles: number;
  purpose: string;
  vehicle_name?: string;
}

interface RecapData {
  period: string;
  totalMiles: number;
  totalTrips: number;
  businessMiles: number;
  personalMiles: number;
  avgMilesPerTrip: number;
}

const Reports = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<TripReport[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      fetchVehicles();
      fetchTrips();
    }
  }, [user, selectedVehicle, dateRange]);

  const fetchVehicles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true);

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchTrips = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('trip_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate)
        .order('date', { ascending: false });

      if (selectedVehicle !== 'all') {
        query = query.eq('vehicle_id', selectedVehicle);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Get vehicle names separately to avoid join issues
      const vehicleMap = new Map();
      vehicles.forEach(v => vehicleMap.set(v.id, v.vehicle_name));
      
      const formattedTrips = (data || []).map(trip => ({
        ...trip,
        vehicle_name: trip.vehicle_id ? vehicleMap.get(trip.vehicle_id) || 'Unknown Vehicle' : 'N/A'
      }));
      
      setTrips(formattedTrips);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch trip data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRecapData = (): RecapData => {
    const totalMiles = trips.reduce((sum, trip) => sum + trip.miles, 0);
    const totalTrips = trips.length;
    const businessMiles = trips.filter(trip => trip.purpose === 'business').reduce((sum, trip) => sum + trip.miles, 0);
    const personalMiles = totalMiles - businessMiles;
    const avgMilesPerTrip = totalTrips > 0 ? totalMiles / totalTrips : 0;

    return {
      period: `${dateRange.startDate} to ${dateRange.endDate}`,
      totalMiles,
      totalTrips,
      businessMiles,
      personalMiles,
      avgMilesPerTrip
    };
  };

  const exportTripSheets = () => {
    if (trips.length === 0) {
      toast({
        title: "No Data",
        description: "No trips found for the selected period",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['Date', 'Start Location', 'End Location', 'Miles', 'Purpose', 'Vehicle'].join(','),
      ...trips.map(trip => [
        trip.date,
        `"${trip.start_location}"`,
        `"${trip.end_location}"`,
        trip.miles,
        trip.purpose,
        `"${trip.vehicle_name}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trip-sheets-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Trip sheets exported successfully"
    });
  };

  const exportRecapReport = () => {
    const recap = generateRecapData();
    
    const csvContent = [
      ['Report Type', 'Period', 'Total Miles', 'Total Trips', 'Business Miles', 'Personal Miles', 'Avg Miles/Trip'].join(','),
      [
        'Mileage Recap',
        `"${recap.period}"`,
        recap.totalMiles,
        recap.totalTrips,
        recap.businessMiles,
        recap.personalMiles,
        recap.avgMilesPerTrip.toFixed(1)
      ].join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recap-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Recap report exported successfully"
    });
  };

  const recap = generateRecapData();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="bg-primary/10 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
                <p className="text-sm text-muted-foreground">Generate and export trip reports</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Report Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicle_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={fetchTrips} disabled={loading}>
                  {loading ? "Loading..." : "Update Report"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="bulk-sheets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bulk-sheets">Bulk Trip Sheets</TabsTrigger>
            <TabsTrigger value="recap">Recap Reports</TabsTrigger>
            <TabsTrigger value="trucks">Truck Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="bulk-sheets">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Bulk Trip Sheets
                    </CardTitle>
                    <CardDescription>
                      Export all trip sheets for the selected period and vehicle(s)
                    </CardDescription>
                  </div>
                  <Button onClick={exportTripSheets} disabled={trips.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{trips.length}</p>
                      <p className="text-sm text-muted-foreground">Total Trips</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{trips.reduce((sum, trip) => sum + trip.miles, 0).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Miles</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{trips.filter(trip => trip.purpose === 'business').length}</p>
                      <p className="text-sm text-muted-foreground">Business Trips</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{vehicles.length}</p>
                      <p className="text-sm text-muted-foreground">Vehicles</p>
                    </div>
                  </div>

                  {trips.length > 0 ? (
                    <div className="max-h-96 overflow-auto">
                      <table className="w-full border-collapse border border-border">
                        <thead>
                          <tr className="bg-muted">
                            <th className="border border-border p-2 text-left">Date</th>
                            <th className="border border-border p-2 text-left">Route</th>
                            <th className="border border-border p-2 text-left">Miles</th>
                            <th className="border border-border p-2 text-left">Purpose</th>
                            <th className="border border-border p-2 text-left">Vehicle</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trips.map(trip => (
                            <tr key={trip.id}>
                              <td className="border border-border p-2">{trip.date}</td>
                              <td className="border border-border p-2">{trip.start_location} → {trip.end_location}</td>
                              <td className="border border-border p-2">{trip.miles}</td>
                              <td className="border border-border p-2 capitalize">{trip.purpose}</td>
                              <td className="border border-border p-2">{trip.vehicle_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No trips found for the selected period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recap">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Recap Reports
                    </CardTitle>
                    <CardDescription>
                      Summary statistics for the selected period
                    </CardDescription>
                  </div>
                  <Button onClick={exportRecapReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Recap
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Total Mileage</h3>
                    <p className="text-3xl font-bold text-primary">{recap.totalMiles.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">miles driven</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Business Miles</h3>
                    <p className="text-3xl font-bold text-green-600">{recap.businessMiles.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{((recap.businessMiles / recap.totalMiles) * 100).toFixed(1)}% of total</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Personal Miles</h3>
                    <p className="text-3xl font-bold text-blue-600">{recap.personalMiles.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{((recap.personalMiles / recap.totalMiles) * 100).toFixed(1)}% of total</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Total Trips</h3>
                    <p className="text-3xl font-bold text-primary">{recap.totalTrips}</p>
                    <p className="text-sm text-muted-foreground">trips recorded</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Average Trip</h3>
                    <p className="text-3xl font-bold text-primary">{recap.avgMilesPerTrip.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">miles per trip</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Report Period</h3>
                    <p className="text-sm font-medium">{recap.period}</p>
                    <p className="text-sm text-muted-foreground">date range</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trucks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Truck Reports
                </CardTitle>
                <CardDescription>
                  Individual vehicle performance and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {vehicles.map(vehicle => {
                      const vehicleTrips = trips.filter(trip => trip.vehicle_name === vehicle.vehicle_name);
                      const vehicleMiles = vehicleTrips.reduce((sum, trip) => sum + trip.miles, 0);
                      
                      return (
                        <div key={vehicle.id} className="p-4 border rounded-lg">
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            {vehicle.vehicle_name}
                          </h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Miles:</span>
                              <span className="font-medium">{vehicleMiles.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Trips:</span>
                              <span className="font-medium">{vehicleTrips.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Avg. Trip:</span>
                              <span className="font-medium">
                                {vehicleTrips.length > 0 ? (vehicleMiles / vehicleTrips.length).toFixed(1) : '0'} mi
                              </span>
                            </div>
                            {vehicle.make && vehicle.model && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Vehicle:</span>
                                <span className="font-medium">{vehicle.make} {vehicle.model}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No vehicles found. Add vehicles to see truck reports.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Reports;