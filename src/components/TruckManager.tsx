import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Truck, Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { maskVIN, maskLicensePlate, maskIFTAAccount } from '@/lib/dataMasking';

interface Truck {
  id: string;
  unit_number: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  license_plate?: string;
  registration_state?: string;
  ifta_account_number?: string;
  fuel_type: string;
  is_active: boolean;
}

const TruckManager = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isAddingTruck, setIsAddingTruck] = useState(false);
  const [editingTruckId, setEditingTruckId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const [newTruck, setNewTruck] = useState({
    unit_number: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    license_plate: '',
    registration_state: '',
    ifta_account_number: '',
    fuel_type: 'diesel'
  });

  useEffect(() => {
    if (user) {
      fetchTrucks();
    }
  }, [user]);

  const fetchTrucks = async () => {
    try {
      const { data, error } = await supabase
        .from('trucks')
        .select('*')
        .eq('user_id', user?.id)
        .order('unit_number');

      if (error) throw error;
      setTrucks(data || []);
    } catch (error) {
      console.error('Error fetching trucks:', error);
      toast({
        title: "Error",
        description: "Failed to load trucks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTruck = async () => {
    if (!newTruck.unit_number.trim()) {
      toast({
        title: "Error",
        description: "Unit number is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trucks')
        .insert([{
          ...newTruck,
          year: newTruck.year ? parseInt(newTruck.year) : null,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setTrucks([...trucks, data]);
      setNewTruck({
        unit_number: '',
        make: '',
        model: '',
        year: '',
        vin: '',
        license_plate: '',
        registration_state: '',
        ifta_account_number: '',
        fuel_type: 'diesel'
      });
      setIsAddingTruck(false);

      toast({
        title: "Success",
        description: "Truck added successfully"
      });
    } catch (error) {
      console.error('Error adding truck:', error);
      toast({
        title: "Error",
        description: "Failed to add truck",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTruck = async (truck: Truck) => {
    try {
      const { error } = await supabase
        .from('trucks')
        .update({
          make: truck.make,
          model: truck.model,
          year: truck.year,
          vin: truck.vin,
          license_plate: truck.license_plate,
          registration_state: truck.registration_state,
          ifta_account_number: truck.ifta_account_number,
          fuel_type: truck.fuel_type,
          is_active: truck.is_active
        })
        .eq('id', truck.id);

      if (error) throw error;

      setTrucks(trucks.map(t => t.id === truck.id ? truck : t));
      setEditingTruckId(null);

      toast({
        title: "Success",
        description: "Truck updated successfully"
      });
    } catch (error) {
      console.error('Error updating truck:', error);
      toast({
        title: "Error",
        description: "Failed to update truck",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTruck = async (truckId: string) => {
    if (!confirm('Are you sure you want to delete this truck? This will also delete all associated trips.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('trucks')
        .delete()
        .eq('id', truckId);

      if (error) throw error;

      setTrucks(trucks.filter(t => t.id !== truckId));
      toast({
        title: "Success",
        description: "Truck deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting truck:', error);
      toast({
        title: "Error",
        description: "Failed to delete truck",
        variant: "destructive"
      });
    }
  };

  const TruckCard = ({ truck }: { truck: Truck }) => {
    const [editedTruck, setEditedTruck] = useState(truck);
    const [showSensitiveData, setShowSensitiveData] = useState(false);
    const isEditing = editingTruckId === truck.id;

    if (isEditing) {
      return (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                <Input
                  value={editedTruck.unit_number}
                  onChange={(e) => setEditedTruck({...editedTruck, unit_number: e.target.value})}
                  className="font-semibold w-32"
                  placeholder="Unit #"
                />
                <Badge variant={editedTruck.is_active ? "default" : "secondary"}>
                  {editedTruck.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdateTruck(editedTruck)}>
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingTruckId(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Make</Label>
                <Input
                  value={editedTruck.make || ''}
                  onChange={(e) => setEditedTruck({...editedTruck, make: e.target.value})}
                  placeholder="Make"
                />
              </div>
              <div>
                <Label>Model</Label>
                <Input
                  value={editedTruck.model || ''}
                  onChange={(e) => setEditedTruck({...editedTruck, model: e.target.value})}
                  placeholder="Model"
                />
              </div>
              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={editedTruck.year || ''}
                  onChange={(e) => setEditedTruck({...editedTruck, year: parseInt(e.target.value) || undefined})}
                  placeholder="Year"
                />
              </div>
              <div>
                <Label>VIN</Label>
                <Input
                  value={editedTruck.vin || ''}
                  onChange={(e) => setEditedTruck({...editedTruck, vin: e.target.value})}
                  placeholder="Vehicle Identification Number"
                />
              </div>
              <div>
                <Label>License Plate</Label>
                <Input
                  value={editedTruck.license_plate || ''}
                  onChange={(e) => setEditedTruck({...editedTruck, license_plate: e.target.value})}
                  placeholder="License Plate"
                />
              </div>
              <div>
                <Label>Registration State</Label>
                <Input
                  value={editedTruck.registration_state || ''}
                  onChange={(e) => setEditedTruck({...editedTruck, registration_state: e.target.value})}
                  placeholder="State"
                />
              </div>
              <div>
                <Label>IFTA Account</Label>
                <Input
                  value={editedTruck.ifta_account_number || ''}
                  onChange={(e) => setEditedTruck({...editedTruck, ifta_account_number: e.target.value})}
                  placeholder="IFTA Account #"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              <CardTitle className="text-lg">Unit #{truck.unit_number}</CardTitle>
              <Badge variant={truck.is_active ? "default" : "secondary"}>
                {truck.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                title={showSensitiveData ? "Hide sensitive data" : "Show sensitive data"}
              >
                {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingTruckId(truck.id)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDeleteTruck(truck.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {truck.make && <div><strong>Make:</strong> {truck.make}</div>}
            {truck.model && <div><strong>Model:</strong> {truck.model}</div>}
            {truck.year && <div><strong>Year:</strong> {truck.year}</div>}
            {truck.license_plate && (
              <div>
                <strong>License:</strong> {showSensitiveData ? truck.license_plate : maskLicensePlate(truck.license_plate)}
              </div>
            )}
            {truck.vin && (
              <div>
                <strong>VIN:</strong> {showSensitiveData ? truck.vin : maskVIN(truck.vin)}
              </div>
            )}
            {truck.registration_state && <div><strong>State:</strong> {truck.registration_state}</div>}
            {truck.ifta_account_number && (
              <div>
                <strong>IFTA:</strong> {showSensitiveData ? truck.ifta_account_number : maskIFTAAccount(truck.ifta_account_number)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading trucks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Truck Fleet Management</h2>
        <Button onClick={() => setIsAddingTruck(true)} disabled={isAddingTruck}>
          <Plus className="w-4 h-4 mr-2" />
          Add Truck
        </Button>
      </div>

      {isAddingTruck && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Truck</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit Number *</Label>
                <Input
                  value={newTruck.unit_number}
                  onChange={(e) => setNewTruck({...newTruck, unit_number: e.target.value})}
                  placeholder="Unit Number"
                  required
                />
              </div>
              <div>
                <Label>Make</Label>
                <Input
                  value={newTruck.make}
                  onChange={(e) => setNewTruck({...newTruck, make: e.target.value})}
                  placeholder="Make"
                />
              </div>
              <div>
                <Label>Model</Label>
                <Input
                  value={newTruck.model}
                  onChange={(e) => setNewTruck({...newTruck, model: e.target.value})}
                  placeholder="Model"
                />
              </div>
              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={newTruck.year}
                  onChange={(e) => setNewTruck({...newTruck, year: e.target.value})}
                  placeholder="Year"
                />
              </div>
              <div>
                <Label>VIN</Label>
                <Input
                  value={newTruck.vin}
                  onChange={(e) => setNewTruck({...newTruck, vin: e.target.value})}
                  placeholder="Vehicle Identification Number"
                />
              </div>
              <div>
                <Label>License Plate</Label>
                <Input
                  value={newTruck.license_plate}
                  onChange={(e) => setNewTruck({...newTruck, license_plate: e.target.value})}
                  placeholder="License Plate"
                />
              </div>
              <div>
                <Label>Registration State</Label>
                <Input
                  value={newTruck.registration_state}
                  onChange={(e) => setNewTruck({...newTruck, registration_state: e.target.value})}
                  placeholder="State"
                />
              </div>
              <div>
                <Label>IFTA Account Number</Label>
                <Input
                  value={newTruck.ifta_account_number}
                  onChange={(e) => setNewTruck({...newTruck, ifta_account_number: e.target.value})}
                  placeholder="IFTA Account #"
                />
              </div>
              <div>
                <Label>Fuel Type</Label>
                <Select value={newTruck.fuel_type} onValueChange={(value) => setNewTruck({...newTruck, fuel_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="gasoline">Gasoline</SelectItem>
                    <SelectItem value="natural_gas">Natural Gas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleAddTruck}>Add Truck</Button>
              <Button variant="outline" onClick={() => setIsAddingTruck(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {trucks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No trucks added yet. Add your first truck to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div>
          {trucks.map(truck => (
            <TruckCard key={truck.id} truck={truck} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TruckManager;