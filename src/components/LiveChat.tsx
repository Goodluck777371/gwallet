
import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, MinusSquare, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

type Message = {
  id: string;
  sender: "user" | "support";
  text: string;
  timestamp: Date;
};

const SUPPORT_RESPONSES = [
  "Hello! How can I help you today?",
  "I understand your concern. Could you provide more details?",
  "Thank you for reaching out. Let me look into this for you.",
  "I'm checking your account details now. Just a moment please.",
  "We typically respond to all inquiries within 24 hours.",
  "You can also check our FAQ section for immediate answers to common questions.",
  "Is there anything else you'd like help with today?",
  "I've made a note of your feedback. We're constantly working to improve our services.",
];

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "support",
      text: "Hi there! How can we help you today?",
      timestamp: new Date(),
    },
  ]);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    // Simulate support response after delay
    setTimeout(() => {
      const randomResponse = SUPPORT_RESPONSES[Math.floor(Math.random() * SUPPORT_RESPONSES.length)];
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "support",
        text: randomResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, supportMessage]);
    }, 1000);
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized((prev) => !prev);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={toggleChat}
          className="h-12 w-12 rounded-full shadow-lg bg-gcoin-blue hover:bg-gcoin-blue/90 text-white"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      ) : (
        <div
          className={`bg-white rounded-lg shadow-xl flex flex-col transition-all duration-300 ease-in-out ${
            isMinimized ? "h-14 w-80" : "h-[450px] w-80"
          }`}
        >
          {/* Chat header */}
          <div
            className="bg-gcoin-blue text-white p-3 rounded-t-lg flex justify-between items-center cursor-pointer"
            onClick={toggleMinimize}
          >
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              <h3 className="font-medium">GCoin Support</h3>
            </div>
            <div className="flex items-center space-x-2">
              {isMinimized ? (
                <Maximize2 className="h-4 w-4 hover:text-gray-200" />
              ) : (
                <MinusSquare className="h-4 w-4 hover:text-gray-200" />
              )}
              <X
                className="h-4 w-4 hover:text-gray-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              />
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.sender === "user"
                          ? "bg-gcoin-blue text-white rounded-tr-none"
                          : "bg-gray-100 text-gray-800 rounded-tl-none"
                      }`}
                    >
                      {msg.sender === "support" && (
                        <div className="flex items-center mb-1">
                          <Avatar className="h-5 w-5 mr-1">
                            <div className="bg-gcoin-blue text-white rounded-full flex items-center justify-center text-xs font-bold">
                              G
                            </div>
                          </Avatar>
                          <span className="text-xs font-medium">Support</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <span className="text-xs opacity-70 block text-right mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-3 border-t">
                <div className="flex items-center">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 mr-2"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveChat;
