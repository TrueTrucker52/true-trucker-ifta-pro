import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Minimize2, Send, Mic, MicOff, Truck, MessageCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { usePageContext } from './usePageContext';
import { useTruckerAI } from './useTruckerAI';
import ChatMessageBubble from './ChatMessageBubble';
import { supabase } from '@/integrations/supabase/client';
import { ConversationSummary } from './types';

const TruckerAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pastConversations, setPastConversations] = useState<ConversationSummary[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const { messages, isLoading, sendMessage, submitFeedback, clearMessages, userName } = useTruckerAI();
  const pageContext = usePageContext(userName);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  }, [inputValue, isLoading, sendMessage]);

  const handleQuickReply = useCallback((msg: string) => {
    sendMessage(msg);
  }, [sendMessage]);

  // Voice input
  const toggleVoice = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
      // Auto-send after voice input
      setTimeout(() => {
        sendMessage(transcript);
        setInputValue('');
      }, 300);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, sendMessage]);

  // Load chat history
  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('chat_conversations')
        .select('id, created_at, message_count, page_context')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setPastConversations(data.map(c => ({
          id: c.id,
          date: new Date(c.created_at).toLocaleDateString(),
          messageCount: c.message_count,
          firstMessage: c.page_context || 'General',
        })));
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }, [user]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setShowHistory(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setShowHistory(false);
  };

  // Don't show for non-logged-in users
  if (!user) return null;

  const hasVoiceSupport = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed z-50"
            style={{
              bottom: isMobile ? '80px' : '24px',
              right: '16px',
            }}
          >
            <button
              onClick={handleOpen}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#f97316' }}
              aria-label="Open TruckerAI Assistant"
            >
              <div className="relative">
                <Truck className="h-5 w-5 text-white" />
                <MessageCircle className="h-3 w-3 text-white absolute -bottom-1 -right-1.5" />
              </div>
            </button>
            {/* Pulse indicator */}
            <span className="absolute top-0 right-0 h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized bar */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-50 cursor-pointer"
            style={{
              bottom: isMobile ? '80px' : '24px',
              right: '16px',
            }}
            onClick={() => setIsMinimized(false)}
          >
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#f97316' }}
            >
              <Truck className="h-4 w-4" />
              <span>TruckerAI</span>
              {isLoading && <span className="animate-pulse">...</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-50 flex flex-col bg-background border shadow-2xl ${
              isMobile
                ? 'inset-0 rounded-none'
                : 'bottom-6 right-4 w-[380px] h-[560px] rounded-2xl'
            }`}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-t-2xl"
              style={{ backgroundColor: '#f97316' }}
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">🚛 TruckerAI Assistant</h3>
                  <p className="text-white/80 text-[10px]">● Online — Always here</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowHistory(!showHistory);
                    if (!showHistory) loadHistory();
                  }}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  aria-label="Chat history"
                >
                  <History className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  aria-label="Minimize"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* History Panel */}
            {showHistory && (
              <div className="border-b bg-muted/50 p-3 max-h-48 overflow-y-auto">
                <p className="text-xs font-medium text-foreground mb-2">📋 Recent Conversations</p>
                {pastConversations.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No previous conversations</p>
                ) : (
                  pastConversations.map(c => (
                    <div key={c.id} className="text-xs py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{c.date}</span>
                      <span className="ml-2 text-foreground">{c.firstMessage}</span>
                      <span className="ml-1 text-muted-foreground">({c.messageCount} msgs)</span>
                    </div>
                  ))
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs h-7"
                  onClick={() => { clearMessages(); setShowHistory(false); }}
                >
                  Start New Conversation
                </Button>
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {/* Welcome message if no messages */}
              {messages.length === 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm bg-muted text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {pageContext.greeting}
                    {'\n\n'}I can help you with:{'\n'}
                    📋 IFTA filing questions{'\n'}
                    📍 Mileage tracking help{'\n'}
                    📷 BOL scanning guidance{'\n'}
                    💰 Tax calculations{'\n'}
                    🚛 Fleet management help{'\n'}
                    📅 Filing deadlines{'\n\n'}
                    What do you need help with?
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  onFeedback={submitFeedback}
                />
              ))}

              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start mb-3">
                  <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-muted text-muted-foreground text-sm">
                    <span className="inline-flex items-center gap-1">
                      TruckerAI is typing
                      <span className="inline-flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length === 0 && (
              <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {pageContext.quickReplies.map((qr) => (
                    <button
                      key={qr.label}
                      onClick={() => handleQuickReply(qr.message)}
                      className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
                    >
                      {qr.emoji} {qr.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic quick replies after AI response */}
            {messages.length > 0 && !isLoading && messages[messages.length - 1]?.role === 'assistant' && (
              <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {getFollowUpReplies(messages[messages.length - 1].content).map((qr) => (
                    <button
                      key={qr.label}
                      onClick={() => handleQuickReply(qr.message)}
                      className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors whitespace-nowrap"
                    >
                      {qr.emoji} {qr.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 border-t bg-background">
              <div className="flex items-center gap-2">
                {hasVoiceSupport && (
                  <button
                    onClick={toggleVoice}
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                    aria-label={isListening ? 'Stop listening' : 'Voice input'}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isListening ? 'Listening...' : 'Type your question...'}
                  className="flex-1 px-3 py-2.5 border rounded-full text-sm bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                  disabled={isListening}
                  style={{ fontSize: '16px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#f97316' }}
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              {isListening && (
                <p className="text-[10px] text-center text-red-500 mt-1 animate-pulse">
                  🎤 Listening... speak your question
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Generate contextual follow-up quick replies based on last AI response
function getFollowUpReplies(content: string) {
  const lower = content.toLowerCase();

  if (lower.includes('deadline') || lower.includes('due')) {
    return [
      { label: 'Start my report', emoji: '📋', message: 'Help me start my IFTA report now' },
      { label: 'Set a reminder', emoji: '⏰', message: 'How can I set a reminder for the deadline?' },
      { label: 'What do I need?', emoji: '📝', message: 'What do I need to file my IFTA report?' },
    ];
  }
  if (lower.includes('tax') || lower.includes('owe') || lower.includes('calculation')) {
    return [
      { label: 'State breakdown', emoji: '🗺️', message: 'Can you break it down by state?' },
      { label: 'Reduce taxes', emoji: '💡', message: 'Any tips to reduce my IFTA tax?' },
      { label: 'File now', emoji: '📋', message: 'Help me file my report now' },
    ];
  }
  if (lower.includes('scan') || lower.includes('receipt') || lower.includes('bol')) {
    return [
      { label: 'Go to scanner', emoji: '📷', message: 'Take me to the receipt scanner' },
      { label: 'Scan tips', emoji: '💡', message: 'Tips for getting a clear scan?' },
      { label: 'Missing receipts', emoji: '📄', message: "I'm missing some receipts" },
    ];
  }
  if (lower.includes('fleet') || lower.includes('driver')) {
    return [
      { label: 'Add driver', emoji: '👤', message: 'How do I add a new driver?' },
      { label: 'Invite code', emoji: '🔑', message: "What's my fleet invite code?" },
      { label: 'Fleet reports', emoji: '📊', message: 'Show me fleet-wide reports' },
    ];
  }

  // Default follow-ups
  return [
    { label: 'IFTA Help', emoji: '📋', message: 'Tell me more about IFTA filing' },
    { label: 'My deadline', emoji: '📅', message: 'When is my next deadline?' },
    { label: 'Contact support', emoji: '💬', message: 'I need to speak to a human' },
  ];
}

export default TruckerAIAssistant;
