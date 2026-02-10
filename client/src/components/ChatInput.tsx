import { useState } from "react";
import { useGetAgent } from "@/queries/agents";
import { useGetContracts } from "@/queries/contracts";

interface ChatInputParams {
    inputMessage: string;
    setInputMessage: React.Dispatch<React.SetStateAction<string>>;
    handleKeyPress: (e: React.KeyboardEvent) => void;
    handleSendMessage: () => void;
    isTyping: boolean;
    selectedContract: string | null;
    setSelectedContract: React.Dispatch<React.SetStateAction<string | null>>;
    agentId: string;
}

const ChatInput = (params: ChatInputParams) => {
    const { data: agent } = useGetAgent(params.agentId);
      const { data: contracts } = useGetContracts();
    
    const [displayPin, setDisplayPin] = useState(false);

    return (
        <div className="flex space-x-2 px-2 pb-2 relative">
            {
                !agent?.selected_contract && (<button className="text-center border-green-400 border-2 rounded-2xl px-2 py-2 cursor-pointer hover:bg-gray-200" onClick={() => setDisplayPin(!displayPin)}>Pin</button>)
            }

            <div className={displayPin ? "absolute bottom-15 left-2 px-2 py-2 rounded-lg outline-none border-2 border-green-200 space-y-2" : "hidden"}>
                {contracts ? contracts.map((ct, idx) => {
                    // check if the contract is already selected
                    const isSelected = params.selectedContract === ct.contract_id;
                    return (
                        <div className={isSelected ? "px-1 py-1 border-b border-green-200 cursor-pointer hover:bg-gray-100 rounded-lg bg-green-100" : "px-1 py-1 border-b border-green-200 cursor-pointer hover:bg-gray-100 rounded-lg"} key={idx} onClick={() => {
                            params.setSelectedContract((prev) => {
                                if (prev === ct.contract_id) {
                                    return prev;
                                } else {
                                    return ct.contract_id;
                                }
                            });
                        }}>{ct.contract_name}</div>
                    )
                }) : <div className="px-1 py-1">no contracts uploaded</div>
                }
            </div>
            <input
                type="text"
                value={params.inputMessage}
                onChange={(e) => params.setInputMessage(e.target.value)}
                onKeyUp={params.handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={params.isTyping}
            />
            <button
                onClick={params.handleSendMessage}
                disabled={!params.inputMessage.trim() || params.isTyping}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Send
            </button>
        </div>
    );
};

export default ChatInput;