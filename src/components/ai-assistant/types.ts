export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  dbId?: string;
  feedbackGiven?: 'up' | 'down' | null;
}

export interface ConversationSummary {
  id: string;
  date: string;
  messageCount: number;
  firstMessage: string;
}

export interface QuickReply {
  label: string;
  emoji: string;
  message: string;
}

export interface PageContextInfo {
  greeting: string;
  quickReplies: QuickReply[];
}
