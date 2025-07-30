import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Plus, Truck, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TripRecord {
  id: string;
  start_location: string;
  end_location: string;
  miles: number;
  date: string;
  purpose: string;
  created_at: string;
}

import { ComingSoon } from "@/components/ComingSoon";

const MileageTracker = () => {
  return <ComingSoon 
    title="Mileage Tracker Coming Soon" 
    description="Smart mileage tracking with GPS integration and automatic state detection"
    icon={MapPin}
  />;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<TripRecord[]>([]);
  
  // Form state
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [miles, setMiles] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [purpose, setPurpose] = useState('business');
  const [notes, setNotes] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!startLocation || !endLocation || !miles || !date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
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

      toast({
        title: "Success!",
        description: "Trip recorded successfully",
      });

      // Reset form
      setStartLocation('');
      setEndLocation('');
      setMiles('');
      setNotes('');
      
      // Refresh trips
      fetchTrips();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
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
                <p className="text-sm text-muted-foreground">Record your business trips</p>
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
                    <Input
                      id="miles"
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={miles}
                      onChange={(e) => setMiles(e.target.value)}
                      required
                    />
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
                Your last 10 recorded trips
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
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{trip.start_location} → {trip.end_location}</p>
                          <p className="text-sm text-muted-foreground">{trip.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{trip.miles} mi</p>
                          <p className="text-sm text-muted-foreground capitalize">{trip.purpose}</p>
                        </div>
                      </div>
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