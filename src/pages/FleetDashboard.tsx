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
        .eq('fleet_id', fleet!.id);
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

      // Also assign fleet_owner role
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

  const copyInviteCode = () => {
    if (fleet?.invite_code) {
      navigator.clipboard.writeText(fleet.invite_code);
      toast({ title: '📋 Copied!', description: 'Invite code copied to clipboard.' });
    }
  };

  const activeMembers = members.filter((m) => m.status === 'active');
  const inactiveMembers = members.filter((m) => m.status !== 'active');

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
          /* No fleet yet — show creation */
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
            {/* Fleet info card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{fleet.company_name}</CardTitle>
                    <CardDescription>Fleet ID: {fleet.id.slice(0, 8)}</CardDescription>
                  </div>
                  <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 bg-muted p-3 rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Invite Code</p>
                    <p className="text-2xl font-mono font-bold tracking-widest">{fleet.invite_code}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={copyInviteCode}>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Share this code with drivers so they can join your fleet.</p>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
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
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
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
                      <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">Driver {member.driver_id.slice(0, 8)}</p>
                          {member.truck_number && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Truck className="h-3 w-3" /> {member.truck_number}
                            </p>
                          )}
                        </div>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
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
