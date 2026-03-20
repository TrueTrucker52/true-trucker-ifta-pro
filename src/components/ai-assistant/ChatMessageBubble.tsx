import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from './types';
import { useNavigate } from 'react-router-dom';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onFeedback: (messageId: string, dbId: string | undefined, isHelpful: boolean, reason?: string) => void;
}

const feedbackReasons = [
  'Did not understand my question',
  'Answer was not accurate',
  'Too long or confusing',
  'Missing information',
];

const NAV_LINK_REGEX = /\[NAV:(\/[^\|]+)\|([^\]]+)\]/g;

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, onFeedback }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const navigate = useNavigate();
  const isBot = message.role === 'assistant';

  const renderContent = (content: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(NAV_LINK_REGEX.source, 'g');

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={lastIndex}>{content.slice(lastIndex, match.index)}</span>
        );
      }
      const path = match[1];
      const label = match[2];
      parts.push(
        <Button
          key={match.index}
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-1 my-1 text-xs h-auto py-1 px-2 border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => navigate(path)}
        >
          <ExternalLink className="h-3 w-3" />
          {label}
        </Button>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(<span key={lastIndex}>{content.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      <div className={`max-w-[85%] ${isBot ? '' : ''}`}>
        <div
          className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isBot
              ? 'bg-muted text-foreground rounded-bl-sm'
              : 'bg-primary text-primary-foreground rounded-br-sm'
          }`}
        >
          {isBot ? renderContent(message.content) : message.content}
        </div>

        {/* Feedback for bot messages */}
        {isBot && message.content && !message.feedbackGiven && (
          <div className="flex items-center gap-1 mt-1 ml-1">
            <span className="text-[10px] text-muted-foreground">Helpful?</span>
            <button
              onClick={() => onFeedback(message.id, message.dbId, true)}
              className="p-0.5 text-muted-foreground hover:text-green-600 transition-colors"
              aria-label="Helpful"
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => setShowFeedbackForm(true)}
              className="p-0.5 text-muted-foreground hover:text-red-500 transition-colors"
              aria-label="Not helpful"
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}

        {message.feedbackGiven === 'up' && (
          <div className="text-[10px] text-green-600 ml-1 mt-0.5">Thanks! 👍</div>
        )}
        {message.feedbackGiven === 'down' && !showFeedbackForm && (
          <div className="text-[10px] text-muted-foreground ml-1 mt-0.5">Thanks for the feedback</div>
        )}

        {/* Feedback form */}
        {showFeedbackForm && (
          <div className="mt-2 p-2 bg-muted rounded-lg text-xs space-y-1.5">
            <p className="font-medium text-foreground">What went wrong?</p>
            {feedbackReasons.map((reason) => (
              <button
                key={reason}
                className="block w-full text-left px-2 py-1.5 rounded hover:bg-background transition-colors text-muted-foreground"
                onClick={() => {
                  onFeedback(message.id, message.dbId, false, reason);
                  setShowFeedbackForm(false);
                }}
              >
                {reason}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
