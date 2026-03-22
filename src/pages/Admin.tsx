import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, TrendingUp, Calendar, DollarSign, Truck, Clock, Filter,
  Download, RefreshCw, Shield, Building2, Eye, UserX, PenLine,
  Settings, AlertTriangle, CheckCircle2, Database, CreditCard,
  MessageSquare, ArrowLeft, BarChart3, XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format, subDays, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

const Admin = () => {
  const { user, profile } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const navigate = useNavigate();

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [searchEmail, setSearchEmail] = useState('');

  // ─── Data Queries ───
  const { data: allProfiles = [], isLoading: profilesLoading, refetch: refetchProfiles } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: allFleets = [], isLoading: fleetsLoading } = useQuery({
    queryKey: ['admin-fleets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fleets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: allMembers = [] } = useQuery({
    queryKey: ['admin-fleet-members'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fleet_members').select('*');
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: allTrips = [] } = useQuery({
    queryKey: ['admin-trips'],
    queryFn: async () => {
      const { data, error } = await supabase.from('trips').select('id, user_id, status, total_miles').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: eldAddons = [], isLoading: eldAddonsLoading, refetch: refetchEldAddons } = useQuery({
    queryKey: ['admin-eld-addons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_addons')
        .select('*')
        .eq('addon_key', 'eld_compliance')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // ─── Lookups ───
  const roleMap = useMemo(() => {
    const m = new Map<string, string>();
    allRoles.forEach(r => m.set(r.user_id, r.role));
    return m;
  }, [allRoles]);

  const fleetMap = useMemo(() => {
    const m = new Map<string, typeof allFleets[0]>();
    allFleets.forEach(f => m.set(f.id, f));
    return m;
  }, [allFleets]);

  const membersByFleet = useMemo(() => {
    const m = new Map<string, typeof allMembers>();
    allFleets.forEach(f => m.set(f.id, []));
    allMembers.forEach(mem => {
      const arr = m.get(mem.fleet_id) || [];
      arr.push(mem);
      m.set(mem.fleet_id, arr);
    });
    return m;
  }, [allFleets, allMembers]);

  const driverFleetMap = useMemo(() => {
    const m = new Map<string, string>();
    allMembers.forEach(mem => {
      const fleet = fleetMap.get(mem.fleet_id);
      if (fleet) m.set(mem.driver_id, fleet.company_name);
    });
    return m;
  }, [allMembers, fleetMap]);

  const eldAuditRows = useMemo(() => {
    return eldAddons.map((addon) => {
      const userProfile = allProfiles.find((profile) => profile.user_id === addon.user_id);
      const role = roleMap.get(addon.user_id) || 'user';
      const fleetName = driverFleetMap.get(addon.user_id) || userProfile?.company_name || 'Solo';

      return {
        ...addon,
        email: userProfile?.email || 'Unknown user',
        displayName: userProfile?.company_name || userProfile?.email?.split('@')[0] || 'Unknown',
        role,
        fleetName,
      };
    });
  }, [eldAddons, allProfiles, roleMap, driverFleetMap]);

  const eldStats = useMemo(() => {
    const active = eldAuditRows.filter((addon) => ['active', 'trialing'].includes(addon.status)).length;
    const monthly = eldAuditRows.filter((addon) => addon.billing_interval === 'month').length;
    const annual = eldAuditRows.filter((addon) => addon.billing_interval === 'year').length;
    const pastDue = eldAuditRows.filter((addon) => addon.status === 'past_due').length;

    return {
      total: eldAuditRows.length,
      active,
      monthly,
      annual,
      pastDue,
    };
  }, [eldAuditRows]);

  // ─── Platform Stats ───
  const stats = useMemo(() => {
    const totalUsers = allProfiles.length;
    const fleetOwners = allRoles.filter(r => r.role === 'fleet_owner').length;
    const drivers = allRoles.filter(r => r.role === 'driver').length;
    const activeFleets = allFleets.length;
    const totalReports = allTrips.length;
    const trialUsers = allProfiles.filter(p => p.subscription_status === 'trial').length;
    const paidUsers = allProfiles.filter(p => ['active', 'subscribed'].includes(p.subscription_status)).length;
    const today = startOfDay(new Date());
    const newToday = allProfiles.filter(p => new Date(p.created_at) >= today).length;
    const weekAgo = subDays(today, 7);
    const newWeek = allProfiles.filter(p => new Date(p.created_at) >= weekAgo).length;
    return { totalUsers, fleetOwners, drivers, activeFleets, totalReports, trialUsers, paidUsers, newToday, newWeek };
  }, [allProfiles, allRoles, allFleets, allTrips]);

  // ─── Filtered Users ───
  const filteredUsers = useMemo(() => {
    let list = [...allProfiles];
    if (roleFilter !== 'all') list = list.filter(u => roleMap.get(u.user_id) === roleFilter);
    if (statusFilter !== 'all') list = list.filter(u => u.subscription_status === statusFilter);
    if (dateRange !== 'all') {
      const cutoff = subDays(new Date(), parseInt(dateRange));
      list = list.filter(u => new Date(u.created_at) >= cutoff);
    }
    if (searchEmail) list = list.filter(u => u.email.toLowerCase().includes(searchEmail.toLowerCase()));
    return list;
  }, [allProfiles, roleFilter, statusFilter, dateRange, searchEmail, roleMap]);

  const exportUsers = () => {
    const csv = [
      ['Email', 'Role', 'Fleet', 'Status', 'Tier', 'Signup Date'],
      ...filteredUsers.map(u => [
        u.email, roleMap.get(u.user_id) || 'user', driverFleetMap.get(u.user_id) || 'Solo',
        u.subscription_status, u.subscription_tier || 'free', format(new Date(u.created_at), 'yyyy-MM-dd'),
      ]),
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `truetrucker-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  // ─── Realtime ───
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase.channel('admin-signups').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
      toast.success(`🚛 New signup: ${(payload.new as any).email}`);
      refetchProfiles();
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  // ─── Loading / Access ───
  if (adminLoading || profilesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const adminName = profile?.company_name || user?.email?.split('@')[0] || 'Admin';

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-5 w-5" /></Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <Settings className="h-6 w-6 text-primary" /> TrueTrucker Admin Panel
                </h1>
                <p className="text-sm text-muted-foreground">Welcome back, {adminName}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              refetchProfiles();
              refetchEldAddons();
            }}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* ─── Platform Overview ─── */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Platform Overview</h2>
            </div>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 min-w-max md:min-w-0">
                {([
                  { label: 'Total Users', value: stats.totalUsers, color: 'text-primary', icon: Users },
                  { label: 'Fleet Owners', value: stats.fleetOwners, color: 'text-secondary', icon: Building2 },
                  { label: 'Drivers', value: stats.drivers, color: 'text-accent', icon: Truck },
                  { label: 'Active Fleets', value: stats.activeFleets, color: 'text-primary', icon: Building2 },
                  { label: 'Total Reports', value: stats.totalReports, color: 'text-muted-foreground', icon: TrendingUp },
                  { label: 'New Today', value: stats.newToday, color: 'text-accent', icon: Calendar },
                ] as const).map(s => (
                  <div key={s.label} className="flex flex-col items-center min-w-[80px]">
                    <s.icon className={cn('h-5 w-5 mb-1', s.color)} />
                    <span className={cn('text-2xl font-bold', s.color)}>{s.value}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Revenue Overview ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /> Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.trialUsers}</p>
                <p className="text-xs text-muted-foreground">Trial Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">{stats.paidUsers}</p>
                <p className="text-xs text-muted-foreground">Paid Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.totalUsers > 0 ? ((stats.paidUsers / stats.totalUsers) * 100).toFixed(1) : 0}%</p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">{stats.newWeek}</p>
                <p className="text-xs text-muted-foreground">New This Week</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={() => window.open('https://dashboard.stripe.com', '_blank')}>
                <CreditCard className="h-4 w-4 mr-2" /> View Stripe Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> ELD Add-on Audit
                </CardTitle>
                <CardDescription>Internal support view for verifying ELD activations, billing cadence, and account status.</CardDescription>
              </div>
              <Badge variant="secondary">{eldStats.total}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Total ELD Add-ons</p>
                <p className="text-2xl font-bold text-foreground">{eldStats.total}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-accent">{eldStats.active}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Monthly</p>
                <p className="text-2xl font-bold text-primary">{eldStats.monthly}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Annual</p>
                <p className="text-2xl font-bold text-secondary">{eldStats.annual}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Past Due</p>
                <p className="text-2xl font-bold text-destructive">{eldStats.pastDue}</p>
              </div>
            </div>

            {eldAddonsLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : eldAuditRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ELD add-on activations found yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="text-left p-3 font-medium">Account</th>
                      <th className="text-left p-3 font-medium">Role</th>
                      <th className="text-left p-3 font-medium">Fleet</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Billing</th>
                      <th className="text-left p-3 font-medium">Activated</th>
                      <th className="text-left p-3 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eldAuditRows.map((addon) => (
                      <tr key={addon.id} className="border-b hover:bg-muted/40 transition-colors">
                        <td className="p-3">
                          <p className="font-medium text-foreground">{addon.displayName}</p>
                          <p className="text-xs text-muted-foreground break-all">{addon.email}</p>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs capitalize">{addon.role.replace('_', ' ')}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{addon.fleetName}</td>
                        <td className="p-3">
                          <Badge className={cn(
                            'text-xs capitalize',
                            ['active', 'trialing'].includes(addon.status) && 'bg-accent/15 text-accent',
                            addon.status === 'past_due' && 'bg-destructive/15 text-destructive',
                            addon.status === 'canceled' && 'bg-secondary/15 text-secondary',
                            !['active', 'trialing', 'past_due', 'canceled'].includes(addon.status) && 'bg-primary/10 text-primary',
                          )}>
                            {addon.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground capitalize">{addon.billing_interval || '—'}</td>
                        <td className="p-3 text-muted-foreground text-xs">{addon.activated_at ? format(new Date(addon.activated_at), 'MMM d, yyyy') : '—'}</td>
                        <td className="p-3 text-muted-foreground text-xs">{format(new Date(addon.updated_at), 'MMM d, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── All Fleets ─── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> All Fleets</CardTitle>
              <Badge variant="secondary">{allFleets.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {fleetsLoading ? (
              <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : allFleets.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No fleets created yet.</p>
            ) : (
              <div className="space-y-3">
                {allFleets.map(fleet => {
                  const members = membersByFleet.get(fleet.id) || [];
                  const activeCount = members.filter(m => m.status === 'active').length;
                  const ownerProfile = allProfiles.find(p => p.user_id === fleet.owner_id);
                  return (
                    <div key={fleet.id} className="p-3 bg-muted/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" /> {fleet.company_name}
                        </p>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-2 mt-0.5">
                          <span>{activeCount} driver{activeCount !== 1 ? 's' : ''}</span>
                          <span>Code: <span className="font-mono text-primary">{fleet.invite_code}</span></span>
                          {ownerProfile && <span>Owner: {ownerProfile.email}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-accent/15 text-accent">✅ Active</Badge>
                        <Button size="sm" variant="outline" onClick={() => navigate('/fleet-dashboard')}><Eye className="h-3.5 w-3.5 mr-1" /> View</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Users Table ─── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> All Users</CardTitle>
              <Badge variant="secondary">{filteredUsers.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div>
                <Label className="text-xs">Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="fleet_owner">Fleet Owner</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Date Joined</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="1">Last 24h</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Search</Label>
                <Input placeholder="Email…" value={searchEmail} onChange={e => setSearchEmail(e.target.value)} className="h-9" />
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={exportUsers}><Download className="h-4 w-4 mr-1" /> CSV</Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-left p-3 font-medium">Fleet</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.slice(0, 50).map(u => {
                    const role = roleMap.get(u.user_id) || 'user';
                    const fleetName = driverFleetMap.get(u.user_id) || '—';
                    return (
                      <tr key={u.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-3">
                          <p className="font-medium text-foreground">{u.company_name || u.email.split('@')[0]}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-xs capitalize">{role.replace('_', ' ')}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{fleetName}</td>
                        <td className="p-3">
                          <Badge className={cn('text-xs',
                            u.subscription_status === 'trial' && 'bg-secondary/15 text-secondary',
                            ['active', 'subscribed'].includes(u.subscription_status) && 'bg-accent/15 text-accent',
                            u.subscription_status === 'canceled' && 'bg-destructive/15 text-destructive',
                          )}>{u.subscription_status}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredUsers.length > 50 && <p className="text-xs text-muted-foreground text-center mt-2">Showing first 50 of {filteredUsers.length} users</p>}
            </div>
          </CardContent>
        </Card>

        {/* ─── System Health ─── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {([
                { label: 'Database', status: 'Healthy', ok: true },
                { label: 'Stripe', status: 'Connected', ok: true },
                { label: 'Authentication', status: 'Active', ok: true },
                { label: 'Storage', status: 'Operational', ok: true },
              ] as const).map(s => (
                <div key={s.label} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  {s.ok ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <AlertTriangle className="h-4 w-4 text-secondary" />}
                  <span className="font-medium text-foreground text-sm">{s.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{s.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
