"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaRobot, FaUser, FaPaperPlane, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  text: string;
  sender: "user" | "support";
  timestamp: Date;
}

const SupportChat: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supportResponses = [
    "Thank you for contacting support! How can I help you today?",
    "I understand your concern. Let me help you with that.",
    "That's a great question! Here's what I can tell you:",
    "I'm here to assist you. Can you provide more details about your issue?",
    "Let me check our knowledge base for the best solution.",
    "I'll escalate this to our technical team if needed.",
    "Is there anything else I can help you with?",
    "Thank you for your patience. Here's what I found:",
  ];

  const quickReplies = [
    "Account Issues",
    "Payment Problems",
    "Technical Support",
    "Feature Request",
    "Bug Report",
    "General Question"
  ];

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: Message = {
      id: "1",
      text: "Hello! I'm your support assistant. How can I help you today?",
      sender: "support",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate support response
    setTimeout(() => {
      const randomResponse = supportResponses[Math.floor(Math.random() * supportResponses.length)];
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: "support",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  return (
    <div className="h-[70vh] flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <FaRobot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Support Chat</h2>
              <p className="text-sm text-gray-400">We&apos;re here to help</p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-100"
              }`}
            >
              <div className="flex items-start gap-2">
                {message.sender === "support" && (
                  <FaRobot className="w-4 h-4 mt-1 flex-shrink-0" />
                )}
                {message.sender === "user" && (
                  <FaUser className="w-4 h-4 mt-1 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <FaRobot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-3">Quick replies:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-sm rounded-full transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
          >
            <FaPaperPlane className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportChat;
