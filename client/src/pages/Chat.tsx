import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import MessagesContainer from '@/components/MessagesContainer';
import ChatInput from '@/components/ChatInput';
import { useGetAgent, useCallAgent, useRenameAgent, useStreamAgent } from "@/queries/agents"
import type { Message } from '@/agent-schemas';
import { useQueryClient } from '@tanstack/react-query';
import { useGetContracts } from '@/queries/contracts';
import type { ContractBase } from '@/contract-schemas';

const getContractName = (contracts: ContractBase[] | undefined, contractId: string | undefined): string | undefined => {
  if (!contractId) return "No contract selected";
  if (!contracts) return "No contract selected";
  const contract = contracts.find(contract => contract.contract_id === contractId);
  return contract?.contract_name
}

const Chat: React.FC = () => {

  const queryClient = useQueryClient();
  const { chatId: agentId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();

  const { data: contracts, error: getContractsError } = useGetContracts();


  if (getContractsError?.cause === 401) {
    queryClient.clear()
    navigate("/");
    return null;
  }
  useEffect(() => {
    if (!agentId) {
      navigate("/account")
      return
    }
    agent.refetch()
  }, [agentId])


  const agent = useGetAgent(agentId || "")

  if (agent.error) {

    // check if the error is a 401 error
    if (agent.error.cause === 401) {
      queryClient.clear()
      navigate("/");
      return null;
    }

    console.error("Error fetching agent:", agent.error);
    navigate("/contracts");
    return null;
  }

  const contractName = getContractName(contracts, agent.data?.selected_contract)

  // sort the messages by created_at timestamp in ascending order
  const sortedMessages = agent.data?.messages?.sort((a, b) => a.created_at - b.created_at) || [];

  const [messages, setMessages] = useState<Message[]>(sortedMessages);

  useEffect(() => {
    setMessages(sortedMessages);
  }, [agentId])

  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingUpdate, setStreamingUpdate] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const agentCall = useCallAgent()

  const handleSendMessage = async () => {
    // add selected contracts to the agent's selected_contract field in the backend
    if (!agentId) return;
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      content: inputMessage,
      type: 'human',
      created_at: Date.now() / 1000, // adding this only for type purposes, the backend will set the actual timestamp
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsGenerating(true);


    agentCall.mutate({ agentId: agentId, message: inputMessage }, {
      onSuccess: (response) => {
        setMessages(prev => [...prev, response]);
        setIsGenerating(false);
      },
      onError: (error) => {
        console.error("Error calling agent:", error);

        // check if error is 401
        if (error.cause === 401) {
          queryClient.clear();
          navigate("/")
        }
        setIsGenerating(false);
      }
    })

  };

  const handleStreamMessage = async () => {
    if (!agentId) return;
    if (!inputMessage.trim()) return;

    useStreamAgent(agentId, inputMessage, setInputMessage, setIsGenerating, setMessages, setStreamingUpdate)

  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStreamMessage();
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
        <span className=' font-bold'>{contractName || "No contract selected"}</span>
      </div>


      <MessagesContainer messages={messages} isGenerating={isGenerating} streamingUpdate={streamingUpdate}  ref={messagesEndRef} />


      {/* Input Area */}
      <ChatInput
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        handleKeyPress={handleKeyPress}
        handleSendMessage={handleSendMessage}
        handleStreamMessage={handleStreamMessage}
        isGenerating={isGenerating}
        agentId={agentId || ""}
      />

    </div >
  );
};


export default Chat;