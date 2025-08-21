import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Route, Plus, Edit, Trash2, Save, X, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { InteractiveStateMap } from '@/components/InteractiveStateMap';

interface Truck {
  id: string;
  unit_number: string;
}

interface Trip {
  id: string;
  truck_id: string;
  trip_number?: string;
  origin_city: string;
  origin_state: string;
  origin_zip?: string;
  destination_city: string;
  destination_state: string;
  destination_zip?: string;
  start_date: string;
  end_date?: string;
  total_miles?: number;
  fuel_gallons?: number;
  fuel_cost?: number;
  status: string;
  notes?: string;
  truck?: Truck;
}

interface TripMiles {
  state_code: string;
  miles: number;
}

const TripManager = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [selectedTripMiles, setSelectedTripMiles] = useState<TripMiles[]>([]);
  const [viewingMilesForTrip, setViewingMilesForTrip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const [newTrip, setNewTrip] = useState({
    truck_id: '',
    trip_number: '',
    origin_city: '',
    origin_state: '',
    origin_zip: '',
    destination_city: '',
    destination_state: '',
    destination_zip: '',
    start_date: '',
    end_date: '',
    total_miles: '',
    fuel_gallons: '',
    fuel_cost: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchTrips();
      fetchTrucks();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          trucks (id, unit_number)
        `)
        .eq('user_id', user?.id)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Error",
        description: "Failed to load trips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTrucks = async () => {
    try {
      const { data, error } = await supabase
        .from('trucks')
        .select('id, unit_number')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('unit_number');

      if (error) throw error;
      setTrucks(data || []);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    }
  };

  const fetchTripMiles = async (tripId: string) => {
    try {
      const { data, error } = await supabase
        .from('trip_miles')
        .select('*')
        .eq('trip_id', tripId);

      if (error) throw error;
      setSelectedTripMiles(data || []);
      setViewingMilesForTrip(tripId);
    } catch (error) {
      console.error('Error fetching trip miles:', error);
      toast({
        title: "Error",
        description: "Failed to load trip miles",
        variant: "destructive"
      });
    }
  };

  const handleAddTrip = async () => {
    if (!newTrip.truck_id || !newTrip.origin_city || !newTrip.origin_state || 
        !newTrip.destination_city || !newTrip.destination_state || !newTrip.start_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([{
          ...newTrip,
          total_miles: newTrip.total_miles ? parseFloat(newTrip.total_miles) : null,
          fuel_gallons: newTrip.fuel_gallons ? parseFloat(newTrip.fuel_gallons) : null,
          fuel_cost: newTrip.fuel_cost ? parseFloat(newTrip.fuel_cost) : null,
          user_id: user?.id
        }])
        .select(`
          *,
          trucks (id, unit_number)
        `)
        .single();

      if (error) throw error;

      setTrips([data, ...trips]);
      setNewTrip({
        truck_id: '',
        trip_number: '',
        origin_city: '',
        origin_state: '',
        origin_zip: '',
        destination_city: '',
        destination_state: '',
        destination_zip: '',
        start_date: '',
        end_date: '',
        total_miles: '',
        fuel_gallons: '',
        fuel_cost: '',
        notes: ''
      });
      setIsAddingTrip(false);

      toast({
        title: "Success",
        description: "Trip added successfully"
      });
    } catch (error) {
      console.error('Error adding trip:', error);
      toast({
        title: "Error",
        description: "Failed to add trip",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTrip = async (trip: Trip) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({
          origin_city: trip.origin_city,
          origin_state: trip.origin_state,
          origin_zip: trip.origin_zip,
          destination_city: trip.destination_city,
          destination_state: trip.destination_state,
          destination_zip: trip.destination_zip,
          start_date: trip.start_date,
          end_date: trip.end_date,
          total_miles: trip.total_miles,
          fuel_gallons: trip.fuel_gallons,
          fuel_cost: trip.fuel_cost,
          status: trip.status,
          notes: trip.notes
        })
        .eq('id', trip.id);

      if (error) throw error;

      setTrips(trips.map(t => t.id === trip.id ? trip : t));
      setEditingTripId(null);

      toast({
        title: "Success",
        description: "Trip updated successfully"
      });
    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: "Error",
        description: "Failed to update trip",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;

      setTrips(trips.filter(t => t.id !== tripId));
      toast({
        title: "Success",
        description: "Trip deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive"
      });
    }
  };

  const updateTripMiles = async (tripId: string, stateMiles: { state: string; miles: number }[]) => {
    try {
      // First delete existing miles for this trip
      await supabase
        .from('trip_miles')
        .delete()
        .eq('trip_id', tripId);

      // Insert new miles
      if (stateMiles.length > 0) {
        const { error } = await supabase
          .from('trip_miles')
          .insert(
            stateMiles.map(sm => ({
              trip_id: tripId,
              state_code: sm.state,
              miles: sm.miles
            }))
          );

        if (error) throw error;
      }

      // Calculate total miles
      const totalMiles = stateMiles.reduce((sum, sm) => sum + sm.miles, 0);
      
      // Update trip with total miles
      await supabase
        .from('trips')
        .update({ total_miles: totalMiles })
        .eq('id', tripId);

      toast({
        title: "Success",
        description: "Trip miles updated successfully"
      });

      // Refresh trips
      fetchTrips();
    } catch (error) {
      console.error('Error updating trip miles:', error);
      toast({
        title: "Error",
        description: "Failed to update trip miles",
        variant: "destructive"
      });
    }
  };

  const TripCard = ({ trip }: { trip: Trip }) => {
    const [editedTrip, setEditedTrip] = useState(trip);
    const isEditing = editingTripId === trip.id;

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'completed': return 'default';
        case 'active': return 'secondary';
        case 'cancelled': return 'destructive';
        default: return 'outline';
      }
    };

    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              <div>
                <CardTitle className="text-lg">
                  {trip.truck?.unit_number} - {trip.trip_number || 'No Trip #'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {trip.origin_city}, {trip.origin_state} → {trip.destination_city}, {trip.destination_state}
                </p>
              </div>
              <Badge variant={getStatusColor(trip.status)}>
                {trip.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => fetchTripMiles(trip.id)}>
                <MapPin className="w-4 h-4" />
              </Button>
              {!isEditing && (
                <Button size="sm" variant="outline" onClick={() => setEditingTripId(trip.id)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => handleDeleteTrip(trip.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={editedTrip.start_date}
                    onChange={(e) => setEditedTrip({...editedTrip, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={editedTrip.end_date || ''}
                    onChange={(e) => setEditedTrip({...editedTrip, end_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editedTrip.status} onValueChange={(value) => setEditedTrip({...editedTrip, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdateTrip(editedTrip)}>
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingTripId(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><strong>Start:</strong> {new Date(trip.start_date).toLocaleDateString()}</div>
              <div><strong>Total Miles:</strong> {trip.total_miles || 'N/A'}</div>
              <div><strong>Fuel Gallons:</strong> {trip.fuel_gallons || 'N/A'}</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading trips...</div>;
  }

  return (
    <Tabs defaultValue="trips" className="space-y-6">
      <TabsList>
        <TabsTrigger value="trips">Trips</TabsTrigger>
        <TabsTrigger value="miles">State Miles</TabsTrigger>
      </TabsList>

      <TabsContent value="trips">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Trip Management</h2>
            <Button onClick={() => setIsAddingTrip(true)} disabled={isAddingTrip || trucks.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Add Trip
            </Button>
          </div>

          {trucks.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">You need to add trucks before creating trips.</p>
              </CardContent>
            </Card>
          )}

          {isAddingTrip && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Trip</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Truck *</Label>
                    <Select value={newTrip.truck_id} onValueChange={(value) => setNewTrip({...newTrip, truck_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select truck" />
                      </SelectTrigger>
                      <SelectContent>
                        {trucks.map(truck => (
                          <SelectItem key={truck.id} value={truck.id}>
                            Unit #{truck.unit_number}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Trip Number</Label>
                    <Input
                      value={newTrip.trip_number}
                      onChange={(e) => setNewTrip({...newTrip, trip_number: e.target.value})}
                      placeholder="Trip Number (optional)"
                    />
                  </div>
                  <div>
                    <Label>Origin City *</Label>
                    <Input
                      value={newTrip.origin_city}
                      onChange={(e) => setNewTrip({...newTrip, origin_city: e.target.value})}
                      placeholder="Origin City"
                      required
                    />
                  </div>
                  <div>
                    <Label>Origin State *</Label>
                    <Input
                      value={newTrip.origin_state}
                      onChange={(e) => setNewTrip({...newTrip, origin_state: e.target.value})}
                      placeholder="Origin State"
                      required
                    />
                  </div>
                  <div>
                    <Label>Destination City *</Label>
                    <Input
                      value={newTrip.destination_city}
                      onChange={(e) => setNewTrip({...newTrip, destination_city: e.target.value})}
                      placeholder="Destination City"
                      required
                    />
                  </div>
                  <div>
                    <Label>Destination State *</Label>
                    <Input
                      value={newTrip.destination_state}
                      onChange={(e) => setNewTrip({...newTrip, destination_state: e.target.value})}
                      placeholder="Destination State"
                      required
                    />
                  </div>
                  <div>
                    <Label>Start Date *</Label>
                    <Input
                      type="date"
                      value={newTrip.start_date}
                      onChange={(e) => setNewTrip({...newTrip, start_date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={newTrip.end_date}
                      onChange={(e) => setNewTrip({...newTrip, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={handleAddTrip}>Add Trip</Button>
                  <Button variant="outline" onClick={() => setIsAddingTrip(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {trips.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Route className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No trips added yet. Add your first trip to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {trips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="miles">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">State Miles Management</h2>
          
          {viewingMilesForTrip ? (
            <Card>
              <CardHeader>
                <CardTitle>Manage State Miles</CardTitle>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setViewingMilesForTrip(null);
                    setSelectedTripMiles([]);
                  }}
                >
                  Back to Trips
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Click states to add miles for this trip. Selected states: {selectedTripMiles.length}
                  </div>
                  <InteractiveStateMap />
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">State Miles Summary</h4>
                    {selectedTripMiles.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {selectedTripMiles.map(tm => (
                          <div key={tm.state_code} className="flex justify-between">
                            <span>{tm.state_code}:</span>
                            <span>{tm.miles} miles</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No state miles recorded yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Select a trip from the trips tab to manage state miles.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TripManager;