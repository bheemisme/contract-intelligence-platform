import { useGetContracts } from "@/queries/contracts";
import { useState } from "react";
const ChatInput = ({ inputMessage, setInputMessage, handleKeyPress, handleSendMessage, isTyping }: {
    inputMessage: string;
    setInputMessage: React.Dispatch<React.SetStateAction<string>>;
    handleKeyPress: (e: React.KeyboardEvent) => void;
    handleSendMessage: () => void;
    isTyping: boolean;
}) => {
    // add a pin button that when clicked, should list all contracts of user in a dropdown
    const { data: contracts } = useGetContracts();
    const contractNames = contracts?.map((contract) => {
        console.log("Contract:", contract);
        return contract.contract_name
    }) || [];

    const [displayPinOptions, setDisplayPinOptions] = useState(false);
    const dropdownRef = useState<HTMLSelectElement | null>(null)[0];

    return (
        <div className="flex space-x-2 px-2 pb-2">
            {/* dropdown to select contract to pin, for now just alert the contract names */}
            <select className={"px-2 py-2 bg-green-600 text-white rounded-lg outline-none w-16"} onChange={(e) => alert(`Selected contract: ${e.target.value}`)} ref={dropdownRef} s>
                <option value="" disabled selected hidden>Pin</option>
                {contractNames.map((name, idx) => (
                    <option key={idx} value={name}>{name}</option>
                ))}
            </select>
           
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
    );
};

export default ChatInput;