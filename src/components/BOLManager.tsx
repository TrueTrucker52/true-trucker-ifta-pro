import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Eye, Printer, Download, Plus, Edit, Trash2, Calendar, Package, Truck } from 'lucide-react';
import { BOLScanner } from './BOLScanner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface BOL {
  id: string;
  bol_number: string;
  pickup_date: string;
  delivery_date: string | null;
  shipper_name: string;
  shipper_city: string;
  shipper_state: string;
  consignee_name: string;
  consignee_city: string;
  consignee_state: string;
  commodity_description: string | null;
  weight: number | null;
  pieces: number | null;
  freight_charges: number | null;
  status: string;
  notes: string | null;
  bol_image_url: string | null;
  created_at: string;
}

export const BOLManager = () => {
  const [bols, setBols] = useState<BOL[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBOL, setSelectedBOL] = useState<BOL | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBOLs();
    }
  }, [user]);

  const fetchBOLs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills_of_lading')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBols(data || []);
    } catch (error: any) {
      console.error('Error fetching BOLs:', error);
      toast({
        title: "Error",
        description: "Failed to load Bills of Lading.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBOL = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills_of_lading')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setBols(prev => prev.filter(bol => bol.id !== id));
      toast({
        title: "BOL Deleted",
        description: "Bill of Lading has been deleted successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting BOL:', error);
      toast({
        title: "Error",
        description: "Failed to delete BOL.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picked_up':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const downloadBOLReport = (bol: BOL) => {
    const content = `
BILL OF LADING REPORT
=====================

BOL Number: ${bol.bol_number}
Pickup Date: ${format(new Date(bol.pickup_date), 'MMM dd, yyyy')}
Delivery Date: ${bol.delivery_date ? format(new Date(bol.delivery_date), 'MMM dd, yyyy') : 'Not delivered'}
Status: ${formatStatus(bol.status)}

SHIPPER INFORMATION
------------------
Name: ${bol.shipper_name}
Location: ${bol.shipper_city}, ${bol.shipper_state}

CONSIGNEE INFORMATION
--------------------
Name: ${bol.consignee_name}
Location: ${bol.consignee_city}, ${bol.consignee_state}

LOAD DETAILS
-----------
Commodity: ${bol.commodity_description || 'Not specified'}
Weight: ${bol.weight ? `${bol.weight} lbs` : 'Not specified'}
Pieces: ${bol.pieces || 'Not specified'}
Freight Charges: ${bol.freight_charges ? `$${bol.freight_charges.toFixed(2)}` : 'Not specified'}

NOTES
-----
${bol.notes || 'No additional notes'}

Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BOL_${bol.bol_number}_${bol.pickup_date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printBOL = (bol: BOL) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>BOL ${bol.bol_number}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .section { margin: 20px 0; }
              .label { font-weight: bold; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>BILL OF LADING</h1>
              <p>BOL Number: ${bol.bol_number}</p>
            </div>
            
            <div class="section">
              <div class="grid">
                <div>
                  <span class="label">Pickup Date:</span> ${format(new Date(bol.pickup_date), 'MMM dd, yyyy')}
                </div>
                <div>
                  <span class="label">Delivery Date:</span> ${bol.delivery_date ? format(new Date(bol.delivery_date), 'MMM dd, yyyy') : 'Pending'}
                </div>
              </div>
            </div>

            <div class="section">
              <h3>Shipper Information</h3>
              <p><span class="label">Name:</span> ${bol.shipper_name}</p>
              <p><span class="label">Location:</span> ${bol.shipper_city}, ${bol.shipper_state}</p>
            </div>

            <div class="section">
              <h3>Consignee Information</h3>
              <p><span class="label">Name:</span> ${bol.consignee_name}</p>
              <p><span class="label">Location:</span> ${bol.consignee_city}, ${bol.consignee_state}</p>
            </div>

            <div class="section">
              <h3>Load Details</h3>
              <p><span class="label">Commodity:</span> ${bol.commodity_description || 'Not specified'}</p>
              <p><span class="label">Weight:</span> ${bol.weight ? `${bol.weight} lbs` : 'Not specified'}</p>
              <p><span class="label">Pieces:</span> ${bol.pieces || 'Not specified'}</p>
              <p><span class="label">Freight Charges:</span> ${bol.freight_charges ? `$${bol.freight_charges.toFixed(2)}` : 'Not specified'}</p>
            </div>

            ${bol.notes ? `
            <div class="section">
              <h3>Notes</h3>
              <p>${bol.notes}</p>
            </div>
            ` : ''}

            <div class="section">
              <p><small>Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}</small></p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading Bills of Lading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">BOL List</TabsTrigger>
          <TabsTrigger value="scanner">Scan New BOL</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Bills of Lading</h2>
              <p className="text-muted-foreground">Manage your load documents</p>
            </div>
            <Button onClick={() => setShowScanner(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add BOL
            </Button>
          </div>

          {bols.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bills of Lading</h3>
                <p className="text-muted-foreground mb-4">
                  Start by scanning or adding your first BOL
                </p>
                <Button onClick={() => setShowScanner(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First BOL
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {bols.map((bol) => (
                <Card key={bol.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">BOL #{bol.bol_number}</h3>
                          <Badge className={getStatusColor(bol.status)}>
                            {formatStatus(bol.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Pickup: {format(new Date(bol.pickup_date), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span>{bol.shipper_city}, {bol.shipper_state}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{bol.consignee_city}, {bol.consignee_state}</span>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <p><strong>From:</strong> {bol.shipper_name}</p>
                          <p><strong>To:</strong> {bol.consignee_name}</p>
                          {bol.weight && <p><strong>Weight:</strong> {bol.weight} lbs</p>}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedBOL(bol)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>BOL #{bol.bol_number}</DialogTitle>
                              <DialogDescription>
                                Bill of Lading Details
                              </DialogDescription>
                            </DialogHeader>
                            {selectedBOL && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">Pickup Information</h4>
                                    <p><strong>Date:</strong> {format(new Date(selectedBOL.pickup_date), 'MMM dd, yyyy')}</p>
                                    <p><strong>Shipper:</strong> {selectedBOL.shipper_name}</p>
                                    <p><strong>Location:</strong> {selectedBOL.shipper_city}, {selectedBOL.shipper_state}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Delivery Information</h4>
                                    <p><strong>Date:</strong> {selectedBOL.delivery_date ? format(new Date(selectedBOL.delivery_date), 'MMM dd, yyyy') : 'Pending'}</p>
                                    <p><strong>Consignee:</strong> {selectedBOL.consignee_name}</p>
                                    <p><strong>Location:</strong> {selectedBOL.consignee_city}, {selectedBOL.consignee_state}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">Load Details</h4>
                                  <p><strong>Commodity:</strong> {selectedBOL.commodity_description || 'Not specified'}</p>
                                  <p><strong>Weight:</strong> {selectedBOL.weight ? `${selectedBOL.weight} lbs` : 'Not specified'}</p>
                                  <p><strong>Pieces:</strong> {selectedBOL.pieces || 'Not specified'}</p>
                                  <p><strong>Freight:</strong> {selectedBOL.freight_charges ? `$${selectedBOL.freight_charges.toFixed(2)}` : 'Not specified'}</p>
                                </div>

                                {selectedBOL.notes && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Notes</h4>
                                    <p className="text-sm bg-muted p-3 rounded">{selectedBOL.notes}</p>
                                  </div>
                                )}

                                <div className="flex gap-2 pt-4">
                                  <Button onClick={() => printBOL(selectedBOL)} variant="outline">
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print
                                  </Button>
                                  <Button onClick={() => downloadBOLReport(selectedBOL)} variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => printBOL(bol)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadBOLReport(bol)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteBOL(bol.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="scanner">
          <Card>
            <CardHeader>
              <CardTitle>Scan New BOL</CardTitle>
              <CardDescription>
                Capture and save a new Bill of Lading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BOLScanner />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New BOL</DialogTitle>
            <DialogDescription>
              Scan or manually enter BOL information
            </DialogDescription>
          </DialogHeader>
          <BOLScanner />
        </DialogContent>
      </Dialog>
    </div>
  );
};