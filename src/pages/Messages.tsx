import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMessages } from '@/hooks/useMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare, ArrowLeft, Send, Users, Check, CheckCheck,
  Megaphone, Search, Truck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import { cn } from '@/lib/utils';

const formatTime = (d: string) => {
  const date = new Date(d);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { conversations, conversationsLoading, chatMessages, chatLoading, sendMessage, markAsRead, unreadCount } = useMessages(activeChat ?? undefined);

  // Determine user's role context
  const { data: userFleet } = useQuery({
    queryKey: ['msg-user-fleet', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // Check if fleet owner
      const { data: owned } = await supabase.from('fleets').select('*').eq('owner_id', user.id).maybeSingle();
      if (owned) return { fleet: owned, role: 'fleet_owner' as const };
      // Check if driver
      const { data: membership } = await supabase.from('fleet_members').select('fleet_id, status').eq('driver_id', user.id).eq('status', 'active').maybeSingle();
      if (membership) {
        const { data: fleet } = await supabase.from('fleet_member_view').select('*').eq('id', membership.fleet_id).maybeSingle();
        return { fleet, role: 'driver' as const };
      }
      return null;
    },
    enabled: !!user?.id,
  });

  // Fetch fleet members for fleet owners
  const { data: fleetMembers = [] } = useQuery({
    queryKey: ['msg-fleet-members', userFleet?.fleet?.id],
    queryFn: async () => {
      if (!userFleet?.fleet?.id) return [];
      const { data } = await supabase.from('fleet_members').select('*').eq('fleet_id', userFleet.fleet.id).eq('status', 'active');
      return data ?? [];
    },
    enabled: !!userFleet?.fleet?.id && userFleet?.role === 'fleet_owner',
  });

  // Fetch profiles for conversation partners
  const partnerIds = useMemo(() => {
    const ids = new Set<string>();
    conversations.forEach(c => ids.add(c.partnerId));
    fleetMembers.forEach(m => ids.add(m.driver_id));
    if (userFleet?.fleet?.owner_id && userFleet.role === 'driver') ids.add(userFleet.fleet.owner_id);
    return Array.from(ids);
  }, [conversations, fleetMembers, userFleet]);

  const { data: partnerProfiles = [] } = useQuery({
    queryKey: ['msg-partner-profiles', partnerIds],
    queryFn: async () => {
      if (partnerIds.length === 0) return [];
      const { data } = await supabase.from('profiles').select('user_id, email, company_name').in('user_id', partnerIds);
      return data ?? [];
    },
    enabled: partnerIds.length > 0,
  });

  const profileMap = useMemo(() => {
    const m = new Map<string, { name: string; email: string }>();
    partnerProfiles.forEach(p => m.set(p.user_id, { name: p.company_name || p.email.split('@')[0], email: p.email }));
    return m;
  }, [partnerProfiles]);

  const memberMap = useMemo(() => {
    const m = new Map<string, typeof fleetMembers[0]>();
    fleetMembers.forEach(mem => m.set(mem.driver_id, mem));
    return m;
  }, [fleetMembers]);

  const getName = (id: string) => profileMap.get(id)?.name || id.slice(0, 8);
  const getTruck = (id: string) => memberMap.get(id)?.truck_number;

  // Mark messages as read when opening chat
  useEffect(() => {
    if (activeChat && user?.id) {
      markAsRead.mutate(activeChat);
    }
  }, [activeChat, user?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!messageInput.trim() || !activeChat || !userFleet?.fleet?.id) return;
    sendMessage.mutate({
      receiverId: activeChat,
      fleetId: userFleet.fleet.id,
      message: messageInput.trim(),
    });
    setMessageInput('');
  };

  const handleBroadcast = () => {
    if (!broadcastText.trim() || !userFleet?.fleet?.id) return;
    fleetMembers.forEach(member => {
      sendMessage.mutate({
        receiverId: member.driver_id,
        fleetId: userFleet.fleet!.id,
        message: broadcastText.trim(),
        isBroadcast: true,
      });
    });
    toast({ title: `📢 Broadcast sent to ${fleetMembers.length} driver${fleetMembers.length !== 1 ? 's' : ''}` });
    setBroadcastText('');
    setShowBroadcast(false);
  };

  const startNewChat = (driverId: string) => {
    setActiveChat(driverId);
    setShowBroadcast(false);
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(c => getName(c.partnerId).toLowerCase().includes(q));
  }, [conversations, search, profileMap]);

  // Build contact list for fleet owners (show all drivers even without messages)
  const contactList = useMemo(() => {
    if (userFleet?.role !== 'fleet_owner') return filteredConversations;
    const convPartners = new Set(conversations.map(c => c.partnerId));
    const extras = fleetMembers
      .filter(m => !convPartners.has(m.driver_id))
      .map(m => ({ partnerId: m.driver_id, lastMessage: null, unread: 0 }));
    const merged = [...filteredConversations, ...extras];
    if (!search.trim()) return merged;
    const q = search.toLowerCase();
    return merged.filter(c => getName(c.partnerId).toLowerCase().includes(q));
  }, [filteredConversations, fleetMembers, userFleet, search, profileMap]);

  // ─── Chat View ───
  if (activeChat) {
    const partnerName = getName(activeChat);
    const truck = getTruck(activeChat);
    return (
      <div className="min-h-screen bg-background flex flex-col pb-16 md:pb-0">
        {/* Chat header */}
        <div className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="container mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setActiveChat(null)}><ArrowLeft className="h-5 w-5" /></Button>
            <div className="flex-1">
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> {partnerName}
              </p>
              {truck && <p className="text-xs text-muted-foreground">Truck #{truck}</p>}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 container mx-auto">
          {chatLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-3/4" />)}</div>
          ) : chatMessages.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No messages yet. Say hello! 👋</p>
          ) : (
            chatMessages.map(msg => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 space-y-1',
                    isMine ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'
                  )}>
                    {msg.is_broadcast && (
                      <p className="text-xs opacity-70 flex items-center gap-1"><Megaphone className="h-3 w-3" /> Broadcast</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <div className={cn('flex items-center gap-1 text-xs', isMine ? 'justify-end opacity-70' : 'opacity-50')}>
                      <span>{formatTime(msg.created_at)}</span>
                      {isMine && (
                        msg.is_read
                          ? <CheckCheck className="h-3 w-3 text-blue-300" />
                          : <Check className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-16 md:bottom-0 bg-card border-t border-border p-3">
          <div className="container mx-auto flex gap-2">
            <Input
              placeholder="Type a message…"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!messageInput.trim() || sendMessage.isPending} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // ─── Conversation List ───
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Messages
                {unreadCount > 0 && <Badge className="bg-destructive text-destructive-foreground text-xs">{unreadCount}</Badge>}
              </h1>
              {userFleet?.fleet && <p className="text-xs text-muted-foreground">{userFleet.fleet.company_name}</p>}
            </div>
          </div>
          {userFleet?.role === 'fleet_owner' && (
            <Button size="sm" variant="outline" onClick={() => setShowBroadcast(!showBroadcast)}>
              <Megaphone className="h-4 w-4 mr-1" /> Broadcast
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 space-y-4">
        {/* Broadcast Panel */}
        {showBroadcast && userFleet?.role === 'fleet_owner' && (
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Megaphone className="h-4 w-4 text-primary" /> Broadcast to All Drivers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Type your message to all drivers…"
                value={broadcastText}
                onChange={e => setBroadcastText(e.target.value)}
                rows={3}
              />
              <Button onClick={handleBroadcast} disabled={!broadcastText.trim() || fleetMembers.length === 0} className="w-full sm:w-auto">
                <Send className="h-4 w-4 mr-2" /> Send to {fleetMembers.length} Driver{fleetMembers.length !== 1 ? 's' : ''}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search conversations…" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {/* No fleet */}
        {!userFleet?.fleet && !conversationsLoading && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>Join or create a fleet to start messaging.</p>
            </CardContent>
          </Card>
        )}

        {/* Conversation list */}
        {conversationsLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : contactList.length === 0 && userFleet?.fleet ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No conversations yet. {userFleet.role === 'fleet_owner' ? 'Message a driver to get started!' : 'Your fleet owner can message you.'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {contactList.map(conv => {
              const name = getName(conv.partnerId);
              const truck = getTruck(conv.partnerId);
              const isFleetOwner = userFleet?.fleet?.owner_id === conv.partnerId;
              return (
                <button
                  key={conv.partnerId}
                  onClick={() => startNewChat(conv.partnerId)}
                  className="w-full text-left p-4 rounded-lg bg-card border border-border hover:shadow-md transition-shadow flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {isFleetOwner ? <Truck className="h-5 w-5 text-primary" /> : <Users className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground truncate">{name}</p>
                      {isFleetOwner && <Badge variant="secondary" className="text-[10px]">Fleet Owner</Badge>}
                      {truck && <span className="text-xs text-muted-foreground">Truck #{truck}</span>}
                    </div>
                    {conv.lastMessage ? (
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage.sender_id === user?.id ? 'You: ' : ''}
                        {conv.lastMessage.is_broadcast ? '📢 ' : ''}
                        {conv.lastMessage.message}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No messages yet</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {conv.lastMessage && (
                      <span className="text-xs text-muted-foreground">{formatTime(conv.lastMessage.created_at)}</span>
                    )}
                    {conv.unread > 0 && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs h-5 min-w-[20px] px-1.5">{conv.unread}</Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;
