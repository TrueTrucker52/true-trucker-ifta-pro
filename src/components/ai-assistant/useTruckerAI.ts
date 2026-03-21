import { useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatMessage } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trucker-ai-chat`;

export function useTruckerAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { user, profile } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const escalationCountRef = useRef<Record<string, number>>({});

  const userName = profile?.company_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Driver';

  const startConversation = useCallback(async () => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({ user_id: user.id, page_context: location.pathname })
        .select('id')
        .single();
      if (error) throw error;
      setConversationId(data.id);
      return data.id;
    } catch (e) {
      console.error('Failed to start conversation:', e);
      return null;
    }
  }, [user, location.pathname]);

  const saveMessage = useCallback(async (convId: string, role: 'user' | 'assistant', content: string) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({ conversation_id: convId, user_id: user.id, role, content })
        .select('id')
        .single();
      if (error) throw error;
      return data.id;
    } catch (e) {
      console.error('Failed to save message:', e);
      return null;
    }
  }, [user]);

  const checkEscalation = useCallback((text: string): boolean => {
    const lw = text.toLowerCase();
    const frustrationWords = ['angry', 'frustrated', 'broken', 'wrong', 'not helpful', 'useless', 'terrible', 'awful'];
    if (frustrationWords.some(w => lw.includes(w))) return true;

    // Track repeated questions
    const key = lw.slice(0, 50);
    escalationCountRef.current[key] = (escalationCountRef.current[key] || 0) + 1;
    return escalationCountRef.current[key] >= 3;
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);

    let convId = conversationId;
    if (!convId) {
      convId = await startConversation();
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    if (convId) saveMessage(convId, 'user', text);

    // Check for escalation triggers
    const needsEscalation = checkEscalation(text);

    const allMessages = [...messages, userMsg].map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    if (needsEscalation) {
      allMessages.push({
        role: 'user' as const,
        content: '[SYSTEM: The user seems frustrated or has asked similar questions multiple times. Please offer to escalate to human support with contact options.]',
      });
    }

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantContent = '';
    const assistantId = (Date.now() + 1).toString();

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (sessionError || !accessToken) {
        throw new Error('You must be signed in to use the AI assistant.');
      }

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          userContext: {
            userName,
            userRole: profile?.subscription_tier || 'user',
            fleetName: profile?.company_name || 'Independent',
            currentPage: location.pathname,
          },
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error('No response stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && last.id === assistantId) {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, {
                  id: assistantId,
                  role: 'assistant' as const,
                  content: assistantContent,
                  timestamp: new Date(),
                }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Flush remaining
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev =>
                prev.map((m, i) =>
                  i === prev.length - 1 && m.id === assistantId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch { /* ignore */ }
        }
      }

      if (convId && assistantContent) {
        const dbId = await saveMessage(convId, 'assistant', assistantContent);
        if (dbId) {
          setMessages(prev =>
            prev.map(m => m.id === assistantId ? { ...m, dbId } : m)
          );
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      console.error('AI chat error:', e);
      const errorMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: "I'm having a bit of trouble right now. You can reach our support team at support@true-trucker-ifta-pro.com or call 321-395-9957. I'll be back shortly! 🔧",
        timestamp: new Date(),
      };
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.id === assistantId) {
          return prev.map((m, i) => i === prev.length - 1 ? errorMsg : m);
        }
        return [...prev, errorMsg];
      });
      toast({
        title: 'Connection issue',
        description: 'AI assistant is temporarily unavailable.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages, isLoading, conversationId, startConversation, saveMessage, userName, profile, location.pathname, checkEscalation, toast]);

  const submitFeedback = useCallback(async (messageId: string, dbMessageId: string | undefined, isHelpful: boolean, reason?: string) => {
    if (!user || !dbMessageId) return;
    setMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, feedbackGiven: isHelpful ? 'up' : 'down' } : m)
    );
    try {
      await supabase.from('chat_feedback').insert({
        message_id: dbMessageId,
        user_id: user.id,
        is_helpful: isHelpful,
        feedback_reason: reason || null,
      });
    } catch (e) {
      console.error('Failed to save feedback:', e);
    }
  }, [user]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    escalationCountRef.current = {};
  }, []);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    submitFeedback,
    clearMessages,
    cancelStream,
    userName,
  };
}
