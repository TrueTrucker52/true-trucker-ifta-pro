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
    "what is ifta": "IFTA (International Fuel Tax Agreement) is a cooperative agreement between U.S. states and Canadian provinces to simplify fuel tax reporting for interstate motor carriers. Our app helps you track mileage and calculate taxes automatically!",
    "mileage tracking": "Our app automatically tracks your miles using GPS and allows manual entry. It calculates fuel tax by state/province and generates quarterly reports for IFTA compliance.",
    "pricing": "We offer three plans: Small Fleet ($20/month for 1-3 trucks), Medium Fleet ($40/month for 4-7 trucks), and Large Fleet ($75/month for 8-12 trucks). All plans include a 30-day money-back guarantee!",
    "contact": "You can reach our support team at support@truetruckerifta.com or call 321-395-9957. Our hours are Monday-Friday, 9AM-5PM EST. We're based in Apopka, FL.",
    "help": "I can help you with IFTA questions, explain our features, provide pricing information, or connect you with human support. What would you like to know?",
    "default": "I understand you're asking about that topic. For detailed assistance, please contact our support team at support@truetruckerifta.com or call 321-395-9957. Our trucking experts are ready to help!"
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