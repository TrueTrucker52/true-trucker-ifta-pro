import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, Truck, Plus, Copy, Building2, UserPlus, RefreshCw, Mail,
  MessageSquare, UserMinus, UserX, PenLine, BarChart3, Package,
  FileText, Search, Eye, Download, CheckCircle2, Clock, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import { cn } from '@/lib/utils';

function getQuarterLabel(dateStr: string) {
  const d = new Date(dateStr);
  return `Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const FleetDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [editingTruck, setEditingTruck] = useState<string | null>(null);
  const [truckInput, setTruckInput] = useState('');
  const [bolSearch, setBolSearch] = useState('');
  const [bolFilter, setBolFilter] = useState('all');

  // ─── Data fetching ───
  const { data: fleet, isLoading: fleetLoading } = useQuery({
    queryKey: ['fleet', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('fleets').select('*').eq('owner_id', user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['fleet-members', fleet?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('fleet_members').select('*').eq('fleet_id', fleet!.id).order('joined_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!fleet?.id,
  });

  const activeDriverIds = useMemo(() => members.filter(m => m.status === 'active').map(m => m.driver_id), [members]);

  // Fetch driver profiles
  const { data: driverProfiles = [] } = useQuery({
    queryKey: ['fleet-driver-profiles', activeDriverIds],
    queryFn: async () => {
      if (activeDriverIds.length === 0) return [];
      const { data, error } = await supabase.from('profiles').select('user_id, email, company_name').in('user_id', activeDriverIds);
      if (error) throw error;
      return data;
    },
    enabled: activeDriverIds.length > 0,
  });

  // Fetch all fleet drivers' trips
  const { data: fleetTrips = [] } = useQuery({
    queryKey: ['fleet-trips', activeDriverIds],
    queryFn: async () => {
      if (activeDriverIds.length === 0) return [];
      const { data, error } = await supabase.from('trips').select('*').in('user_id', activeDriverIds).order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: activeDriverIds.length > 0,
  });

  // Fetch all fleet drivers' BOLs
  const { data: fleetBols = [], isLoading: bolsLoading } = useQuery({
    queryKey: ['fleet-bols', activeDriverIds],
    queryFn: async () => {
      if (activeDriverIds.length === 0) return [];
      const { data, error } = await supabase.from('bills_of_lading').select('*').in('user_id', activeDriverIds).order('pickup_date', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: activeDriverIds.length > 0,
  });

  // Fetch fleet trucks
  const { data: fleetTrucks = [] } = useQuery({
    queryKey: ['fleet-trucks', activeDriverIds],
    queryFn: async () => {
      if (activeDriverIds.length === 0) return [];
      const { data, error } = await supabase.from('trucks').select('*').in('user_id', activeDriverIds).eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: activeDriverIds.length > 0,
  });

  // ─── Helper lookups ───
  const profileMap = useMemo(() => {
    const m = new Map<string, { email: string; name: string }>();
    driverProfiles.forEach(p => m.set(p.user_id, { email: p.email, name: p.company_name || p.email.split('@')[0] }));
    return m;
  }, [driverProfiles]);

  const memberByDriverId = useMemo(() => {
    const m = new Map<string, typeof members[0]>();
    members.forEach(mem => m.set(mem.driver_id, mem));
    return m;
  }, [members]);

  const driverName = (uid: string) => profileMap.get(uid)?.name || uid.slice(0, 8);

  // ─── Fleet stats ───
  const fleetStats = useMemo(() => {
    const totalMiles = fleetTrips.reduce((s, t) => s + Number(t.total_miles ?? 0), 0);
    const submitted = fleetTrips.filter(t => ['completed', 'submitted'].includes((t.status ?? '').toLowerCase())).length;
    const pending = fleetTrips.filter(t => ['active', 'in_progress'].includes((t.status ?? '').toLowerCase())).length;
    const drafts = fleetTrips.filter(t => (t.status ?? '').toLowerCase() === 'draft').length;
    return { totalMiles, submitted, pending, drafts };
  }, [fleetTrips]);

  // ─── Filtered BOLs ───
  const filteredBols = useMemo(() => {
    let list = fleetBols;
    if (bolFilter !== 'all') list = list.filter(b => b.user_id === bolFilter);
    if (bolSearch.trim()) {
      const q = bolSearch.toLowerCase();
      list = list.filter(b => b.bol_number.toLowerCase().includes(q) || b.pickup_date.includes(q) || b.consignee_name.toLowerCase().includes(q));
    }
    return list;
  }, [fleetBols, bolFilter, bolSearch]);

  // ─── Per-driver report stats ───
  const driverReportStats = useMemo(() => {
    const m = new Map<string, { submitted: number; pending: number; drafts: number; totalMiles: number; lastBol: typeof fleetBols[0] | null }>();
    activeDriverIds.forEach(id => m.set(id, { submitted: 0, pending: 0, drafts: 0, totalMiles: 0, lastBol: null }));
    fleetTrips.forEach(t => {
      const s = m.get(t.user_id);
      if (!s) return;
      s.totalMiles += Number(t.total_miles ?? 0);
      const st = (t.status ?? '').toLowerCase();
      if (['completed', 'submitted'].includes(st)) s.submitted++;
      else if (['active', 'in_progress'].includes(st)) s.pending++;
      else if (st === 'draft') s.drafts++;
    });
    fleetBols.forEach(b => {
      const s = m.get(b.user_id);
      if (s && !s.lastBol) s.lastBol = b;
    });
    return m;
  }, [activeDriverIds, fleetTrips, fleetBols]);

  // ─── Mutations ───
  const createFleet = useMutation({
    mutationFn: async (name: string) => {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase.from('fleets').insert({ owner_id: user!.id, company_name: name, invite_code: inviteCode }).select().single();
      if (error) throw error;
      await supabase.from('user_roles').upsert({ user_id: user!.id, role: 'fleet_owner' as any }, { onConflict: 'user_id,role' });
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fleet'] }); toast({ title: '✅ Fleet created!' }); setShowCreateForm(false); setCompanyName(''); },
    onError: (err: any) => { toast({ title: 'Error', description: err.message, variant: 'destructive' }); },
  });

  const regenerateCode = useMutation({
    mutationFn: async () => {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase.from('fleets').update({ invite_code: newCode }).eq('id', fleet!.id);
      if (error) throw error;
      return newCode;
    },
    onSuccess: (c) => { queryClient.invalidateQueries({ queryKey: ['fleet'] }); toast({ title: `🔄 New code: ${c}` }); },
  });

  const updateMemberStatus = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: string }) => {
      const { error } = await supabase.from('fleet_members').update({ status }).eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fleet-members'] }); toast({ title: '✅ Status updated.' }); },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from('fleet_members').delete().eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fleet-members'] }); toast({ title: '🗑️ Driver removed.' }); },
  });

  const updateTruckNumber = useMutation({
    mutationFn: async ({ memberId, truckNumber }: { memberId: string; truckNumber: string }) => {
      const { error } = await supabase.from('fleet_members').update({ truck_number: truckNumber.trim() || null }).eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['fleet-members'] }); setEditingTruck(null); toast({ title: '🚛 Truck # updated.' }); },
  });

  const copyInviteCode = () => {
    if (fleet?.invite_code) { navigator.clipboard.writeText(fleet.invite_code); toast({ title: '📋 Copied!' }); }
  };

  const shareViaText = () => {
    if (fleet) window.open(`sms:?body=${encodeURIComponent(`Join "${fleet.company_name}" on TrueTrucker! Code: ${fleet.invite_code}`)}`);
  };

  const shareViaEmail = () => {
    if (fleet) window.open(`mailto:?subject=${encodeURIComponent(`Join ${fleet.company_name}`)}&body=${encodeURIComponent(`Join my fleet on TrueTrucker IFTA Pro.\n\nInvite code: ${fleet.invite_code}\nSign up: ${window.location.origin}/auth?mode=signup`)}`);
  };

  const activeMembers = members.filter(m => m.status === 'active');

  // ─── Render ───
  if (fleetLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto p-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!fleet) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-card border-b border-border p-4">
          <div className="container mx-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="text-lg font-bold text-foreground">Fleet Dashboard</h1>
          </div>
        </div>
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader className="text-center">
              <Building2 className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Create Your Fleet</CardTitle>
              <CardDescription>Set up your trucking company to manage drivers and trucks.</CardDescription>
            </CardHeader>
            <CardContent>
              {showCreateForm ? (
                <div className="space-y-4 max-w-sm mx-auto">
                  <Input placeholder="Company name" value={companyName} onChange={e => setCompanyName(e.target.value)} maxLength={100} />
                  <div className="flex gap-2">
                    <Button onClick={() => createFleet.mutate(companyName)} disabled={!companyName.trim() || createFleet.isPending} className="flex-1">
                      {createFleet.isPending ? 'Creating…' : 'Create Fleet'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowCreateForm(true)} className="w-full max-w-sm mx-auto block"><Plus className="h-4 w-4 mr-2" /> Create Fleet</Button>
              )}
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* ─── Header ─── */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-5 w-5" /></Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" /> {fleet.company_name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span>Fleet ID: {fleet.id.slice(0, 8)}</span>
                  <span>Invite Code: <span className="font-mono font-bold text-primary">{fleet.invite_code}</span></span>
                  <span>Active Drivers: {activeMembers.length}</span>
                  <span>Trucks: {fleetTrucks.length}</span>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate('/fleet-map')} className="bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4 mr-1" /> Live Map
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* ─── Fleet Stats ─── */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Fleet Overview This Quarter</h2>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex gap-4 min-w-max md:min-w-0">
                {([
                  { label: 'Total Miles', value: fleetStats.totalMiles.toLocaleString(), color: 'text-primary' },
                  { label: 'Submitted', value: fleetStats.submitted, color: 'text-accent' },
                  { label: 'Pending', value: fleetStats.pending, color: 'text-secondary' },
                  { label: 'Drafts', value: fleetStats.drafts, color: 'text-muted-foreground' },
                ] as const).map(s => (
                  <div key={s.label} className="flex flex-col items-center flex-1 min-w-[80px]">
                    <span className={cn('text-2xl font-bold', s.color)}>{s.value}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Driver Cards ─── */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Drivers</h2>
          {membersLoading ? (
            <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-40 w-full" />)}</div>
          ) : activeMembers.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No active drivers yet. Share your invite code! 🚛</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeMembers.map(member => {
                const stats = driverReportStats.get(member.driver_id);
                const name = driverName(member.driver_id);
                const lastBol = stats?.lastBol;
                return (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" /> {name}
                          </p>
                          <p className="text-sm text-muted-foreground">Truck #{member.truck_number || 'Unassigned'}</p>
                        </div>
                        <Badge className="bg-accent/15 text-accent">🟢 Active</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Miles This Quarter: {(stats?.totalMiles ?? 0).toLocaleString()}</p>
                        {lastBol && (
                          <p className="flex items-center gap-1">
                            <Package className="h-3 w-3" /> Last BOL: {formatDate(lastBol.pickup_date)} — Load #{lastBol.bol_number}
                          </p>
                        )}
                        <p className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-accent" /> {stats?.submitted ?? 0} Submitted</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-secondary" /> {stats?.pending ?? 0} Pending</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => navigate('/trips')}><Eye className="h-3.5 w-3.5 mr-1" /> Reports</Button>
                        <Button size="sm" variant="outline" onClick={() => navigate('/bol-management')}><Package className="h-3.5 w-3.5 mr-1" /> BOLs</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Fleet BOL Library ─── */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> All Fleet BOLs</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by date or load number…" value={bolSearch} onChange={e => setBolSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={bolFilter} onValueChange={setBolFilter}>
              <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by driver" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {activeDriverIds.map(id => (
                  <SelectItem key={id} value={id}>{driverName(id)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {bolsLoading ? (
            <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filteredBols.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No BOLs found. 📦</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {filteredBols.slice(0, 20).map(bol => {
                const mem = memberByDriverId.get(bol.user_id);
                return (
                  <Card key={bol.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 space-y-0.5">
                        <p className="font-semibold text-foreground text-sm">
                          {formatDate(bol.pickup_date)} — {driverName(bol.user_id)} — Truck #{mem?.truck_number || '?'} — Load #{bol.bol_number}
                        </p>
                        <p className="text-xs text-muted-foreground">{bol.shipper_name} → {bol.consignee_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
                        <Button size="sm" variant="outline"><Download className="h-3.5 w-3.5 mr-1" /> Download</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Fleet IFTA Reports ─── */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Fleet IFTA Reports</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline"><FileText className="h-4 w-4 mr-2" /> Generate Combined Fleet Report</Button>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Download All Q1 Reports</Button>
          </div>
          {activeDriverIds.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {activeDriverIds.map(id => {
                const stats = driverReportStats.get(id);
                const status = (stats?.submitted ?? 0) > 0 ? '✅' : (stats?.pending ?? 0) > 0 ? '⏳' : '📝';
                return (
                  <Badge key={id} variant="secondary" className="text-sm py-1 px-3">
                    {driverName(id)} — Q1 2026 {status}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Invite Drivers ─── */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">🚛 Invite Drivers</CardTitle>
            <CardDescription>Share this code with drivers when they sign up.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground font-medium">Fleet Invite Code</p>
              <p className="text-3xl font-mono font-bold tracking-[0.3em] text-primary">{fleet.invite_code}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button variant="outline" size="sm" onClick={copyInviteCode}><Copy className="h-4 w-4 mr-1" /> Copy</Button>
              <Button variant="outline" size="sm" onClick={shareViaText}><MessageSquare className="h-4 w-4 mr-1" /> Text</Button>
              <Button variant="outline" size="sm" onClick={shareViaEmail}><Mail className="h-4 w-4 mr-1" /> Email</Button>
              <Button variant="outline" size="sm" onClick={() => regenerateCode.mutate()} disabled={regenerateCode.isPending}>
                <RefreshCw className={cn('h-4 w-4 mr-1', regenerateCode.isPending && 'animate-spin')} /> New Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ─── Manage Drivers ─── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><UserPlus className="h-5 w-5" /> Manage Drivers</CardTitle>
              <Badge variant="secondary">{members.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>No drivers yet. Share your invite code! 🚛</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map(member => {
                  const name = driverName(member.driver_id);
                  const isActive = member.status === 'active';
                  return (
                    <div key={member.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{name}</p>
                          {editingTruck === member.id ? (
                            <div className="flex items-center gap-1 mt-1">
                              <Input value={truckInput} onChange={e => setTruckInput(e.target.value)} placeholder="Truck #101" className="h-7 text-xs w-28" maxLength={20} />
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateTruckNumber.mutate({ memberId: member.id, truckNumber: truckInput })}>Save</Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingTruck(null)}>✕</Button>
                            </div>
                          ) : (
                            <button onClick={() => { setEditingTruck(member.id); setTruckInput(member.truck_number || ''); }} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                              <Truck className="h-3 w-3" /> {member.truck_number || 'Assign truck #'} <PenLine className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {isActive ? '🟢 Active' : '🟡 Inactive'}
                        </Badge>
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {isActive ? (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateMemberStatus.mutate({ memberId: member.id, status: 'inactive' })}>
                            <UserMinus className="h-3 w-3 mr-1" /> Deactivate
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateMemberStatus.mutate({ memberId: member.id, status: 'active' })}>
                            <UserPlus className="h-3 w-3 mr-1" /> Reactivate
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => { if (confirm('Remove this driver?')) removeMember.mutate(member.id); }}>
                          <UserX className="h-3 w-3 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default FleetDashboard;
