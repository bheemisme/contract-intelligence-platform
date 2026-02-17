
interface ChatInputProps {
    inputMessage: string;
    setInputMessage: React.Dispatch<React.SetStateAction<string>>;
    handleKeyPress: (e: React.KeyboardEvent) => void;
    handleSendMessage: () => void;
    handleStreamMessage: () => void;
    isGenerating: boolean;
    agentId: string;
}

const ChatInput = (props: ChatInputProps) => {

    return (
        <div className="flex space-x-2 px-2 pb-2 relative">
            <input
                type="text"
                value={props.inputMessage}
                onChange={(e) => props.setInputMessage(e.target.value)}
                onKeyUp={props.handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={props.isGenerating}
            />
            <button
                onClick={props.handleStreamMessage}
                disabled={!props.inputMessage.trim() || props.isGenerating}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Send
            </button>
        </div>
    );
};

export default ChatInput;