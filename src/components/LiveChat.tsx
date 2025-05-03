
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, MinusSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const LiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    const savedMessages = localStorage.getItem('gcoin-chat-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string dates back to Date objects
        const messagesWithDateObjects = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDateObjects);
      } catch (error) {
        console.error('Error parsing chat messages from localStorage', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('gcoin-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      sender: 'user',
      text: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    textareaRef.current?.focus();
    
    setIsLoading(true);
    
    // Check for "live chat" trigger phrase
    if (message.toLowerCase().includes('live chat')) {
      // Add bot response after a short delay
      setTimeout(() => {
        const botMessage: Message = {
          sender: 'bot',
          text: 'Please lay your complaint and we would respond to you within minutes.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
    } else {
      // For all other messages, simulate sending an email
      try {
        // In a real implementation, you'd use an API to send the email
        // Here we're just simulating it
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Send user's email, username, and message to gcoinwallet.com@gmail.com
        console.log(`Forwarding message to gcoinwallet.com@gmail.com:
          From: ${user?.email || 'Anonymous user'} (${user?.username || 'Unknown'})
          Message: ${message}`);
        
        // Add confirmation message
        const botMessage: Message = {
          sender: 'bot',
          text: 'Your message has been forwarded to our support team. We will get back to you shortly.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Show toast notification
        toast({
          title: "Message sent",
          description: "Your message has been forwarded to our support team.",
          variant: "default"
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error forwarding message:', error);
        
        // Add error message
        const botMessage: Message = {
          sender: 'bot',
          text: 'Sorry, there was an error sending your message. Please try again later.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg flex items-center justify-center bg-gcoin-blue hover:bg-gcoin-blue/90 z-50"
        size="icon"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl z-50 transition-all duration-300 overflow-hidden flex flex-col
        ${isMinimized ? 'h-14 w-80' : 'h-96 w-80'}`}
    >
      {/* Chat header */}
      <div 
        className="bg-gcoin-blue p-3 text-white flex items-center justify-between cursor-pointer"
        onClick={isMinimized ? minimizeChat : undefined}
      >
        <div className="flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">GCoin Support</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={minimizeChat} 
            className="h-6 w-6 text-white hover:bg-gcoin-blue/90"
          >
            <MinusSquare className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleChat} 
            className="h-6 w-6 text-white hover:bg-gcoin-blue/90"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                <MessageCircle className="h-8 w-8 mb-2 text-gcoin-blue/50" />
                <p className="text-sm">Welcome to GCoin Support!</p>
                <p className="text-xs mt-1">How can we help you today?</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`rounded-lg py-2 px-3 max-w-[80%] break-words ${
                      msg.sender === 'user' 
                        ? 'bg-gcoin-blue text-white rounded-br-none' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg py-2 px-3 bg-gray-100 text-gray-800 rounded-bl-none">
                  <div className="flex items-center space-x-1">
                    <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full"></div>
                    <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                    <div className="animate-bounce h-2 w-2 bg-gray-500 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <div className="p-3 border-t">
            <div className="flex items-center">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="resize-none flex-1 focus-visible:ring-1 focus-visible:ring-gcoin-blue"
                rows={1}
                style={{ maxHeight: '100px', overflow: 'auto' }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className="ml-2 h-10 w-10"
                size="icon"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LiveChat;
