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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText, Plus, Search, ArrowLeft, Truck, Clock, CheckCircle2,
  XCircle, AlertTriangle, Calendar, Download, Eye, Trash2, PenLine,
  BarChart3, Bell, RefreshCw,
} from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type ReportStatus = 'draft' | 'pending' | 'submitted' | 'rejected';

interface ReportItem {
  id: string;
  title: string;
  quarter: string;
  driverName: string;
  totalMiles: number;
  status: ReportStatus;
  updatedAt: string;
  source: 'trip' | 'draft';
  rejectionReason?: string;
}

const statusConfig: Record<ReportStatus, { icon: React.ElementType; label: string; color: string; emoji: string }> = {
  draft: { icon: PenLine, label: 'Draft', color: 'bg-muted text-muted-foreground', emoji: '📝' },
  pending: { icon: Clock, label: 'Pending Review', color: 'bg-secondary/15 text-secondary', emoji: '⏳' },
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

const DriverDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'status'>('newest');
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  // Fetch trips as reports
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

  const isLoading = tripsLoading || draftsLoading;

  // Build unified report list
  const reports: ReportItem[] = useMemo(() => {
    const items: ReportItem[] = [];

    // Map trips → reports based on trip status
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
        driverName: profile?.company_name || user?.email?.split('@')[0] || 'Driver',
        totalMiles: Number(t.total_miles ?? 0),
        status,
        updatedAt: t.updated_at,
        source: 'trip',
      });
    });

    // Map drafts → reports
    (drafts ?? []).forEach((d) => {
      const fd = (d.form_data as Record<string, string>) ?? {};
      items.push({
        id: d.id,
        title: `IFTA Report — Draft`,
        quarter: 'In Progress',
        driverName: fd.firstName ? `${fd.firstName} ${fd.lastName || ''}`.trim() : (profile?.company_name || 'Driver'),
        totalMiles: 0,
        status: 'draft',
        updatedAt: d.updated_at,
        source: 'draft',
      });
    });

    return items;
  }, [trips, drafts, profile, user]);

  // Counts per status
  const counts = useMemo(() => {
    const c = { draft: 0, pending: 0, submitted: 0, rejected: 0 };
    reports.forEach((r) => c[r.status]++);
    return c;
  }, [reports]);

  // Default to drafts tab if drafts exist
  const effectiveTab = activeTab ?? (counts.draft > 0 ? 'draft' : 'draft');

  // Filter + search + sort
  const filtered = useMemo(() => {
    let list = reports.filter((r) => r.status === effectiveTab);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.quarter.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.driverName.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === 'oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return a.status.localeCompare(b.status);
    });

    return list;
  }, [reports, effectiveTab, search, sortBy]);

  // Notifications
  const notifications = useMemo(() => {
    const n: { icon: React.ElementType; message: string; variant: 'warning' | 'info' | 'success' }[] = [];
    if (counts.rejected > 0)
      n.push({ icon: AlertTriangle, message: `You have ${counts.rejected} rejected report${counts.rejected > 1 ? 's' : ''} that need${counts.rejected === 1 ? 's' : ''} attention`, variant: 'warning' });
    n.push({ icon: Calendar, message: 'Q1 2026 IFTA filing deadline is April 30', variant: 'info' });
    if (counts.submitted > 0)
      n.push({ icon: CheckCircle2, message: `Your most recent report was successfully submitted`, variant: 'success' });
    return n;
  }, [counts]);

  const handleDelete = (id: string, source: 'trip' | 'draft') => {
    toast({ title: 'Delete coming soon', description: 'This action will be available in a future update.' });
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Driver Dashboard</h1>
              <p className="text-xs text-muted-foreground">Manage all your IFTA reports</p>
            </div>
          </div>
          <Button
            className="hidden md:flex gap-2"
            onClick={() => navigate('/account')}
          >
            <Plus className="h-4 w-4" />
            Start New IFTA Report
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Bar */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Your Reports Overview</h2>
              </div>
              <div className="flex gap-4 min-w-max md:min-w-0">
                {([
                  { label: 'Total Submitted', value: counts.submitted, color: 'text-accent' },
                  { label: 'Pending', value: counts.pending, color: 'text-secondary' },
                  { label: 'Drafts', value: counts.draft, color: 'text-muted-foreground' },
                  { label: 'Rejected', value: counts.rejected, color: 'text-destructive' },
                ] as const).map((s) => (
                  <div key={s.label} className="flex flex-col items-center flex-1 min-w-[80px]">
                    <span className={cn('text-2xl font-bold', s.color)}>
                      {isLoading ? <Skeleton className="h-8 w-8" /> : s.value}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{s.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1 space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by date, quarter, or report ID…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs */}
            <Tabs value={effectiveTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-4">
                {(['draft', 'pending', 'submitted', 'rejected'] as ReportStatus[]).map((s) => (
                  <TabsTrigger key={s} value={s} className="text-xs sm:text-sm gap-1">
                    <span className="hidden sm:inline">{statusConfig[s].emoji}</span>
                    {statusConfig[s].label.split(' ')[0]}
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-[10px] px-1.5">
                      {isLoading ? '…' : counts[s]}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {(['draft', 'pending', 'submitted', 'rejected'] as ReportStatus[]).map((status) => (
                <TabsContent key={status} value={status} className="mt-4 space-y-3">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4 space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-2/3" />
                          <div className="flex gap-2 pt-2">
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="h-9 w-20" />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filtered.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground text-lg">{emptyMessages[status]}</p>
                        {status === 'draft' && (
                          <Button className="mt-4" onClick={() => navigate('/account')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Start New Report
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filtered.map((report) => (
                      <ReportCard
                        key={report.id}
                        report={report}
                        onDelete={handleDelete}
                        onNavigate={navigate}
                        formatDate={formatDate}
                      />
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Notifications Panel */}
          <div className="lg:w-80 space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifications.map((n, i) => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg text-sm',
                        n.variant === 'warning' && 'bg-destructive/10 text-destructive',
                        n.variant === 'info' && 'bg-primary/10 text-primary',
                        n.variant === 'success' && 'bg-accent/10 text-accent',
                      )}
                    >
                      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{n.message}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 md:hidden z-30">
        <Button className="w-full gap-2 shadow-lg" size="lg" onClick={() => navigate('/account')}>
          <Plus className="h-5 w-5" />
          Start New IFTA Report
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
};

/* ─── Report Card Component ─── */
interface ReportCardProps {
  report: ReportItem;
  onDelete: (id: string, source: 'trip' | 'draft') => void;
  onNavigate: (path: string) => void;
  formatDate: (d: string) => string;
}

const ReportCard = ({ report, onDelete, onNavigate, formatDate }: ReportCardProps) => {
  const cfg = statusConfig[report.status];
  const StatusIcon = cfg.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Truck className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold text-foreground">{report.title}</span>
              <Badge className={cn('text-xs', cfg.color)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {cfg.label}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p>Driver: {report.driverName}</p>
              {report.totalMiles > 0 && <p>Miles: {report.totalMiles.toLocaleString()}</p>}
              <p className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Last Updated: {formatDate(report.updatedAt)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {report.status === 'draft' && (
              <>
                <Button size="sm" onClick={() => onNavigate('/account')}>
                  Resume
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(report.id, report.source)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            {report.status === 'pending' && (
              <>
                <Button size="sm" variant="outline" onClick={() => onNavigate(`/trips`)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-3.5 w-3.5 mr-1" /> PDF
                </Button>
              </>
            )}
            {report.status === 'submitted' && (
              <>
                <Button size="sm" variant="outline" onClick={() => onNavigate(`/trips`)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-3.5 w-3.5 mr-1" /> PDF
                </Button>
                <Button size="sm" variant="ghost">
                  <PenLine className="h-3.5 w-3.5 mr-1" /> Request Edit
                </Button>
              </>
            )}
            {report.status === 'rejected' && (
              <>
                <Button size="sm" variant="outline" onClick={() => onNavigate(`/trips`)}>
                  <Eye className="h-3.5 w-3.5 mr-1" /> View Reason
                </Button>
                <Button size="sm" onClick={() => onNavigate('/account')}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Fix & Resubmit
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverDashboard;
