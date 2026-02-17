import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import MessagesContainer from '@/components/MessagesContainer';
import ChatInput from '@/components/ChatInput';
import { useGetAgent, useCallAgent, useAddContractToAgent, useRenameAgent } from "@/queries/agents"
import type { Message } from '@/agent-schemas';
import { useQueryClient } from '@tanstack/react-query';
import { getContractName } from '@/cache-queries';

const Chat: React.FC = () => {

  const queryClient = useQueryClient();
  const { chatId: agentId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!agentId) {
      navigate("/account")
    }
  }, [agentId])


  const agent = useGetAgent(agentId || "")

  useEffect(() => {
    if (agent.error) {

      // check if the error is a 401 error
      if (agent.error.cause === 401) {
        queryClient.clear()
        navigate("/");
      }

      console.error("Error fetching agent:", agent.error);
      navigate("/contracts");
    }


  }, [agent.isError])

  useEffect(() => {
    agent.refetch();
  }, [agentId])


  // sort the messages by created_at timestamp in ascending order
  const sortedMessages = agent.data?.messages?.sort((a, b) => a.created_at - b.created_at) || [];

  const [messages, setMessages] = useState<Message[]>(sortedMessages);

  useEffect(() => {
    setMessages(sortedMessages);
  }, [agentId])

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedContract, setSelectedContract] = useState<string | null>(agent.data?.selected_contract || null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const agentCall = useCallAgent()
  const addContractToAgent = useAddContractToAgent(agentId || "")

  const handleSendMessage = async () => {
    // add selected contracts to the agent's selected_contract field in the backend
    if (!agentId) return;
    if ((!agent.data?.selected_contract || !agent.data?.selected_contract.length) && selectedContract && selectedContract.length != 0) {
      addContractToAgent.mutate({ agent_id: agentId, contract_id: selectedContract }, {
        onSuccess: () => {
          console.log("Contract added to agent successfully");
          queryClient.refetchQueries({ queryKey: ["agent", agentId] });
        },
        onError: (error) => {
          console.error("Error adding contract to agent:", error);

          // check if error is 401
          if (error.cause === 401) {
            queryClient.clear();
            navigate("/")
          }
        }
      })
    }
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      content: inputMessage,
      type: 'human',
      created_at: Date.now() / 1000, // adding this only for type purposes, the backend will set the actual timestamp
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);


    agentCall.mutate({ agentId: agentId, message: inputMessage }, {
      onSuccess: (response) => {
        setMessages(prev => [...prev, response]);
        setIsTyping(false);
      },
      onError: (error) => {
        console.error("Error calling agent:", error);

        // check if error is 401
        if (error.cause === 401) {
          queryClient.clear();
          navigate("/")
        }
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

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(agent.data?.name || "");
  const renameAgent = useRenameAgent(agentId || "");

  const handleRename = async () => {
    renameAgent.mutate({ new_name: newName }, {
      onSuccess: (response) => {
        console.log("Agent renamed successfully:", response);
        // Update the agent data in the UI
        agent.refetch();
      },
      onError: (error) => {
        console.error("Error renaming agent:", error);
        // check if error is 401
        if (error.cause === 401) {
          queryClient.clear();
          navigate("/")
        }
      },
      onSettled: () => {
        setIsRenaming(false);
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white border-b border-green-200 px-4 py-3 shadow-sm ">
        <div className='flex flex-row items-center space-x-4'>
          {!isRenaming ? <h1 className="text-xl font-semibold text-green-800">{agent.data?.name || "Chat"}</h1> : (
            <input type="text" className='outline-none border-2 border-green-200 px-2 py-1' value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(event) => {
              console.log("Key pressed:", event.key);
              if (event.key === "Enter") {
                handleRename();
              }
            }} />
          )}

          <button onClick={() => setIsRenaming(!isRenaming)} className='cursor-pointer'><svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.005 5.995h-1v2h1v8h-1v2h1c1.103 0 2-.897 2-2v-8c0-1.102-.898-2-2-2zm-14 4H15v4H6.005z" /><path d="M17.005 17.995V4H20V2h-8v2h3.005v1.995h-11c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h11V20H12v2h8v-2h-2.995v-2.005zm-13-2v-8h11v8h-11z" /></svg></button>

        </div>
        <span className=' font-bold'>{getContractName(queryClient, agent.data?.selected_contract) || "No contract selected"}</span>
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
        selectedContract={selectedContract}
        setSelectedContract={setSelectedContract}
        agentId={agentId || ""}
      />

    </div >
  );
};


export default Chat;