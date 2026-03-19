import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import BottomNavigation from '@/components/BottomNavigation';
import { ArrowLeft, FileText, Download, Send, Check, AlertTriangle, Clock, CheckCircle, XCircle, Loader2, History } from 'lucide-react';
import { STATE_TAX_RATES, formatCurrency, formatMiles } from '@/lib/iftaCalculations';
import { cn } from '@/lib/utils';
import { format, endOfQuarter } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const QUARTER_DEADLINES: Record<number, { month: number; day: number }> = {
  1: { month: 3, day: 30 }, 2: { month: 6, day: 31 }, 3: { month: 9, day: 31 }, 4: { month: 0, day: 31 } // Q4 deadline is Jan 31 next year
};

function getDeadline(q: number, y: number) {
  const dl = QUARTER_DEADLINES[q];
  const deadlineYear = q === 4 ? y + 1 : y;
  return new Date(deadlineYear, dl.month, dl.day);
}

function getQuarterRange(q: number, y: number) {
  const start = new Date(y, (q - 1) * 3, 1);
  const end = endOfQuarter(start);
  return { start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
}

function getCurrentQuarter() {
  const now = new Date();
  return { quarter: Math.ceil((now.getMonth() + 1) / 3), year: now.getFullYear() };
}

interface StateBreakdownRow {
  state_code: string;
  miles_driven: number;
  gallons_used: number;
  gallons_purchased: number;
  tax_rate: number;
  tax_owed: number;
  tax_credit: number;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  draft: { icon: FileText, label: 'Draft', color: 'bg-muted text-muted-foreground' },
  pending: { icon: Clock, label: 'Pending Review', color: 'bg-orange-100 text-orange-700' },
  submitted: { icon: CheckCircle, label: 'Submitted', color: 'bg-emerald-100 text-emerald-700' },
  approved: { icon: Check, label: 'Approved', color: 'bg-primary/10 text-primary' },
  rejected: { icon: XCircle, label: 'Rejected', color: 'bg-destructive/10 text-destructive' },
};

const IFTAReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, isFleetOwner } = useUserRole();
  const queryClient = useQueryClient();
  const current = getCurrentQuarter();
  const [selectedQ, setSelectedQ] = useState(current.quarter);
  const [selectedY, setSelectedY] = useState(current.year);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const range = getQuarterRange(selectedQ, selectedY);
  const deadline = getDeadline(selectedQ, selectedY);

  // Fetch existing report for this quarter
  const { data: existingReport, isLoading: loadingReport } = useQuery({
    queryKey: ['ifta-report', user?.id, selectedQ, selectedY],
    queryFn: async () => {
      const { data } = await supabase
        .from('ifta_reports')
        .select('*')
        .eq('user_id', user!.id)
        .eq('quarter', selectedQ)
        .eq('year', selectedY)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch state breakdown if report exists
  const { data: stateBreakdown = [] } = useQuery({
    queryKey: ['ifta-breakdown', existingReport?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('ifta_state_breakdown')
        .select('*')
        .eq('report_id', existingReport!.id)
        .order('miles_driven', { ascending: false });
      return (data || []) as StateBreakdownRow[];
    },
    enabled: !!existingReport?.id,
  });

  // Fetch raw trip/receipt data for generation
  const { data: trips = [] } = useQuery({
    queryKey: ['ifta-gen-trips', user?.id, range.start, range.end],
    queryFn: async () => {
      const { data } = await supabase.from('trips').select('*')
        .gte('start_date', range.start).lte('start_date', range.end);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const tripIds = trips.map(t => t.id);
  const { data: tripMiles = [] } = useQuery({
    queryKey: ['ifta-gen-trip-miles', tripIds],
    queryFn: async () => {
      if (!tripIds.length) return [];
      const { data } = await supabase.from('trip_miles').select('*').in('trip_id', tripIds);
      return data || [];
    },
    enabled: tripIds.length > 0,
  });

  const { data: receipts = [] } = useQuery({
    queryKey: ['ifta-gen-receipts', user?.id, range.start, range.end],
    queryFn: async () => {
      const { data } = await supabase.from('receipts').select('*')
        .gte('receipt_date', range.start).lte('receipt_date', range.end);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ['ifta-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user!.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch all reports for history
  const { data: allReports = [] } = useQuery({
    queryKey: ['ifta-all-reports', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('ifta_reports').select('*').order('year', { ascending: false }).order('quarter', { ascending: false });
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Compute breakdown from raw data
  const computedBreakdown = useMemo(() => {
    const totalMiles = trips.reduce((s, t) => s + (Number(t.total_miles) || 0), 0);
    const totalGallons = receipts.reduce((s, r) => s + (Number(r.gallons) || 0), 0);
    const totalFuelCost = receipts.reduce((s, r) => s + (Number(r.total_amount) || 0), 0);
    const fleetMPG = totalGallons > 0 ? totalMiles / totalGallons : 5.63;

    // Miles by state
    const mileMap: Record<string, number> = {};
    tripMiles.forEach(tm => { mileMap[tm.state_code] = (mileMap[tm.state_code] || 0) + Number(tm.miles); });

    // Fuel by state
    const fuelMap: Record<string, number> = {};
    receipts.forEach(r => { const sc = r.state_code || 'UNK'; fuelMap[sc] = (fuelMap[sc] || 0) + (Number(r.gallons) || 0); });

    const states = new Set([...Object.keys(mileMap), ...Object.keys(fuelMap)]);
    const rows: StateBreakdownRow[] = [];
    let grossTax = 0, grossCredit = 0;

    states.forEach(sc => {
      if (!STATE_TAX_RATES[sc]) return;
      const miles = mileMap[sc] || 0;
      const galUsed = fleetMPG > 0 ? miles / fleetMPG : 0;
      const galPurchased = fuelMap[sc] || 0;
      const rate = STATE_TAX_RATES[sc].taxRate;
      const net = (galUsed - galPurchased) * rate;
      const taxOwed = Math.max(0, net);
      const taxCredit = Math.max(0, -net);
      grossTax += taxOwed;
      grossCredit += taxCredit;
      if (miles > 0 || galPurchased > 0) {
        rows.push({ state_code: sc, miles_driven: Math.round(miles), gallons_used: Math.round(galUsed * 100) / 100, gallons_purchased: Math.round(galPurchased * 100) / 100, tax_rate: rate, tax_owed: Math.round(taxOwed * 100) / 100, tax_credit: Math.round(taxCredit * 100) / 100 });
      }
    });

    rows.sort((a, b) => b.miles_driven - a.miles_driven);
    return { totalMiles, totalGallons, totalFuelCost, fleetMPG, grossTax: Math.round(grossTax * 100) / 100, grossCredit: Math.round(grossCredit * 100) / 100, netDue: Math.round((grossTax - grossCredit) * 100) / 100, rows };
  }, [trips, tripMiles, receipts]);

  // Generate report
  const generateReport = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      const d = computedBreakdown;
      const deadlineStr = format(deadline, 'yyyy-MM-dd');

      // Upsert report
      const { data: report, error } = await supabase.from('ifta_reports').upsert({
        user_id: user!.id,
        quarter: selectedQ,
        year: selectedY,
        status: 'draft',
        total_miles: d.totalMiles,
        taxable_miles: d.totalMiles,
        total_gallons: d.totalGallons,
        total_fuel_cost: d.totalFuelCost,
        net_tax_owed: d.netDue > 0 ? d.netDue : 0,
        net_tax_credit: d.grossCredit,
        filing_deadline: deadlineStr,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: 'user_id,quarter,year' }).select().single();
      if (error) throw error;

      // Delete old breakdown and insert new
      await supabase.from('ifta_state_breakdown').delete().eq('report_id', report.id);
      if (d.rows.length > 0) {
        const breakdownRows = d.rows.map(r => ({ report_id: report.id, ...r } as any));
        const { error: bErr } = await supabase.from('ifta_state_breakdown').insert(breakdownRows);
        if (bErr) throw bErr;
      }
      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ifta-report'] });
      queryClient.invalidateQueries({ queryKey: ['ifta-breakdown'] });
      queryClient.invalidateQueries({ queryKey: ['ifta-all-reports'] });
      toast({ title: '📊 Report Generated', description: `Q${selectedQ} ${selectedY} IFTA report draft is ready to review!` });
      setGenerating(false);
    },
    onError: (e: any) => {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      setGenerating(false);
    },
  });

  // Submit report
  const submitReport = useMutation({
    mutationFn: async () => {
      if (!existingReport) throw new Error('No report');
      const confNum = `IFTA-${selectedY}-Q${selectedQ}-${Math.floor(1000 + Math.random() * 9000)}`;
      const { error } = await supabase.from('ifta_reports').update({
        status: 'submitted', filed_at: new Date().toISOString(), confirmation_number: confNum, updated_at: new Date().toISOString(),
      } as any).eq('id', existingReport.id);
      if (error) throw error;
      return confNum;
    },
    onSuccess: (confNum) => {
      setShowSubmitDialog(false);
      queryClient.invalidateQueries({ queryKey: ['ifta-report'] });
      queryClient.invalidateQueries({ queryKey: ['ifta-all-reports'] });
      toast({ title: '✅ Report Submitted!', description: `Confirmation: ${confNum}` });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  // PDF generation
  const downloadPDF = () => {
    const data = existingReport ? stateBreakdown : computedBreakdown.rows;
    const report = existingReport || computedBreakdown;
    const doc = new jsPDF();

    // Cover
    doc.setFontSize(22); doc.setTextColor(249, 115, 22);
    doc.text('TrueTrucker IFTA Pro', 105, 30, { align: 'center' });
    doc.setFontSize(16); doc.setTextColor(0);
    doc.text(`Q${selectedQ} ${selectedY} IFTA Report`, 105, 45, { align: 'center' });
    doc.setFontSize(11); doc.setTextColor(100);
    doc.text(`Driver: ${profile?.email || 'N/A'}`, 20, 65);
    doc.text(`Company: ${profile?.company_name || 'N/A'}`, 20, 73);
    doc.text(`DOT#: ${profile?.dot_number || 'N/A'}`, 20, 81);
    doc.text(`Filing Deadline: ${format(deadline, 'MMMM d, yyyy')}`, 20, 89);
    if (existingReport?.confirmation_number) doc.text(`Confirmation: ${existingReport.confirmation_number}`, 20, 97);

    // Summary
    const totalMiles = existingReport ? Number(existingReport.total_miles) : computedBreakdown.totalMiles;
    const totalGallons = existingReport ? Number(existingReport.total_gallons) : computedBreakdown.totalGallons;
    const netTax = existingReport ? Number(existingReport.net_tax_owed) : Math.max(0, computedBreakdown.netDue);
    const netCredit = existingReport ? Number(existingReport.net_tax_credit) : computedBreakdown.grossCredit;
    const mpg = totalGallons > 0 ? totalMiles / totalGallons : 0;

    let y = 115;
    doc.setFontSize(14); doc.setTextColor(0); doc.text('SUMMARY', 20, y); y += 10;
    doc.setFontSize(10);
    doc.text(`Total Miles: ${formatMiles(totalMiles)}`, 20, y); y += 7;
    doc.text(`Total Gallons: ${totalGallons.toFixed(0)}`, 20, y); y += 7;
    doc.text(`Fleet MPG: ${mpg.toFixed(2)}`, 20, y); y += 7;
    doc.text(`Net Tax Owed: ${formatCurrency(netTax)}`, 20, y); y += 7;
    doc.text(`Tax Credits: ${formatCurrency(netCredit)}`, 20, y); y += 7;
    doc.text(`Net Amount Due: ${formatCurrency(netTax - netCredit)}`, 20, y); y += 14;

    // State table
    doc.setFontSize(14); doc.text('STATE BREAKDOWN', 20, y); y += 8;
    doc.setFontSize(8); doc.setTextColor(100);
    doc.text('State', 20, y); doc.text('Miles', 50, y); doc.text('Gal Used', 80, y); doc.text('Gal Bought', 110, y); doc.text('Rate', 145, y); doc.text('Net Tax', 170, y);
    y += 5; doc.setDrawColor(200); doc.line(20, y, 195, y); y += 4;
    doc.setTextColor(0);
    (data as StateBreakdownRow[]).forEach(r => {
      if (y > 270) { doc.addPage(); y = 20; }
      const name = STATE_TAX_RATES[r.state_code]?.name || r.state_code;
      doc.text(name.substring(0, 12), 20, y);
      doc.text(formatMiles(r.miles_driven), 50, y);
      doc.text(String(r.gallons_used), 80, y);
      doc.text(String(r.gallons_purchased), 110, y);
      doc.text(`$${r.tax_rate.toFixed(3)}`, 145, y);
      const net = r.tax_owed - r.tax_credit;
      doc.text(net >= 0 ? `+${formatCurrency(net)}` : `-${formatCurrency(Math.abs(net))}`, 170, y);
      y += 6;
    });

    doc.save(`IFTA-Q${selectedQ}-${selectedY}.pdf`);
    toast({ title: '📄 PDF Downloaded', description: `Q${selectedQ} ${selectedY} report saved` });
  };

  const displayBreakdown = existingReport ? stateBreakdown : computedBreakdown.rows;
  const displayTotals = existingReport
    ? { totalMiles: Number(existingReport.total_miles), totalGallons: Number(existingReport.total_gallons), totalFuelCost: Number(existingReport.total_fuel_cost), netTax: Number(existingReport.net_tax_owed), netCredit: Number(existingReport.net_tax_credit), fleetMPG: Number(existingReport.total_gallons) > 0 ? Number(existingReport.total_miles) / Number(existingReport.total_gallons) : 0 }
    : { totalMiles: computedBreakdown.totalMiles, totalGallons: computedBreakdown.totalGallons, totalFuelCost: computedBreakdown.totalFuelCost, netTax: computedBreakdown.netDue > 0 ? computedBreakdown.netDue : 0, netCredit: computedBreakdown.grossCredit, fleetMPG: computedBreakdown.fleetMPG };
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const status = existingReport?.status || 'none';
  const sc = statusConfig[status];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /><h1 className="text-lg font-bold">IFTA Reports</h1></div>
          <div className="ml-auto flex gap-2">
            <Select value={`Q${selectedQ}`} onValueChange={v => setSelectedQ(Number(v.replace('Q', '')))}>
              <SelectTrigger className="w-20 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{[1,2,3,4].map(q => <SelectItem key={q} value={`Q${q}`}>Q{q}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(selectedY)} onValueChange={v => setSelectedY(Number(v))}>
              <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{[2024,2025,2026].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* Status + Deadline */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="font-bold">Q{selectedQ} {selectedY} IFTA Report</h2>
                <p className="text-xs text-muted-foreground">Deadline: {format(deadline, 'MMMM d, yyyy')} — {daysLeft} days left</p>
              </div>
              {sc ? (
                <Badge className={sc.color}><sc.icon className="h-3 w-3 mr-1" />{sc.label}</Badge>
              ) : (
                <Badge variant="outline">No Report Yet</Badge>
              )}
            </div>
            {existingReport?.confirmation_number && (
              <p className="text-xs text-muted-foreground mt-2">Confirmation: {existingReport.confirmation_number}</p>
            )}
          </CardContent>
        </Card>

        {/* Missing data warning */}
        {trips.length === 0 && receipts.length === 0 && !existingReport && (
          <Card className="border-orange-300 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">No data for Q{selectedQ} {selectedY}</p>
                <p className="text-xs text-muted-foreground mt-1">Log trips and scan fuel receipts before generating your report.</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => navigate('/trips')}>Log Trips</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/scan-receipt')}>Scan Receipts</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-l-4 border-l-primary"><CardContent className="p-3"><p className="text-xs text-muted-foreground">Total Miles</p><p className="text-xl font-bold">{formatMiles(displayTotals.totalMiles)}</p></CardContent></Card>
          <Card className="border-l-4 border-l-orange-500"><CardContent className="p-3"><p className="text-xs text-muted-foreground">Gallons</p><p className="text-xl font-bold">{displayTotals.totalGallons.toFixed(0)}</p></CardContent></Card>
          <Card className="border-l-4 border-l-emerald-500"><CardContent className="p-3"><p className="text-xs text-muted-foreground">Fleet MPG</p><p className="text-xl font-bold">{displayTotals.fleetMPG > 0 ? displayTotals.fleetMPG.toFixed(2) : '—'}</p></CardContent></Card>
          <Card className="border-l-4 border-l-destructive"><CardContent className="p-3"><p className="text-xs text-muted-foreground">Net Tax Due</p><p className="text-xl font-bold">{formatCurrency(displayTotals.netTax - displayTotals.netCredit)}</p></CardContent></Card>
        </div>

        {/* Tax Calculation Summary */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Tax Calculation</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between text-sm"><span>Gross Tax Owed:</span><span className="font-semibold">{formatCurrency(displayTotals.netTax)}</span></div>
            <div className="flex justify-between text-sm text-emerald-600"><span>Tax Credits:</span><span>-{formatCurrency(displayTotals.netCredit)}</span></div>
            <div className="flex justify-between text-sm font-bold border-t border-border pt-1 mt-1"><span>NET TAX DUE:</span><span>{formatCurrency(displayTotals.netTax - displayTotals.netCredit)}</span></div>
          </CardContent>
        </Card>

        {/* State Breakdown Table */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">State Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">State</th>
                  <th className="text-right py-2 font-medium">Miles</th>
                  <th className="text-right py-2 font-medium">Gal Used</th>
                  <th className="text-right py-2 font-medium">Gal Bought</th>
                  <th className="text-right py-2 font-medium">Rate</th>
                  <th className="text-right py-2 font-medium">Net Tax</th>
                </tr></thead>
                <tbody>
                  {displayBreakdown.map((r: any) => {
                    const net = (r.tax_owed || 0) - (r.tax_credit || 0);
                    return (
                      <tr key={r.state_code} className="border-b border-border/50">
                        <td className="py-1.5">{STATE_TAX_RATES[r.state_code]?.name || r.state_code}</td>
                        <td className="text-right">{formatMiles(r.miles_driven)}</td>
                        <td className="text-right">{r.gallons_used}</td>
                        <td className="text-right">{r.gallons_purchased}</td>
                        <td className="text-right">${r.tax_rate.toFixed(3)}</td>
                        <td className={cn('text-right font-medium', net < 0 ? 'text-emerald-600' : '')}>
                          {net >= 0 ? `+${formatCurrency(net)}` : `-${formatCurrency(Math.abs(net))}`}
                        </td>
                      </tr>
                    );
                  })}
                  {displayBreakdown.length === 0 && <tr><td colSpan={6} className="text-center py-4 text-muted-foreground">No state data available</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {(!existingReport || status === 'draft') && (
            <Button onClick={() => generateReport.mutate()} disabled={generating || (trips.length === 0 && receipts.length === 0)}>
              {generating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <FileText className="h-4 w-4 mr-1" />}
              {existingReport ? 'Regenerate Report' : 'Generate Report'}
            </Button>
          )}
          {existingReport && status === 'draft' && (
            <Button variant="default" onClick={() => setShowSubmitDialog(true)}>
              <Send className="h-4 w-4 mr-1" />Submit Report
            </Button>
          )}
          {(existingReport || displayBreakdown.length > 0) && (
            <Button variant="outline" onClick={downloadPDF}><Download className="h-4 w-4 mr-1" />Download PDF</Button>
          )}
        </div>

        {/* Filing History */}
        {allReports.length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4 text-primary" />Filing History</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {allReports.map((r: any) => {
                const rsc = statusConfig[r.status];
                return (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Q{r.quarter} {r.year}</span>
                      {rsc && <Badge className={cn('text-[10px]', rsc.color)}>{rsc.label}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {r.filed_at && <span>Filed {format(new Date(r.filed_at), 'MMM d')}</span>}
                      <span className="font-semibold text-foreground">{formatCurrency(Number(r.net_tax_owed) - Number(r.net_tax_credit))}</span>
                      {r.confirmation_number && <span className="text-[10px]">{r.confirmation_number}</span>}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submit Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit IFTA Report</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p>You are about to submit your <strong>Q{selectedQ} {selectedY}</strong> IFTA Report.</p>
            <div className="bg-muted/50 p-3 rounded space-y-1">
              <div className="flex justify-between"><span>Net Tax Due:</span><span className="font-bold">{formatCurrency(displayTotals.netTax - displayTotals.netCredit)}</span></div>
              <div className="flex justify-between"><span>Filing Deadline:</span><span>{format(deadline, 'MMMM d, yyyy')}</span></div>
            </div>
            <p className="text-xs text-muted-foreground">Once submitted, this report will be marked as filed.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
            <Button onClick={() => submitReport.mutate()} disabled={submitReport.isPending}>
              {submitReport.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Confirm & Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
};

export default IFTAReports;
