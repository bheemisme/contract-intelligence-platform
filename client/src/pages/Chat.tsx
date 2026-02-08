import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import MessagesContainer from '@/components/MessagesContainer';
import ChatInput from '@/components/ChatInput';
import { useGetAgent, useCallAgent } from "@/queries/agents"
import type { Message } from '@/agent-schemas';


const Chat: React.FC = () => {

  const { chatId: agentId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!agentId) {
      navigate("/account")
    }
  }, [])


  const agent = useGetAgent(agentId || "")
  useEffect(() => {
    if (agent.error) {
      console.error("Error fetching agent:", agent.error);
      navigate("/account");
    }
  }, [agent.isError])


  // sort the messages by created_at timestamp in ascending order
  const sortedMessages = agent.data?.messages?.sort((a, b) => a.created_at - b.created_at) || [];

  const [messages, setMessages] = useState<Message[]>(sortedMessages);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const agentCall = useCallAgent(agentId || "")


  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      content: inputMessage,
      type: 'human',
      created_at: Date.now() / 1000, // adding this only for type purposes, the backend will set the actual timestamp
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    agentCall.mutate(inputMessage, {
      onSuccess: (response) => {
        setMessages(prev => [...prev, response]);
        setIsTyping(false);
      }
    })


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
        <h1 className="text-xl font-semibold text-green-800">{agent.data?.name || "Chat"}</h1>
      </div>


      <MessagesContainer messages={messages} />

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

      <div className='py-2' ref={messagesEndRef} />


      {/* Input Area */}
      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleKeyPress={handleKeyPress}
        handleSendMessage={handleSendMessage}
        isTyping={isTyping}
        />

    </div >
  );
};


export default Chat;