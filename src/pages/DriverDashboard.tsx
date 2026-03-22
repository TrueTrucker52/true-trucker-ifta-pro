import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, Plus, Search, Truck, Clock, CheckCircle2,
  XCircle, PenLine, Download, Eye, Trash2, RefreshCw,
  BarChart3, Camera, MapPin, Package, Calendar, User,
} from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import ELDUpgradeBanner from '@/components/eld/ELDUpgradeBanner';

type ReportStatus = 'draft' | 'pending' | 'submitted' | 'rejected';

interface ReportItem {
  id: string;
  title: string;
  quarter: string;
  totalMiles: number;
  status: ReportStatus;
  updatedAt: string;
  source: 'trip' | 'draft';
}

const statusConfig: Record<ReportStatus, { icon: React.ElementType; label: string; color: string; emoji: string }> = {
  draft: { icon: PenLine, label: 'Draft', color: 'bg-muted text-muted-foreground', emoji: '📝' },
  pending: { icon: Clock, label: 'Pending', color: 'bg-secondary/15 text-secondary', emoji: '⏳' },
  submitted: { icon: CheckCircle2, label: 'Submitted', color: 'bg-accent/15 text-accent', emoji: '✅' },
  rejected: { icon: XCircle, label: 'Rejected', color: 'bg-destructive/15 text-destructive', emoji: '❌' },
};

const emptyMessages: Record<ReportStatus, string> = {
  draft: 'No drafts yet. Start a new report to get going! 🚛',
  pending: "No pending reports. You're all caught up! ✅",
  submitted: 'No submitted reports yet. Complete your first report! 📝',
  rejected: 'No rejected reports. Great work! 🌟',
};

