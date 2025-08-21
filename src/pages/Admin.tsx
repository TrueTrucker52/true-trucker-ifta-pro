import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Truck,
  Clock,
  Mail,
  Filter,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  subscription_status: string;
  subscription_tier: string;
  trial_start_date: string;
  trial_end_date: string;
  created_at: string;
  phone?: string;
}

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersWeek: number;
  trialUsers: number;
  paidUsers: number;
  conversionRate: number;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
    trialUsers: 0,
    paidUsers: 0,
    conversionRate: 0
  });

  // Filters
  const [dateRange, setDateRange] = useState('7');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    if (user) {
      fetchUsers();
      setupRealtimeSubscription();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [users, dateRange, statusFilter, searchEmail]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      toast.error(`Error fetching users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('user-signups')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('New user signup!', payload);
          const newUser = payload.new as UserProfile;
          setUsers(prev => [newUser, ...prev]);
          
          // Show notification toast
          toast.success(`🚛 New signup: ${newUser.email}`, {
            description: `Trial started - ${newUser.subscription_tier} tier`,
            action: {
              label: 'View User',
              onClick: () => {
                // Scroll to user in table or open user detail
                const userElement = document.getElementById(`user-${newUser.id}`);
                if (userElement) {
                  userElement.scrollIntoView({ behavior: 'smooth' });
                  userElement.classList.add('highlight-new-user');
                  setTimeout(() => {
                    userElement.classList.remove('highlight-new-user');
                  }, 3000);
                }
              }
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const calculateStats = (userData: UserProfile[]) => {
    const now = new Date();
    const today = startOfDay(now);
    const weekAgo = subDays(today, 7);

    const totalUsers = userData.length;
    
    const newUsersToday = userData.filter(u => 
      new Date(u.created_at) >= today
    ).length;
    
    const newUsersWeek = userData.filter(u => 
      new Date(u.created_at) >= weekAgo
    ).length;
    
    const trialUsers = userData.filter(u => 
      u.subscription_status === 'trial'
    ).length;
    
    const paidUsers = userData.filter(u => 
      ['active', 'subscribed'].includes(u.subscription_status)
    ).length;
    
    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers * 100) : 0;

    setStats({
      totalUsers,
      newUsersToday,
      newUsersWeek,
      trialUsers,
      paidUsers,
      conversionRate
    });
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Date range filter
    if (dateRange !== 'all') {
      const daysAgo = parseInt(dateRange);
      const cutoff = subDays(new Date(), daysAgo);
      filtered = filtered.filter(u => new Date(u.created_at) >= cutoff);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.subscription_status === statusFilter);
    }

    // Email search
    if (searchEmail) {
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const exportUsers = () => {
    const csvContent = [
      ['Email', 'Subscription Status', 'Tier', 'Trial Start', 'Trial End', 'Signup Date'],
      ...filteredUsers.map(u => [
        u.email,
        u.subscription_status,
        u.subscription_tier,
        u.trial_start_date,
        u.trial_end_date,
        format(new Date(u.created_at), 'yyyy-MM-dd HH:mm:ss')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truetrucker-users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'active': case 'subscribed': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'owner_operator': return 'bg-blue-100 text-blue-800';
      case 'small': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'large': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">TrueTrucker Admin</h1>
                <p className="text-sm text-muted-foreground">User Analytics & Management</p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              Back to App
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">New Today</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.newUsersToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.newUsersWeek}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Trial Users</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.trialUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Paid Users</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paidUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion</CardTitle>
                <Truck className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.conversionRate.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subscription Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="subscribed">Subscribed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search Email</Label>
                <Input
                  placeholder="driver@company.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={fetchUsers} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={exportUsers} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Signups ({filteredUsers.length} users)</CardTitle>
            <CardDescription>
              Real-time signup tracking with user analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Driver/Company</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Tier</th>
                    <th className="text-left p-4 font-medium">Trial Period</th>
                    <th className="text-left p-4 font-medium">Signup Date</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      id={`user-${user.id}`}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Truck className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{user.email}</p>
                            {user.phone && (
                              <p className="text-sm text-muted-foreground">{user.phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusColor(user.subscription_status)}>
                          {user.subscription_status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={getTierColor(user.subscription_tier)}>
                          {user.subscription_tier?.replace('_', ' ').toUpperCase() || 'FREE'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.trial_start_date && user.trial_end_date ? (
                          <div className="text-sm">
                            <p>{format(new Date(user.trial_start_date), 'MMM dd')} - {format(new Date(user.trial_end_date), 'MMM dd')}</p>
                            <p className="text-muted-foreground">
                              {new Date(user.trial_end_date) > new Date() ? 'Active' : 'Expired'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p>{format(new Date(user.created_at), 'MMM dd, yyyy')}</p>
                          <p className="text-muted-foreground">{format(new Date(user.created_at), 'HH:mm')}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              window.location.href = `mailto:${user.email}?subject=Welcome to TrueTrucker IFTA Pro&body=Hello, thank you for signing up for TrueTrucker IFTA Pro!`;
                            }}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              toast.success(`Copied ${user.email} to clipboard`);
                              navigator.clipboard.writeText(user.email);
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No users found matching your filters</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;