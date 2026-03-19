import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BottomNavigation from '@/components/BottomNavigation';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, Fuel, MapPin, FileText, Download, BarChart3, Truck, Lightbulb, Users, DollarSign } from 'lucide-react';
import { STATE_TAX_RATES, calculateFuelUsed, formatCurrency, formatMiles } from '@/lib/iftaCalculations';
import { cn } from '@/lib/utils';
import { format, subMonths, startOfQuarter, endOfQuarter, startOfMonth, endOfMonth } from 'date-fns';

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];

const QUARTER_DEADLINES: Record<number, string> = { 1: 'April 30', 2: 'July 31', 3: 'October 31', 4: 'January 31' };

function getQuarterRange(q: number, y: number) {
  const start = new Date(y, (q - 1) * 3, 1);
  const end = endOfQuarter(start);
  return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
}

function getCurrentQuarter() {
  const now = new Date();
  return { quarter: Math.ceil((now.getMonth() + 1) / 3), year: now.getFullYear() };
}

const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role, isAdmin, isFleetOwner } = useUserRole();
  const current = getCurrentQuarter();
  const [selectedQ, setSelectedQ] = useState(current.quarter);
  const [selectedY, setSelectedY] = useState(current.year);
  const range = getQuarterRange(selectedQ, selectedY);

  // Fetch trips for the user (or fleet drivers if fleet owner)
  const { data: trips = [] } = useQuery({
    queryKey: ['analytics-trips', user?.id, range.start, range.end, role],
    queryFn: async () => {
      const { data } = await supabase.from('trips').select('*')
        .gte('start_date', range.start).lte('start_date', range.end)
        .order('start_date', { ascending: true });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch trip_miles for state breakdown
  const tripIds = trips.map(t => t.id);
  const { data: tripMiles = [] } = useQuery({
    queryKey: ['analytics-trip-miles', tripIds],
    queryFn: async () => {
      if (!tripIds.length) return [];
      const { data } = await supabase.from('trip_miles').select('*').in('trip_id', tripIds);
      return data || [];
    },
    enabled: tripIds.length > 0,
  });

  // Fetch receipts
  const { data: receipts = [] } = useQuery({
    queryKey: ['analytics-receipts', user?.id, range.start, range.end],
    queryFn: async () => {
      const { data } = await supabase.from('receipts').select('*')
        .gte('receipt_date', range.start).lte('receipt_date', range.end)
        .order('receipt_date', { ascending: true });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch fleet members + profiles for fleet owner view
  const { data: fleetMembers = [] } = useQuery({
    queryKey: ['analytics-fleet-members', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('fleet_members').select('*, fleets(company_name)').eq('status', 'active');
      return data || [];
    },
    enabled: !!user?.id && (isFleetOwner || isAdmin),
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['analytics-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('user_id, email, subscription_status, subscription_tier, created_at');
      return data || [];
    },
    enabled: isAdmin,
  });

  // === Computed analytics ===
  const totalMiles = useMemo(() => trips.reduce((s, t) => s + (Number(t.total_miles) || 0), 0), [trips]);
  const totalFuelCost = useMemo(() => receipts.reduce((s, r) => s + (Number(r.total_amount) || 0), 0), [receipts]);
  const totalGallons = useMemo(() => receipts.reduce((s, r) => s + (Number(r.gallons) || 0), 0), [receipts]);
  const avgMPG = totalGallons > 0 ? totalMiles / totalGallons : 0;

  // Miles by state from trip_miles
  const milesByState = useMemo(() => {
    const map: Record<string, number> = {};
    tripMiles.forEach(tm => {
      map[tm.state_code] = (map[tm.state_code] || 0) + Number(tm.miles);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([state, miles]) => ({
      state,
      name: STATE_TAX_RATES[state]?.name || state,
      miles: Math.round(miles),
      pct: totalMiles > 0 ? Math.round((miles / totalMiles) * 100) : 0,
    }));
  }, [tripMiles, totalMiles]);

  // Fuel by state from receipts
  const fuelByState = useMemo(() => {
    const map: Record<string, { gallons: number; cost: number }> = {};
    receipts.forEach(r => {
      const sc = r.state_code || 'UNK';
      if (!map[sc]) map[sc] = { gallons: 0, cost: 0 };
      map[sc].gallons += Number(r.gallons) || 0;
      map[sc].cost += Number(r.total_amount) || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].cost - a[1].cost).map(([state, d]) => ({
      state,
      name: STATE_TAX_RATES[state]?.name || state,
      gallons: Math.round(d.gallons * 100) / 100,
      cost: Math.round(d.cost * 100) / 100,
      pricePerGal: d.gallons > 0 ? Math.round((d.cost / d.gallons) * 100) / 100 : 0,
    }));
  }, [receipts]);

  // IFTA tax calculation per state
  const iftaBreakdown = useMemo(() => {
    return milesByState.map(ms => {
      const rate = STATE_TAX_RATES[ms.state]?.taxRate || 0;
      const fuelUsed = avgMPG > 0 ? ms.miles / avgMPG : 0;
      const taxOwed = fuelUsed * rate;
      const fuelState = fuelByState.find(f => f.state === ms.state);
      const fuelPurchased = fuelState?.gallons || 0;
      const taxPaid = fuelPurchased * rate;
      const netTax = Math.round((taxOwed - taxPaid) * 100) / 100;
      return { state: ms.state, name: ms.name, miles: ms.miles, fuelUsed: Math.round(fuelUsed * 10) / 10, fuelPurchased, taxOwed: Math.round(taxOwed * 100) / 100, taxPaid: Math.round(taxPaid * 100) / 100, netTax };
    });
  }, [milesByState, fuelByState, avgMPG]);

  const totalTaxOwed = iftaBreakdown.reduce((s, i) => s + Math.max(0, i.netTax), 0);
  const totalTaxCredits = Math.abs(iftaBreakdown.reduce((s, i) => s + Math.min(0, i.netTax), 0));
  const netAmountDue = Math.round((totalTaxOwed - totalTaxCredits) * 100) / 100;

  // Monthly mileage trend (last 6 months)
  const mileageTrend = useMemo(() => {
    const months: { month: string; miles: number; fuel: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const ms = format(startOfMonth(d), 'yyyy-MM-dd');
      const me = format(endOfMonth(d), 'yyyy-MM-dd');
      const monthTrips = trips.filter(t => t.start_date >= ms && t.start_date <= me);
      const monthReceipts = receipts.filter(r => r.receipt_date >= ms && r.receipt_date <= me);
      months.push({
        month: format(d, 'MMM'),
        miles: Math.round(monthTrips.reduce((s, t) => s + (Number(t.total_miles) || 0), 0)),
        fuel: Math.round(monthReceipts.reduce((s, r) => s + (Number(r.total_amount) || 0), 0)),
      });
    }
    return months;
  }, [trips, receipts]);

  const statesCount = milesByState.length;
  const deadline = QUARTER_DEADLINES[selectedQ];

  // CSV export
  const exportCSV = () => {
    const rows = [['State', 'Miles', 'Fuel Used (gal)', 'Tax Owed', 'Tax Paid', 'Net Tax']];
    iftaBreakdown.forEach(i => rows.push([i.name, String(i.miles), String(i.fuelUsed), `$${i.taxOwed}`, `$${i.taxPaid}`, `$${i.netTax}`]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `ifta-analytics-Q${selectedQ}-${selectedY}.csv`; a.click();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Analytics</h1>
          </div>
          <div className="ml-auto flex gap-2">
            <Select value={`Q${selectedQ}`} onValueChange={v => setSelectedQ(Number(v.replace('Q', '')))}>
              <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4].map(q => <SelectItem key={q} value={`Q${q}`}>Q{q}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={String(selectedY)} onValueChange={v => setSelectedY(Number(v))}>
              <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2024,2025,2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Total Miles</p>
              <p className="text-xl font-bold">{formatMiles(totalMiles)}</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600"><TrendingUp className="h-3 w-3" />This Qtr</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Fuel Cost</p>
              <p className="text-xl font-bold">{formatCurrency(totalFuelCost)}</p>
              <p className="text-xs text-muted-foreground">{totalGallons.toFixed(0)} gal</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-destructive">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">IFTA Owed</p>
              <p className="text-xl font-bold">{formatCurrency(netAmountDue)}</p>
              <p className="text-xs text-muted-foreground">Due {deadline}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">States Run</p>
              <p className="text-xl font-bold">{statesCount}</p>
              <p className="text-xs text-muted-foreground">This Qtr</p>
            </CardContent>
          </Card>
        </div>

        {/* Mileage Trends Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Mileage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mileageTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(v: number) => formatMiles(v)} />
                  <Line type="monotone" dataKey="miles" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Miles by State */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Miles by State — Q{selectedQ} {selectedY}</CardTitle>
              <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-3 w-3 mr-1" />CSV</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {milesByState.slice(0, 8).map((ms, i) => (
              <div key={ms.state} className="flex items-center gap-3">
                <span className="text-xs font-medium w-20 truncate">{ms.name}</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${ms.pct}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                </div>
                <span className="text-xs font-semibold w-20 text-right">{formatMiles(ms.miles)} mi</span>
                <span className="text-xs text-muted-foreground w-10 text-right">{ms.pct}%</span>
              </div>
            ))}
            {milesByState.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No trip data for this period</p>}
          </CardContent>
        </Card>

        {/* Fuel Analytics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Fuel className="h-4 w-4 text-orange-500" />Fuel Analytics — Q{selectedQ} {selectedY}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div><p className="text-xs text-muted-foreground">Total Gallons</p><p className="font-bold">{totalGallons.toFixed(0)}</p></div>
              <div><p className="text-xs text-muted-foreground">Total Cost</p><p className="font-bold">{formatCurrency(totalFuelCost)}</p></div>
              <div><p className="text-xs text-muted-foreground">Avg $/Gallon</p><p className="font-bold">{totalGallons > 0 ? `$${(totalFuelCost / totalGallons).toFixed(2)}` : '$0.00'}</p></div>
              <div><p className="text-xs text-muted-foreground">Avg MPG</p><p className="font-bold">{avgMPG > 0 ? avgMPG.toFixed(1) : '—'}</p></div>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mileageTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="fuel" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* IFTA Tax Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />IFTA Tax Summary — Q{selectedQ} {selectedY}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <Badge variant="outline">📅 Due: {deadline}</Badge>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">⏳ Estimated</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">State</th>
                  <th className="text-right py-2 font-medium">Miles</th>
                  <th className="text-right py-2 font-medium">Fuel Used</th>
                  <th className="text-right py-2 font-medium">Net Tax</th>
                </tr></thead>
                <tbody>
                  {iftaBreakdown.map(i => (
                    <tr key={i.state} className="border-b border-border/50">
                      <td className="py-1.5">{i.name}</td>
                      <td className="text-right">{formatMiles(i.miles)}</td>
                      <td className="text-right">{i.fuelUsed} gal</td>
                      <td className={cn('text-right font-medium', i.netTax < 0 ? 'text-emerald-600' : 'text-foreground')}>
                        {i.netTax < 0 ? `-${formatCurrency(Math.abs(i.netTax))}` : formatCurrency(i.netTax)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 pt-3 border-t border-border space-y-1">
              <div className="flex justify-between text-sm"><span>Total Tax Owed:</span><span className="font-bold">{formatCurrency(totalTaxOwed)}</span></div>
              <div className="flex justify-between text-sm text-emerald-600"><span>Total Credits:</span><span>-{formatCurrency(totalTaxCredits)}</span></div>
              <div className="flex justify-between text-sm font-bold border-t border-border pt-1"><span>Net Amount Due:</span><span>{formatCurrency(netAmountDue)}</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Owner: Driver Performance */}
        {(isFleetOwner || isAdmin) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4 text-primary" />Driver Performance — Q{selectedQ} {selectedY}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fleetMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active fleet drivers</p>
              ) : (
                fleetMembers.map(fm => {
                  const driverTrips = trips.filter(t => t.user_id === fm.driver_id);
                  const driverMiles = driverTrips.reduce((s, t) => s + (Number(t.total_miles) || 0), 0);
                  const driverReceipts = receipts.filter(r => r.user_id === fm.driver_id);
                  const driverFuel = driverReceipts.reduce((s, r) => s + (Number(r.total_amount) || 0), 0);
                  const driverGallons = driverReceipts.reduce((s, r) => s + (Number(r.gallons) || 0), 0);
                  const driverMPG = driverGallons > 0 ? driverMiles / driverGallons : 0;
                  return (
                    <div key={fm.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {fm.truck_number ? `#${fm.truck_number}` : '🚛'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">Truck #{fm.truck_number || '—'}</p>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span>{formatMiles(Math.round(driverMiles))} mi</span>
                          <span>{formatCurrency(driverFuel)}</span>
                          <span className={cn(driverMPG >= 4.5 ? 'text-emerald-600' : driverMPG >= 3.5 ? 'text-orange-500' : 'text-destructive')}>
                            {driverMPG > 0 ? `${driverMPG.toFixed(1)} mpg` : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin: Platform Analytics */}
        {isAdmin && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" />Platform Analytics — Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><p className="text-xs text-muted-foreground">Total Users</p><p className="text-lg font-bold">{allProfiles.length}</p></div>
                <div><p className="text-xs text-muted-foreground">Paid Users</p><p className="text-lg font-bold">{allProfiles.filter(p => p.subscription_status === 'active').length}</p></div>
                <div><p className="text-xs text-muted-foreground">Trial Users</p><p className="text-lg font-bold">{allProfiles.filter(p => p.subscription_status === 'trial').length}</p></div>
                <div><p className="text-xs text-muted-foreground">This Month</p><p className="text-lg font-bold">{allProfiles.filter(p => new Date(p.created_at) >= startOfMonth(new Date())).length} new</p></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Smart Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-yellow-500" />Smart Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {netAmountDue > 0 && (
              <div className="flex gap-2 p-2 rounded bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <span className="text-sm">📅</span>
                <p className="text-xs">Q{selectedQ} IFTA filing due {deadline} — estimated {formatCurrency(netAmountDue)} owed</p>
              </div>
            )}
            {avgMPG > 0 && avgMPG < 4 && (
              <div className="flex gap-2 p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <span className="text-sm">⛽</span>
                <p className="text-xs">Fleet average MPG is {avgMPG.toFixed(1)} — below industry average of 5.9. Consider route optimization.</p>
              </div>
            )}
            {milesByState.length > 0 && (
              <div className="flex gap-2 p-2 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <span className="text-sm">🗺️</span>
                <p className="text-xs">Top state: {milesByState[0].name} with {formatMiles(milesByState[0].miles)} miles ({milesByState[0].pct}% of total)</p>
              </div>
            )}
            {totalMiles === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">No data yet for Q{selectedQ} {selectedY}. Start logging trips to see insights.</p>
            )}
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Download className="h-4 w-4 text-primary" />Export Your Data</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-3 w-3 mr-1" />Download CSV</Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}><FileText className="h-3 w-3 mr-1" />Print View</Button>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Analytics;
