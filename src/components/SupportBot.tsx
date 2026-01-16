import { useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const SupportBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm here to help you with IFTA compliance questions. How can I assist you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const quickResponses = [
    "What is IFTA?",
    "How does mileage tracking work?",
    "Pricing information",
    "Contact support"
  ];

  const botResponses: { [key: string]: string } = {
    "what is ifta": "IFTA (International Fuel Tax Agreement) is a cooperative agreement between U.S. states and Canadian provinces to simplify fuel tax reporting for interstate motor carriers. Our platform calculates taxes by state and generates quarterly reports automatically!",
    "mileage tracking": "Our system tracks miles driven in each IFTA jurisdiction and calculates fuel taxes owed. You can manually enter trips or use GPS tracking when available.",
    "pricing": "We offer three plans: 7-day free trial, then $29/month for Starter (2 trucks), $59/month for Professional (10 trucks), and $129/month for Enterprise (unlimited trucks). All plans include quarterly IFTA reporting and audit defense tools!",
    "quarterly": "IFTA quarterly returns are due by the last day of the month following each quarter (April 30, July 31, October 31, January 31). Our system generates these reports automatically with state-by-state breakdowns.",
    "tax calculation": "We calculate IFTA taxes by tracking miles driven and gallons purchased in each jurisdiction. The system applies each state's tax rate and determines if you owe money or are due a refund.",
    "audit": "Our audit defense tools help you maintain proper records and respond to IFTA audits. We provide detailed trip logs, receipts management, and compliance documentation.",
    "states": "IFTA covers 48 U.S. states (excluding Alaska and Hawaii) plus 10 Canadian provinces. Each jurisdiction has different tax rates that our system tracks automatically.",
    "fuel receipts": "Keep all fuel receipts showing gallons purchased, location, date, and truck identification. Our AI-powered receipt scanner digitizes these automatically - just snap a photo!",
    "contact": "Reach our IFTA experts at support@true-trucker-ifta-pro.com or call 321-395-9957. Hours: Monday-Friday, 9AM-5PM EST. We're trucking professionals based in Apopka, FL.",
    "help": "I can explain IFTA requirements, our pricing plans, quarterly reporting deadlines, tax calculations, audit preparation, or connect you with our trucking experts. What do you need help with?",
    "default": "That's a great IFTA question! For detailed guidance, contact our trucking experts at support@true-trucker-ifta-pro.com or call 321-395-9957. We specialize in IFTA compliance and are here to help!"
  };

  const handleSendMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let response = botResponses.default;

      for (const [key, value] of Object.entries(botResponses)) {
        if (lowerText.includes(key)) {
          response = value;
          break;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
          aria-label="Open IFTA support chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
        
        {/* Notification Badge */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-96 bg-white rounded-lg shadow-2xl border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold">IFTA Support Bot</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
                aria-label="Close support chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.isBot
                        ? 'bg-muted text-foreground'
                        : 'bg-primary text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.isBot && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                      <p className="text-sm">{message.text}</p>
                      {!message.isBot && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Responses */}
            <div className="p-4 border-t">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {quickResponses.map((response) => (
                  <Button
                    key={response}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleSendMessage(response)}
                  >
                    {response}
                  </Button>
                ))}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && inputValue.trim()) {
                      handleSendMessage(inputValue.trim());
                    }
                  }}
                  placeholder="Type your question..."
                  className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={() => {
                    if (inputValue.trim()) {
                      handleSendMessage(inputValue.trim());
                    }
                  }}
                  size="sm"
                  className="px-3"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportBot;