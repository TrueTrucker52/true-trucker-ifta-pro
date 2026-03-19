import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, ArrowLeft, MessageSquare, FileText, AlertTriangle, Calendar, Truck, Receipt, CreditCard, Clock, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const priorityConfig: Record<string, { color: string; label: string; dot: string }> = {
  urgent: { color: 'bg-destructive text-destructive-foreground', label: 'URGENT', dot: '🔴' },
  high: { color: 'bg-orange-500 text-white', label: 'HIGH', dot: '🟡' },
  medium: { color: 'bg-primary text-primary-foreground', label: 'MEDIUM', dot: '🟢' },
  low: { color: 'bg-muted text-muted-foreground', label: 'LOW', dot: '🔵' },
};

const typeIcons: Record<string, React.ElementType> = {
  message: MessageSquare,
  report: FileText,
  alert: AlertTriangle,
  deadline: Calendar,
  system: Info,
};

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'urgent') return n.priority === 'urgent';
    return true;
  });

  const handleTap = (n: Notification) => {
    if (!n.is_read) markAsRead.mutate(n.id);
    if (expandedId === n.id) {
      setExpandedId(null);
    } else {
      setExpandedId(n.id);
    }
  };

  const handleAction = (url: string | null) => {
    if (url) navigate(url);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold">Notifications</h1>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()} disabled={markAllAsRead.isPending}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger value="urgent" className="flex-1">
              Urgent {notifications.filter(n => n.priority === 'urgent' && !n.is_read).length > 0 && `(${notifications.filter(n => n.priority === 'urgent' && !n.is_read).length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-3 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Loading...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold">You're all caught up!</h3>
                <p className="text-sm text-muted-foreground mt-1">No new notifications right now.<br />We'll let you know when something needs your attention. 🚛</p>
              </div>
            ) : (
              filtered.map((n) => {
                const prio = priorityConfig[n.priority] || priorityConfig.medium;
                const IconComp = typeIcons[n.type] || Info;
                const isExpanded = expandedId === n.id;

                return (
                  <Card
                    key={n.id}
                    className={cn(
                      'p-3 cursor-pointer transition-all border-l-4',
                      !n.is_read && 'bg-accent/30',
                      n.priority === 'urgent' && 'border-l-destructive',
                      n.priority === 'high' && 'border-l-orange-500',
                      n.priority === 'medium' && 'border-l-primary',
                      n.priority === 'low' && 'border-l-muted-foreground',
                    )}
                    onClick={() => handleTap(n)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('rounded-full p-1.5 mt-0.5', n.priority === 'urgent' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground')}>
                        <IconComp className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', prio.color)}>
                            {prio.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </span>
                          {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <p className="font-semibold text-sm truncate">{n.title}</p>
                        <p className={cn('text-xs text-muted-foreground', !isExpanded && 'truncate')}>{n.body}</p>
                        
                        {isExpanded && (
                          <div className="flex gap-2 mt-3">
                            {n.action_url && (
                              <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); handleAction(n.action_url); }}>
                                View Details
                              </Button>
                            )}
                            {!n.is_read && (
                              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); markAsRead.mutate(n.id); }}>
                                <Check className="h-3 w-3 mr-1" /> Read
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteNotification.mutate(n.id); }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Notifications;
