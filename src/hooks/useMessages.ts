import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface Message {
  id: string;
  fleet_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type: string;
  is_read: boolean;
  is_broadcast: boolean;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
  deleted_at: string | null;
}

export function useMessages(conversationUserId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-message-count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false)
        .is('deleted_at', null);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  // Conversations list (latest message per unique sender/receiver)
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;

      // Group by conversation partner
      const convMap = new Map<string, Message>();
      (data as Message[]).forEach((msg) => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!convMap.has(partnerId)) convMap.set(partnerId, msg);
      });
      return Array.from(convMap.entries()).map(([partnerId, lastMsg]) => ({
        partnerId,
        lastMessage: lastMsg,
        unread: (data as Message[]).filter(
          (m) => m.sender_id === partnerId && m.receiver_id === user.id && !m.is_read
        ).length,
      }));
    },
    enabled: !!user?.id,
  });

  // Messages for a specific conversation
  const { data: chatMessages = [], isLoading: chatLoading } = useQuery({
    queryKey: ['chat-messages', user?.id, conversationUserId],
    queryFn: async () => {
      if (!user?.id || !conversationUserId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .is('deleted_at', null)
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${conversationUserId}),and(sender_id.eq.${conversationUserId},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })
        .limit(200);
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user?.id && !!conversationUserId,
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: async ({
      receiverId,
      fleetId,
      message,
      messageType = 'text',
      isBroadcast = false,
      attachmentUrl,
      attachmentName,
    }: {
      receiverId: string;
      fleetId: string;
      message: string;
      messageType?: string;
      isBroadcast?: boolean;
      attachmentUrl?: string;
      attachmentName?: string;
    }) => {
      const { error } = await supabase.from('messages').insert({
        fleet_id: fleetId,
        sender_id: user!.id,
        receiver_id: receiverId,
        message,
        message_type: messageType,
        is_broadcast: isBroadcast,
        attachment_url: attachmentUrl || null,
        attachment_name: attachmentName || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
    },
  });

  // Mark as read
  const markAsRead = useMutation({
    mutationFn: async (senderId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', user!.id)
        .eq('sender_id', senderId)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['unread-message-count'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  return {
    unreadCount,
    conversations,
    conversationsLoading,
    chatMessages,
    chatLoading,
    sendMessage,
    markAsRead,
  };
}
