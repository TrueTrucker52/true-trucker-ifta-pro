import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Upload,
  FileText,
  Trash2,
  Edit2,
  Download,
  Search,
  DollarSign,
  Truck,
  Package,
  CheckCircle2,
  X,
} from 'lucide-react';

interface Load {
  id: string;
  carrier_name: string;
  broker_name: string | null;
  load_number: string | null;
  pickup_date: string | null;
  delivery_date: string | null;
  rate_amount: number | null;
  origin: string | null;
  destination: string | null;
  status: string;
  rate_con_url: string | null;
  rate_con_filename: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_transit: 'bg-blue-100 text-blue-800 border-blue-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  invoiced: 'bg-purple-100 text-purple-800 border-purple-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  invoiced: 'Invoiced',
  cancelled: 'Cancelled',
};

const EMPTY_FORM = {
  carrier_name: 'Kountry Transportation',
  broker_name: '',
  load_number: '',
  pickup_date: '',
  delivery_date: '',
  rate_amount: '',
  origin: '',
  destination: '',
  status: 'pending',
  notes: '',
};

interface LoadManagerProps {
  carrierFilter?: string;
}

const LoadManager = ({ carrierFilter }: LoadManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchLoads();
  }, [user]);

  const fetchLoads = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('loads')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (carrierFilter) {
        query = query.ilike('carrier_name', `%${carrierFilter}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLoads((data as Load[]) || []);
    } catch (err: any) {
      toast({ title: 'Error loading loads', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingLoad(null);
    setForm({ ...EMPTY_FORM });
    setPendingFile(null);
    setDialogOpen(true);
  };

  const openEdit = (load: Load) => {
    setEditingLoad(load);
    setForm({
      carrier_name: load.carrier_name,
      broker_name: load.broker_name || '',
      load_number: load.load_number || '',
      pickup_date: load.pickup_date || '',
      delivery_date: load.delivery_date || '',
      rate_amount: load.rate_amount?.toString() || '',
      origin: load.origin || '',
      destination: load.destination || '',
      status: load.status,
      notes: load.notes || '',
    });
    setPendingFile(null);
    setDialogOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
  };

  const uploadRateCon = async (file: File): Promise<{ url: string; filename: string } | null> => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user!.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('rate-cons')
        .upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('rate-cons').getPublicUrl(path);
      // Use signed URL instead since bucket is private
      const { data: signed, error: signErr } = await supabase.storage
        .from('rate-cons')
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (signErr) throw signErr;

      return { url: signed.signedUrl, filename: file.name };
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.broker_name.trim() && !form.load_number.trim()) {
      toast({ title: 'Missing info', description: 'Enter at least a broker name or load number.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      let rate_con_url = editingLoad?.rate_con_url || null;
      let rate_con_filename = editingLoad?.rate_con_filename || null;

      if (pendingFile) {
        const result = await uploadRateCon(pendingFile);
        if (result) {
          rate_con_url = result.url;
          rate_con_filename = result.filename;
        }
      }

      const payload = {
        user_id: user!.id,
        carrier_name: form.carrier_name.trim() || 'Kountry Transportation',
        broker_name: form.broker_name.trim() || null,
        load_number: form.load_number.trim() || null,
        pickup_date: form.pickup_date || null,
        delivery_date: form.delivery_date || null,
        rate_amount: form.rate_amount ? parseFloat(form.rate_amount) : null,
        origin: form.origin.trim() || null,
        destination: form.destination.trim() || null,
        status: form.status,
        rate_con_url,
        rate_con_filename,
        notes: form.notes.trim() || null,
      };

      if (editingLoad) {
        const { error } = await supabase.from('loads').update(payload).eq('id', editingLoad.id);
        if (error) throw error;
        toast({ title: 'Load updated' });
      } else {
        const { error } = await supabase.from('loads').insert(payload);
        if (error) throw error;
        toast({ title: 'Load added' });
      }

      setDialogOpen(false);
      fetchLoads();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this load?')) return;
    try {
      const { error } = await supabase.from('loads').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Load deleted' });
      fetchLoads();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    }
  };

  const filtered = loads.filter((l) => {
    const matchSearch =
      !search ||
      [l.broker_name, l.load_number, l.origin, l.destination, l.carrier_name]
        .some((v) => v?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = loads
    .filter((l) => l.status !== 'cancelled')
    .reduce((sum, l) => sum + (l.rate_amount || 0), 0);

  const stats = [
    { label: 'Total Loads', value: loads.length, icon: Package, color: 'text-blue-600' },
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'In Transit', value: loads.filter((l) => l.status === 'in_transit').length, icon: Truck, color: 'text-orange-500' },
    { label: 'Delivered', value: loads.filter((l) => l.status === 'delivered').length, icon: CheckCircle2, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`h-8 w-8 ${s.color} shrink-0`} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search loads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add Load
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Loads {carrierFilter ? `— ${carrierFilter}` : ''}
            <span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading loads...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No loads found. Click "Add Load" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Load #</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Pickup</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rate Con</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((load) => (
                    <TableRow key={load.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {load.load_number || '—'}
                      </TableCell>
                      <TableCell>{load.broker_name || '—'}</TableCell>
                      <TableCell className="text-sm">
                        {load.pickup_date
                          ? new Date(load.pickup_date + 'T00:00:00').toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {load.delivery_date
                          ? new Date(load.delivery_date + 'T00:00:00').toLocaleDateString()
                          : '—'}
                      </TableCell>
                      <TableCell className="font-semibold text-green-700">
                        {load.rate_amount != null
                          ? `$${load.rate_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {load.origin && load.destination
                          ? `${load.origin} → ${load.destination}`
                          : load.origin || load.destination || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_COLORS[load.status] || ''}`}
                        >
                          {STATUS_LABELS[load.status] || load.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {load.rate_con_url ? (
                          <a
                            href={load.rate_con_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            {load.rate_con_filename
                              ? load.rate_con_filename.length > 16
                                ? load.rate_con_filename.slice(0, 14) + '…'
                                : load.rate_con_filename
                              : 'View'}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(load)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(load.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLoad ? 'Edit Load' : 'Add New Load'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Carrier Name</Label>
              <Input
                value={form.carrier_name}
                onChange={(e) => setForm((f) => ({ ...f, carrier_name: e.target.value }))}
                placeholder="Kountry Transportation"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Broker Name</Label>
              <Input
                value={form.broker_name}
                onChange={(e) => setForm((f) => ({ ...f, broker_name: e.target.value }))}
                placeholder="e.g. Atlantic Logistics"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Load Number</Label>
              <Input
                value={form.load_number}
                onChange={(e) => setForm((f) => ({ ...f, load_number: e.target.value }))}
                placeholder="e.g. 0443418"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rate Amount ($)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.rate_amount}
                onChange={(e) => setForm((f) => ({ ...f, rate_amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Pickup Date</Label>
              <Input
                type="date"
                value={form.pickup_date}
                onChange={(e) => setForm((f) => ({ ...f, pickup_date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Delivery Date</Label>
              <Input
                type="date"
                value={form.delivery_date}
                onChange={(e) => setForm((f) => ({ ...f, delivery_date: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Origin</Label>
              <Input
                value={form.origin}
                onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                placeholder="City, State"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Destination</Label>
              <Input
                value={form.destination}
                onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                placeholder="City, State"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rate Con Upload */}
            <div className="space-y-1.5">
              <Label>Rate Con (PDF / Image)</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {pendingFile
                    ? pendingFile.name.length > 20
                      ? pendingFile.name.slice(0, 18) + '…'
                      : pendingFile.name
                    : editingLoad?.rate_con_filename
                    ? 'Replace File'
                    : 'Upload Rate Con'}
                </Button>
                {(pendingFile || editingLoad?.rate_con_filename) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setPendingFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {editingLoad?.rate_con_filename && !pendingFile && (
                <p className="text-xs text-muted-foreground">
                  Current: {editingLoad.rate_con_filename}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || uploading}>
              {saving || uploading ? 'Saving...' : editingLoad ? 'Update Load' : 'Add Load'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoadManager;
