import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router';
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const Chat: React.FC = () => {
  const { chatId } = useParams<{ chatId?: string }>();

  // Determine chat type and initial setup
  const getChatConfig = (id?: string) => {
    switch (id) {
      case 'general':
        return {
          title: 'General Chat',
          description: 'General conversation with the Contract Intelligence Assistant',
          initialMessage: 'Hello! I\'m your Contract Intelligence Assistant. How can I help you with general questions today?',
          responses: [
            "I understand you're asking about contracts. Could you provide more specific details?",
            "That's an interesting question about contract analysis. Let me help you with that.",
            "Based on your query, I can assist with contract review and analysis. What specific aspect would you like to focus on?",
            "I can help you analyze contracts, extract key information, and provide insights. What would you like to know?",
            "Contract intelligence is my specialty! Feel free to ask me anything about your legal documents.",
          ]
        };
      case 'contracts':
        return {
          title: 'Contract Chat',
          description: 'Specialized chat for contract analysis and review',
          initialMessage: 'Welcome to Contract Chat! I specialize in analyzing legal contracts. What contract would you like me to help you with?',
          responses: [
            "I'd be happy to help you analyze this contract. Could you tell me what specific aspects you'd like me to focus on?",
            "Contract analysis is my expertise. Let me review the key terms and clauses for you.",
            "I can help identify important clauses, potential risks, and key obligations in your contract. What would you like to know?",
            "Let me examine the contract details. I can provide insights on terms, conditions, and potential areas of concern.",
            "Contract review complete! I've analyzed the key provisions. Would you like me to explain any specific sections?",
          ]
        };
      case 'analysis':
        return {
          title: 'Analysis Chat',
          description: 'Deep analysis and insights for contract intelligence',
          initialMessage: 'Welcome to Analysis Chat! I provide detailed contract analysis and strategic insights. What would you like to analyze?',
          responses: [
            "Let me perform a comprehensive analysis of your contract. I'll examine legal implications, risk factors, and strategic considerations.",
            "Analysis in progress... I'm reviewing the contract for compliance, fairness, and potential optimizations.",
            "My analysis reveals several key insights about this contract. Let me break down the most important findings.",
            "I've completed a thorough analysis. The contract appears to have these strengths and potential areas for improvement.",
            "Strategic analysis complete! Here are my recommendations based on industry best practices and legal standards.",
          ]
        };
      default:
        return {
          title: 'Contract Intelligence Chat',
          description: 'Ask me anything about your contracts',
          initialMessage: 'Hello! I\'m your Contract Intelligence Assistant. How can I help you today?',
          responses: [
            "I understand you're asking about contracts. Could you provide more specific details?",
            "That's an interesting question about contract analysis. Let me help you with that.",
            "Based on your query, I can assist with contract review and analysis. What specific aspect would you like to focus on?",
            "I can help you analyze contracts, extract key information, and provide insights. What would you like to know?",
            "Contract intelligence is my specialty! Feel free to ask me anything about your legal documents.",
          ]
        };
    }
  };

  const chatConfig = getChatConfig(chatId);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: chatConfig.initialMessage,
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const generateAIResponse = (userInput: string): string => {
    return chatConfig.responses[Math.floor(Math.random() * chatConfig.responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white border-b border-green-200 px-4 py-3 shadow-sm">
        <h1 className="text-xl font-semibold text-green-800">{chatConfig.title}</h1>
        <p className="text-sm text-green-600">{chatConfig.description}</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-white text-green-800 rounded-bl-none border border-green-200'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-green-100' : 'text-green-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-green-800 rounded-lg rounded-bl-none border border-green-200 px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-green-200 px-4 py-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyUp={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-green-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default Chat;