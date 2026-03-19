import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users, Truck, Plus, ArrowLeft, Copy, Building2, UserPlus, Settings,
  RefreshCw, Mail, MessageSquare, UserMinus, UserX, PenLine,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';

const FleetDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [editingTruck, setEditingTruck] = useState<string | null>(null);
  const [truckInput, setTruckInput] = useState('');

  // Fetch user's fleet
  const { data: fleet, isLoading: fleetLoading } = useQuery({
    queryKey: ['fleet', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleets')
        .select('*')
        .eq('owner_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch fleet members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['fleet-members', fleet?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fleet_members')
        .select('*')
        .eq('fleet_id', fleet!.id)
        .order('joined_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!fleet?.id,
  });

  // Create fleet mutation
  const createFleet = useMutation({
    mutationFn: async (name: string) => {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data, error } = await supabase.from('fleets').insert({
        owner_id: user!.id,
        company_name: name,
        invite_code: inviteCode,
      }).select().single();
      if (error) throw error;

      await supabase.from('user_roles').upsert({
        user_id: user!.id,
        role: 'fleet_owner' as any,
      }, { onConflict: 'user_id,role' });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet'] });
      toast({ title: '✅ Fleet created!', description: 'Share your invite code with drivers.' });
      setShowCreateForm(false);
      setCompanyName('');
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Regenerate invite code
  const regenerateCode = useMutation({
    mutationFn: async () => {
      if (!fleet) throw new Error('No fleet');
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase
        .from('fleets')
        .update({ invite_code: newCode })
        .eq('id', fleet.id);
      if (error) throw error;
      return newCode;
    },
    onSuccess: (newCode) => {
      queryClient.invalidateQueries({ queryKey: ['fleet'] });
      toast({ title: '🔄 New code generated!', description: `Your new invite code is ${newCode}. The old code no longer works.` });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  // Update member status
  const updateMemberStatus = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: string }) => {
      const { error } = await supabase
        .from('fleet_members')
        .update({ status })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet-members'] });
      toast({ title: '✅ Driver status updated.' });
    },
  });

  // Remove member
  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('fleet_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet-members'] });
      toast({ title: '🗑️ Driver removed from fleet.' });
    },
  });

  // Update truck number
  const updateTruckNumber = useMutation({
    mutationFn: async ({ memberId, truckNumber }: { memberId: string; truckNumber: string }) => {
      const { error } = await supabase
        .from('fleet_members')
        .update({ truck_number: truckNumber.trim() || null })
        .eq('id', memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fleet-members'] });
      setEditingTruck(null);
      setTruckInput('');
      toast({ title: '🚛 Truck number updated.' });
    },
  });

  const copyInviteCode = () => {
    if (fleet?.invite_code) {
      navigator.clipboard.writeText(fleet.invite_code);
      toast({ title: '📋 Copied!', description: 'Invite code copied to clipboard.' });
    }
  };

  const shareViaText = () => {
    if (fleet) {
      const msg = `Join my fleet "${fleet.company_name}" on TrueTrucker IFTA Pro! Use invite code: ${fleet.invite_code} when you sign up.`;
      window.open(`sms:?body=${encodeURIComponent(msg)}`);
    }
  };

  const shareViaEmail = () => {
    if (fleet) {
      const subject = `Join ${fleet.company_name} on TrueTrucker IFTA Pro`;
      const body = `Hey! Join my fleet on TrueTrucker IFTA Pro.\n\nUse this invite code when you sign up: ${fleet.invite_code}\n\nSign up here: ${window.location.origin}/auth?mode=signup`;
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  const activeMembers = members.filter((m) => m.status === 'active');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="text-primary-foreground hover:bg-primary/80">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Fleet Dashboard
            </h1>
            <p className="text-sm opacity-80">Manage your fleet and drivers</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {fleetLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !fleet ? (
          <Card>
            <CardHeader className="text-center">
              <Building2 className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Create Your Fleet</CardTitle>
              <CardDescription>Set up your trucking company to manage drivers and trucks.</CardDescription>
            </CardHeader>
            <CardContent>
              {showCreateForm ? (
                <div className="space-y-4 max-w-sm mx-auto">
                  <Input
                    placeholder="Company name (e.g. Mike's Trucking)"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    maxLength={100}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => createFleet.mutate(companyName)} disabled={!companyName.trim() || createFleet.isPending} className="flex-1">
                      {createFleet.isPending ? 'Creating...' : 'Create Fleet'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowCreateForm(true)} className="w-full max-w-sm mx-auto block">
                  <Plus className="h-4 w-4 mr-2" /> Create Fleet
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Invite Drivers Section */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  🚛 Invite Drivers
                </CardTitle>
                <CardDescription>Share this code with your drivers when they sign up. They will automatically be linked to your fleet.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 bg-muted p-4 rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium">Your Fleet Invite Code</p>
                    <p className="text-3xl font-mono font-bold tracking-[0.3em] text-primary">{fleet.invite_code}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button variant="outline" size="sm" onClick={copyInviteCode}>
                    <Copy className="h-4 w-4 mr-1" /> Copy Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareViaText}>
                    <MessageSquare className="h-4 w-4 mr-1" /> Via Text
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareViaEmail}>
                    <Mail className="h-4 w-4 mr-1" /> Via Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => regenerateCode.mutate()}
                    disabled={regenerateCode.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${regenerateCode.isPending ? 'animate-spin' : ''}`} /> New Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Fleet Info + Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card>
                <CardContent className="pt-4 text-center">
                  <Building2 className="h-6 w-6 mx-auto text-primary mb-1" />
                  <p className="font-bold text-sm truncate">{fleet.company_name}</p>
                  <p className="text-xs text-muted-foreground">Fleet ID: {fleet.id.slice(0, 8)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Users className="h-6 w-6 mx-auto text-primary mb-1" />
                  <p className="text-2xl font-bold">{activeMembers.length}</p>
                  <p className="text-xs text-muted-foreground">Active Drivers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Truck className="h-6 w-6 mx-auto text-primary mb-1" />
                  <p className="text-2xl font-bold">{members.length}</p>
                  <p className="text-xs text-muted-foreground">Total Members</p>
                </CardContent>
              </Card>
            </div>

            {/* Members list */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="h-5 w-5" /> Fleet Members
                  </CardTitle>
                  <Badge variant="secondary">{members.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="font-medium">No drivers yet</p>
                    <p className="text-sm">Share your invite code to get started! 🚛</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">Driver {member.driver_id.slice(0, 8)}</p>
                            {editingTruck === member.id ? (
                              <div className="flex items-center gap-1 mt-1">
                                <Input
                                  value={truckInput}
                                  onChange={(e) => setTruckInput(e.target.value)}
                                  placeholder="Truck #101"
                                  className="h-7 text-xs w-28"
                                  maxLength={20}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() => updateTruckNumber.mutate({ memberId: member.id, truckNumber: truckInput })}
                                >
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingTruck(null)}>✕</Button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setEditingTruck(member.id); setTruckInput(member.truck_number || ''); }}
                                className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"
                              >
                                <Truck className="h-3 w-3" />
                                {member.truck_number || 'Assign truck #'}
                                <PenLine className="h-3 w-3" />
                              </button>
                            )}
                            <p className="text-xs text-muted-foreground">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                          </div>
                          <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {member.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => updateMemberStatus.mutate({ memberId: member.id, status: 'inactive' })}
                            >
                              <UserMinus className="h-3 w-3 mr-1" /> Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => updateMemberStatus.mutate({ memberId: member.id, status: 'active' })}
                            >
                              <UserPlus className="h-3 w-3 mr-1" /> Reactivate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm('Remove this driver from your fleet? This cannot be undone.')) {
                                removeMember.mutate(member.id);
                              }
                            }}
                          >
                            <UserX className="h-3 w-3 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default FleetDashboard;
