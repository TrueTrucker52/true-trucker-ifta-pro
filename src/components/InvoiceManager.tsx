import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Eye, DollarSign, Calendar, Mail, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Invoice {
  id: string;
  customer_email: string;
  customer_name: string | null;
  stripe_invoice_id: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
}

interface InvoiceFormData {
  customer_email: string;
  customer_name: string;
  amount: string;
  description: string;
  due_date: string;
}

const InvoiceManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    customer_email: '',
    customer_name: '',
    amount: '',
    description: '',
    due_date: '',
  });

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-invoices');
      
      if (error) throw error;
      
      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async () => {
    if (!user || !formData.customer_email || !formData.amount) {
      toast({
        title: "Validation Error", 
        description: "Customer email and amount are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const { data, error } = await supabase.functions.invoke('create-invoice', {
        body: {
          customer_email: formData.customer_email,
          customer_name: formData.customer_name || null,
          amount: Math.round(parseFloat(formData.amount) * 100), // Convert to cents
          description: formData.description || null,
          due_date: formData.due_date || null,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: "Invoice created and sent successfully!",
        });
        setIsDialogOpen(false);
        setFormData({
          customer_email: '',
          customer_name: '',
          amount: '',
          description: '',
          due_date: '',
        });
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'open': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      case 'void': return 'bg-red-500';
      case 'uncollectible': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatAmount = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please sign in to manage invoices.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Invoice Management</h2>
          <p className="text-muted-foreground">Create and manage customer invoices</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Enter the invoice details. The invoice will be automatically sent to the customer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer_email">Customer Email *</Label>
                <Input
                  id="customer_email"
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  placeholder="John Doe"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (USD) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="99.99"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Service description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <Button onClick={createInvoice} disabled={creating} className="w-full">
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create & Send Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading invoices...</span>
              </div>
            </CardContent>
          </Card>
        ) : invoices.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No invoices yet. Create your first invoice!</p>
            </CardContent>
          </Card>
        ) : (
          invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {invoice.customer_name || 'Unnamed Customer'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {invoice.customer_email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold text-foreground">
                      {formatAmount(invoice.amount, invoice.currency)}
                    </div>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.description && (
                    <p className="text-sm text-muted-foreground">{invoice.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {invoice.due_date && (
                        <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                      )}
                      <span>ID: {invoice.stripe_invoice_id?.slice(-8)}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {invoice.hosted_invoice_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      )}
                      {invoice.invoice_pdf && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                        >
                          PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default InvoiceManager;