function getQuarterLabel(dateStr: string) {
  const d = new Date(dateStr);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} ${d.getFullYear()}`;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const DriverDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { eld_active } = useSubscription();
  const [reportSearch, setReportSearch] = useState('');
  const [bolSearch, setBolSearch] = useState('');
  const [activeTab, setActiveTab] = useState<string>('draft');

  // Fetch fleet membership for this driver
  const { data: fleetMembership } = useQuery({
    queryKey: ['driver-fleet-membership', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('fleet_members')
        .select('truck_number, fleet_id, status')
        .eq('driver_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch fleet info
  const { data: fleet } = useQuery({
    queryKey: ['driver-fleet-info', fleetMembership?.fleet_id],
    queryFn: async () => {
      if (!fleetMembership?.fleet_id) return null;
      const { data, error } = await supabase
        .rpc('get_driver_fleet_summary', { target_fleet_id: fleetMembership.fleet_id })
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!fleetMembership?.fleet_id,
  });

  // Fetch trips
  const { data: trips, isLoading: tripsLoading } = useQuery({
    queryKey: ['driver-trips', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  // Fetch drafts
  const { data: drafts, isLoading: draftsLoading } = useQuery({
    queryKey: ['driver-drafts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('form_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  // Fetch BOLs
  const { data: bols, isLoading: bolsLoading } = useQuery({
    queryKey: ['driver-bols', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('bills_of_lading')
        .select('*')
        .eq('user_id', user.id)
        .order('pickup_date', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });

  const isLoading = tripsLoading || draftsLoading;

  // Build unified report list
  const reports: ReportItem[] = useMemo(() => {
    const items: ReportItem[] = [];
    (trips ?? []).forEach((t) => {
      let status: ReportStatus = 'pending';
      const s = (t.status ?? '').toLowerCase();
      if (s === 'completed' || s === 'submitted') status = 'submitted';
      else if (s === 'rejected') status = 'rejected';
      else if (s === 'active' || s === 'in_progress') status = 'pending';
      items.push({
        id: t.id,
        title: `IFTA Report — ${getQuarterLabel(t.start_date)}`,
        quarter: getQuarterLabel(t.start_date),
        totalMiles: Number(t.total_miles ?? 0),
        status,
        updatedAt: t.updated_at,
        source: 'trip',
      });
    });
    (drafts ?? []).forEach((d) => {
      items.push({
        id: d.id,
        title: 'IFTA Report — Draft',
        quarter: 'In Progress',
        totalMiles: 0,
        status: 'draft',
        updatedAt: d.updated_at,
        source: 'draft',
      });
    });
    return items;
  }, [trips, drafts]);

  const counts = useMemo(() => {
    const c = { draft: 0, pending: 0, submitted: 0, rejected: 0 };
    reports.forEach((r) => c[r.status]++);
    return c;
  }, [reports]);

  const totalMiles = useMemo(() =>
    reports.reduce((sum, r) => sum + r.totalMiles, 0),
  [reports]);

  // Filtered reports
  const filtered = useMemo(() => {
    let list = reports.filter((r) => r.status === activeTab);
    if (reportSearch.trim()) {
      const q = reportSearch.toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q) || r.quarter.toLowerCase().includes(q));
    }
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [reports, activeTab, reportSearch]);

  // Filtered BOLs
  const filteredBols = useMemo(() => {
    if (!bolSearch.trim()) return bols ?? [];
    const q = bolSearch.toLowerCase();
    return (bols ?? []).filter(
      (b) => b.bol_number.toLowerCase().includes(q) || b.pickup_date.includes(q) || b.consignee_name.toLowerCase().includes(q),
    );
  }, [bols, bolSearch]);

  const driverName = profile?.company_name || user?.email?.split('@')[0] || 'Driver';
  const truckNumber = fleetMembership?.truck_number || 'Unassigned';
  const fleetName = fleet?.company_name || 'Solo Driver';
  const currentMonth = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background pb-40 md:pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <User className="h-4 w-4" />
                <span>Welcome back,</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{driverName}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> Truck #{truckNumber} — {fleetName}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {currentMonth}</span>
              </div>
            </div>
            {/* Desktop quick actions */}
            <div className="hidden md:flex gap-2">
              <Button onClick={() => navigate('/account')} className="gap-2"><Plus className="h-4 w-4" /> New IFTA Report</Button>
              <Button variant="outline" onClick={() => navigate('/bol-management')} className="gap-2"><Camera className="h-4 w-4" /> Scan BOL</Button>
              <Button variant="outline" onClick={() => navigate('/mileage-tracker')} className="gap-2"><MapPin className="h-4 w-4" /> View Mileage</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {!eld_active && <ELDUpgradeBanner />}

        {/* Stats Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">My Stats</h2>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex gap-4 min-w-max md:min-w-0">
                {([
                  { label: 'Total Miles', value: totalMiles.toLocaleString(), color: 'text-primary' },
                  { label: 'Submitted', value: counts.submitted, color: 'text-accent' },
                  { label: 'Drafts', value: counts.draft, color: 'text-muted-foreground' },
                  { label: 'Rejected', value: counts.rejected, color: 'text-destructive' },
                ] as const).map((s) => (
                  <div key={s.label} className="flex flex-col items-center flex-1 min-w-[80px]">
                    <span className={cn('text-2xl font-bold', s.color)}>
                      {isLoading ? <Skeleton className="h-8 w-10" /> : s.value}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Reports */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">My Reports</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports…" value={reportSearch} onChange={(e) => setReportSearch(e.target.value)} className="pl-10" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-4">
              {(['draft', 'pending', 'submitted', 'rejected'] as ReportStatus[]).map((s) => (
                <TabsTrigger key={s} value={s} className="text-xs sm:text-sm gap-1">
                  <span className="hidden sm:inline">{statusConfig[s].emoji}</span>
                  {statusConfig[s].label}
                  <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[10px] px-1.5">
                    {isLoading ? '…' : counts[s]}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {(['draft', 'pending', 'submitted', 'rejected'] as ReportStatus[]).map((status) => (
              <TabsContent key={status} value={status} className="mt-4 space-y-3">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i}><CardContent className="p-4 space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-9 w-32" /></CardContent></Card>
                  ))
                ) : filtered.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground text-lg">{emptyMessages[status]}</p>
                      {status === 'draft' && (
                        <Button className="mt-4" onClick={() => navigate('/account')}><Plus className="h-4 w-4 mr-2" /> Start New Report</Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  filtered.map((report) => {
                    const cfg = statusConfig[report.status];
                    const StatusIcon = cfg.icon;
                    return (
                      <Card key={report.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                <span className="font-semibold text-foreground">{report.title}</span>
                                <Badge className={cn('text-xs', cfg.color)}><StatusIcon className="h-3 w-3 mr-1" />{cfg.label}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {report.totalMiles > 0 && <p>Miles: {report.totalMiles.toLocaleString()}</p>}
                                <p className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Last Updated: {formatDate(report.updatedAt)}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {report.status === 'draft' && (
                                <>
                                  <Button size="sm" onClick={() => navigate('/account')}>Resume</Button>
                                  <Button size="sm" variant="destructive" onClick={() => toast({ title: 'Delete coming soon' })}><Trash2 className="h-3.5 w-3.5" /></Button>
                                </>
                              )}
                              {report.status === 'pending' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => navigate('/trips')}><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
                                  <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1" /> PDF</Button>
                                </>
                              )}
                              {report.status === 'submitted' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => navigate('/trips')}><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
                                  <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1" /> PDF</Button>
                                </>
                              )}
                              {report.status === 'rejected' && (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => navigate('/trips')}><Eye className="h-3.5 w-3.5 mr-1" /> View Reason</Button>
                                  <Button size="sm" onClick={() => navigate('/account')}><RefreshCw className="h-3.5 w-3.5 mr-1" /> Fix & Resubmit</Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* My BOLs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">My Bills of Lading</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by date or load number…" value={bolSearch} onChange={(e) => setBolSearch(e.target.value)} className="pl-10" />
          </div>

          {bolsLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
            ))
          ) : filteredBols.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No bills of lading yet. Scan your first BOL! 📦</p>
                <Button className="mt-4" variant="outline" onClick={() => navigate('/bol-management')}>
                  <Camera className="h-4 w-4 mr-2" /> Scan BOL
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredBols.map((bol) => (
                <Card key={bol.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary shrink-0" />
                          <span className="font-semibold text-foreground">
                            {formatDate(bol.pickup_date)} — Load #{bol.bol_number}
                          </span>
                          <Badge variant="secondary" className="text-xs">{bol.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {bol.shipper_name} → {bol.consignee_name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate('/bol-management')}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3.5 w-3.5 mr-1" /> Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sticky quick actions */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-card/95 backdrop-blur-md border-t border-border md:hidden z-30 safe-area-bottom">
        <div className="flex gap-2">
          <Button className="flex-1 gap-1.5 text-sm" size="sm" onClick={() => navigate('/account')}>
            <Plus className="h-4 w-4" /> New Report
          </Button>
          <Button variant="outline" className="flex-1 gap-1.5 text-sm" size="sm" onClick={() => navigate('/bol-management')}>
            <Camera className="h-4 w-4" /> Scan BOL
          </Button>
          <Button variant="outline" className="flex-1 gap-1.5 text-sm" size="sm" onClick={() => navigate('/mileage-tracker')}>
            <MapPin className="h-4 w-4" /> Mileage
          </Button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default DriverDashboard;
