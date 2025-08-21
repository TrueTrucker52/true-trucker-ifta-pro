import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ArrowLeft, MapPin, Plus, Calendar, Truck, Edit, Trash2, Save, X, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TripRecord {
  id: string;
  start_location: string;
  end_location: string;
  miles: number;
  date: string;
  purpose: string;
  notes?: string;
  created_at: string;
}

const MileageTracker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [miles, setMiles] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('business');
  const [notes, setNotes] = useState('');
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  
  // Editing state
  const [editingTrip, setEditingTrip] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    start_location: '',
    end_location: '',
    miles: '',
    date: new Date(),
    purpose: 'business',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    if (!user) return;
    
    try {
      // Using type assertion temporarily until Supabase types are regenerated
      const { data, error } = await (supabase as any)
        .from('trip_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTrips(data || []);
    } catch (error: any) {
      console.error('Error fetching trips:', error);
    }
  };

  const calculateDistance = async () => {
    if (!startLocation || !endLocation) {
      toast.error("Please enter both start and end locations");
      return;
    }

    setCalculatingDistance(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-distance', {
        body: { startLocation, endLocation }
      });

      if (error) throw error;

      if (data.distance) {
        setMiles(data.distance.toString());
        toast.success(`Distance calculated: ${data.distance} miles from ${data.startLocation} to ${data.endLocation}`);
      }
    } catch (error: any) {
      toast.error("Could not calculate distance. Please enter miles manually.");
      console.error('Error calculating distance:', error);
    } finally {
      setCalculatingDistance(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!startLocation || !endLocation || !miles || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Using type assertion temporarily until Supabase types are regenerated
      const { error } = await (supabase as any)
        .from('trip_logs')
        .insert({
          user_id: user.id,
          start_location: startLocation,
          end_location: endLocation,
          miles: parseFloat(miles),
          date,
          purpose,
          notes: notes || null
        });

      if (error) throw error;

      toast.success("Trip recorded successfully");

      // Reset form
      setStartLocation('');
      setEndLocation('');
      setMiles('');
      setNotes('');
      
      // Refresh trips
      fetchTrips();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (trip: TripRecord) => {
    setEditingTrip(trip.id);
    setEditForm({
      start_location: trip.start_location,
      end_location: trip.end_location,
      miles: trip.miles.toString(),
      date: new Date(trip.date),
      purpose: trip.purpose,
      notes: trip.notes || ''
    });
  };

  const cancelEdit = () => {
    setEditingTrip(null);
    setEditForm({
      start_location: '',
      end_location: '',
      miles: '',
      date: new Date(),
      purpose: 'business',
      notes: ''
    });
  };

  const saveEdit = async (tripId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('trip_logs')
        .update({
          start_location: editForm.start_location,
          end_location: editForm.end_location,
          miles: parseFloat(editForm.miles),
          date: format(editForm.date, 'yyyy-MM-dd'),
          purpose: editForm.purpose,
          notes: editForm.notes || null
        })
        .eq('id', tripId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Trip updated successfully");

      setEditingTrip(null);
      fetchTrips();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('trip_logs')
        .delete()
        .eq('id', tripId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Trip deleted successfully");

      fetchTrips();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Mileage Tracker</h1>
                <p className="text-sm text-muted-foreground">Record and manage your business trips</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Trip Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Record New Trip
              </CardTitle>
              <CardDescription>
                Log your business mileage for IFTA compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Starting Location</Label>
                    <Input
                      id="start"
                      placeholder="e.g., Los Angeles, CA"
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">Ending Location</Label>
                    <Input
                      id="end"
                      placeholder="e.g., Phoenix, AZ"
                      value={endLocation}
                      onChange={(e) => setEndLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="miles">Miles</Label>
                    <div className="flex gap-2">
                      <Input
                        id="miles"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        value={miles}
                        onChange={(e) => setMiles(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={calculateDistance}
                        disabled={calculatingDistance || !startLocation || !endLocation}
                        className="whitespace-nowrap"
                      >
                        {calculatingDistance ? "..." : "Auto"}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Purpose</Label>
                    <Select value={purpose} onValueChange={setPurpose}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="commute">Commute</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional details about the trip..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Recording..." : "Record Trip"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Recent Trips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Trips
              </CardTitle>
              <CardDescription>
                Your last 10 recorded trips - Edit or delete as needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trips.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No trips recorded yet</p>
                  <p className="text-sm">Start by recording your first trip</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <div key={trip.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      {editingTrip === trip.id ? (
                        // Edit Mode
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs">Start Location</Label>
                              <Input
                                value={editForm.start_location}
                                onChange={(e) => setEditForm({...editForm, start_location: e.target.value})}
                                placeholder="Starting location"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">End Location</Label>
                              <Input
                                value={editForm.end_location}
                                onChange={(e) => setEditForm({...editForm, end_location: e.target.value})}
                                placeholder="Destination"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-xs">Miles</Label>
                              <Input
                                type="number"
                                value={editForm.miles}
                                onChange={(e) => setEditForm({...editForm, miles: e.target.value})}
                                placeholder="Miles driven"
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-xs">Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full mt-1 justify-start text-left font-normal",
                                      !editForm.date && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {editForm.date ? format(editForm.date, "MMM dd, yyyy") : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <CalendarComponent
                                    mode="single"
                                    selected={editForm.date}
                                    onSelect={(date) => date && setEditForm({...editForm, date})}
                                    initialFocus
                                    className="p-3 pointer-events-auto"
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            
                            <div>
                              <Label className="text-xs">Purpose</Label>
                              <Select value={editForm.purpose} onValueChange={(value) => setEditForm({...editForm, purpose: value})}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="business">Business</SelectItem>
                                  <SelectItem value="personal">Personal</SelectItem>
                                  <SelectItem value="commute">Commute</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs">Notes</Label>
                            <Textarea
                              value={editForm.notes}
                              onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                              placeholder="Additional notes (optional)"
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={cancelEdit}
                              disabled={loading}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => saveEdit(trip.id)}
                              disabled={loading || !editForm.start_location || !editForm.end_location || !editForm.miles}
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-medium">{trip.start_location} → {trip.end_location}</p>
                              <p className="text-sm text-muted-foreground">{format(new Date(trip.date), "MMM dd, yyyy")}</p>
                              {trip.notes && (
                                <p className="text-xs text-muted-foreground mt-1 italic">"{trip.notes}"</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{trip.miles} mi</p>
                              <p className="text-sm text-muted-foreground capitalize">{trip.purpose}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 justify-end mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => startEdit(trip)}
                              disabled={loading || editingTrip !== null}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteTrip(trip.id)}
                              disabled={loading || editingTrip !== null}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MileageTracker;